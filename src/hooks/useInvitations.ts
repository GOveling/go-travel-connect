import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendInvitationParams {
  tripId: string;
  email: string;
  role: 'editor' | 'viewer';
  message?: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
  trip_id: string;
  trip: {
    id: string;
    name: string;
  };
}

export const useInvitations = () => {
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const { toast } = useToast();

  const sendInvitation = async ({ tripId, email, role, message }: SendInvitationParams) => {
    setLoading(true);
    try {
      // Validate permissions first
      const { data: permissions } = await supabase
        .from('trips')
        .select('user_id, is_group_trip')
        .eq('id', tripId)
        .single();
        
      if (!permissions) {
        throw new Error('No tienes permisos para invitar');
      }

      const { data, error } = await supabase.functions.invoke('send-trip-invitation', {
        body: {
          tripId,
          email: email.toLowerCase().trim(),
          role,
          message
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to send invitation');
      }

      toast({
        title: "Invitación enviada",
        description: `Invitación enviada a ${email} exitosamente`,
      });

      // Update local state and emit event
      window.dispatchEvent(new CustomEvent('invitationSent'));
      
      // Refresh invitations list
      await fetchInvitations(tripId);

      return data;
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Error al enviar la invitación",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async (tripId: string) => {
    try {
      const { data, error } = await supabase
        .from('trip_invitations')
        .select(`
          *,
          trips!trip_invitations_trip_id_fkey(
            id,
            name
          ),
          profiles!trip_invitations_inviter_id_fkey(
            full_name
          )
        `)
        .eq('trip_id', tripId)
        .in('status', ['pending', 'accepted', 'declined'])
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('Raw invitations data from useInvitations:', data);

      // Transform the data to ensure trip name is available
      const processedInvitations = (data || []).map((invitation: any) => ({
        ...invitation,
        trip: invitation.trips || { id: tripId, name: 'Unknown Trip' },
        inviter_name: invitation.profiles?.full_name || 'Unknown User'
      }));

      setInvitations(processedInvitations);
      
      // Log for debugging
      console.log('Processed invitations from useInvitations:', processedInvitations);
      
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
      toast({
        title: "Error",
        description: "Error al cargar las invitaciones",
        variant: "destructive",
      });
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('trip_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) {
        throw error;
      }

      toast({
        title: "Invitación cancelada",
        description: "La invitación ha sido cancelada exitosamente",
      });

      // Remove cancelled invitation from local state (since we only show active ones)
      setInvitations(prev => 
        prev.filter(inv => inv.id !== invitationId)
      );
    } catch (error: any) {
      console.error('Error cancelling invitation:', error);
      toast({
        title: "Error",
        description: "Error al cancelar la invitación",
        variant: "destructive",
      });
    }
  };

  const acceptInvitation = async (token: string) => {
    try {
      console.log("🎫 Aceptando invitación con token:", token.substring(0, 10) + '...');
      setLoading(true);

      // 1. Buscar la invitación por token
      const { data: invitation, error: fetchError } = await supabase
        .from('trip_invitations')
        .select(`
          *,
          trips!trip_invitations_trip_id_fkey (
            id,
            name,
            destination,
            dates,
            status,
            is_group_trip
          )
        `)
        .eq('token', token)
        .single();

      console.log("📋 Invitación encontrada:", invitation);
      console.log("❌ Error al buscar invitación:", fetchError);

      if (fetchError || !invitation) {
        console.error("Error fetching invitation:", fetchError);
        toast({
          title: "Error",
          description: "No se encontró la invitación",
          variant: "destructive",
        });
        return { success: false, error: "No se encontró la invitación" };
      }

      // 2. Verificar que el usuario actual corresponde al destinatario
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para aceptar invitaciones",
          variant: "destructive",
        });
        return { success: false, error: "Usuario no autenticado" };
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('email, onboarding_completed, full_name')
        .eq('id', userData.user.id)
        .single();

      console.log("👤 Email del usuario:", profileData?.email);
      console.log("📧 Email en la invitación:", invitation.email);

      if (!profileData) {
        return { 
          success: false, 
          requiresProfile: true,
          error: "Necesitas crear tu perfil antes de aceptar invitaciones"
        };
      }

      if (!profileData.onboarding_completed) {
        return { 
          success: false, 
          requiresOnboarding: true, 
          token,
          error: "Necesitas completar tu perfil antes de aceptar invitaciones"
        };
      }

      if (profileData.email?.toLowerCase() !== invitation.email?.toLowerCase()) {
        console.error("❌ Email mismatch:", {
          userEmail: profileData.email,
          invitationEmail: invitation.email
        });
        toast({
          title: "Error",
          description: "Esta invitación no fue enviada a tu cuenta",
          variant: "destructive",
        });
        return { success: false, error: "Esta invitación no fue enviada a tu cuenta" };
      }

      // 3. Verificar que la invitación está pendiente
      if (invitation.status !== 'pending') {
        console.error("❌ Invitación ya respondida:", invitation.status);
        const message = invitation.status === 'accepted' ? 
          "Esta invitación ya fue aceptada" : 
          "Esta invitación ya fue procesada";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
        return { success: false, error: message };
      }

      // 4. Verificar que la invitación no ha expirado
      const now = new Date();
      const expiresAt = new Date(invitation.expires_at);
      if (now > expiresAt) {
        console.error("❌ Invitación expirada:", { expiresAt, now });
        toast({
          title: "Error",
          description: "Esta invitación ha expirado",
          variant: "destructive",
        });
        return { success: false, error: "Esta invitación ha expirado" };
      }

      // 5. Actualizar la invitación a accepted
      const { error: updateError } = await supabase
        .from('trip_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by: userData.user.id
        })
        .eq('id', invitation.id);

      if (updateError) {
        console.error("❌ Error updating invitation:", updateError);
        toast({
          title: "Error",
          description: "Error al actualizar la invitación",
          variant: "destructive",
        });
        return { success: false, error: "Error al actualizar la invitación" };
      }

      // 6. Agregar al usuario como colaborador del viaje
      const { error: collaboratorError } = await supabase
        .from('trip_collaborators')
        .insert({
          trip_id: invitation.trip_id,
          user_id: userData.user.id,
          role: invitation.role,
          email: profileData.email,
          name: profileData.full_name
        });

      if (collaboratorError) {
        console.error("❌ Error adding collaborator:", collaboratorError);
        toast({
          title: "Error",
          description: "Error al agregarte como colaborador",
          variant: "destructive",
        });
        return { success: false, error: "Error al agregarte como colaborador" };
      }

      // 7. Actualizar el viaje a grupo si es necesario
      if (!invitation.trips?.is_group_trip) {
        await supabase
          .from('trips')
          .update({ is_group_trip: true })
          .eq('id', invitation.trip_id);
      }

      console.log("✅ Invitación aceptada exitosamente");
      toast({
        title: "Invitación aceptada",
        description: `¡Te has unido al viaje "${invitation.trips?.name || 'Viaje'}"!`,
      });

      return {
        success: true,
        trip: invitation.trips,
        userRole: invitation.role,
        onboardingCompleted: true
      };

    } catch (error: any) {
      console.error("❌ Error inesperado:", error);
      toast({
        title: "Error",
        description: "Error inesperado al aceptar la invitación",
        variant: "destructive",
      });
      return { success: false, error: "Error inesperado" };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    invitations,
    sendInvitation,
    fetchInvitations,
    cancelInvitation,
    acceptInvitation
  };
};