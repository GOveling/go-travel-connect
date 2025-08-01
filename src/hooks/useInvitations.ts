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
}

export const useInvitations = () => {
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const { toast } = useToast();

  const sendInvitation = async ({ tripId, email, role, message }: SendInvitationParams) => {
    setLoading(true);
    try {
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

      if (!data.success) {
        throw new Error(data.error || 'Failed to send invitation');
      }

      toast({
        title: "Invitación enviada",
        description: `Invitación enviada a ${email} exitosamente`,
      });

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
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setInvitations(data || []);
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
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

      // Update local state
      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId 
            ? { ...inv, status: 'cancelled' } 
            : inv
        )
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
        throw new Error(data.error || 'Failed to accept invitation');
      }

      toast({
        title: "Invitación aceptada",
        description: "Te has unido al viaje exitosamente",
      });

      return data;
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Error al aceptar la invitación",
        variant: "destructive",
      });
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