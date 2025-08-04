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
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('accept-trip-invitation', {
        body: { token }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        // Handle specific error cases
        if (data.requiresOnboarding) {
          return {
            success: false,
            requiresOnboarding: true,
            token: data.token,
            error: data.error
          };
        }

        if (data.requiresProfile) {
          return {
            success: false,
            requiresProfile: true,
            error: data.error
          };
        }

        throw new Error(data.error || 'Failed to accept invitation');
      }

      toast({
        title: "Invitación aceptada",
        description: "Te has unido al viaje exitosamente",
      });

      // Note: fetchInvitations refresh will be handled by the parent component
      // that manages the invitation acceptance flow

      return data;
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      
      // Don't show toast for onboarding/profile issues - let UI handle it
      if (!error.message?.includes('onboarding') && !error.message?.includes('profile')) {
        toast({
          title: "Error",
          description: error.message || "Error al aceptar la invitación",
          variant: "destructive",
        });
      }
      
      throw error;
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