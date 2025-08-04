import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface InvitationNotification {
  id: string;
  trip_id: string;
  trip_name: string;
  inviter_name: string;
  role: string;
  created_at: string;
  expires_at: string;
  token: string;
}

export const useInvitationNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<InvitationNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInvitations = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();

      if (!profileData?.email) return;

      const { data, error } = await supabase
        .from('trip_invitations')
        .select(`
          *,
          trips!trip_invitations_trip_id_fkey (
            id,
            name
          ),
          profiles!trip_invitations_inviter_id_fkey (
            full_name
          )
        `)
        .eq('email', profileData.email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invitations:', error);
        return;
      }

      console.log('Raw invitations data:', data);
      console.log('Data length:', data?.length);
      if (data && data.length > 0) {
        console.log('First invitation data:', JSON.stringify(data[0], null, 2));
        console.log('Trip data:', data[0]?.trips);
        console.log('Profile data:', data[0]?.profiles);
      }

      const formattedInvitations = (data || []).map(invitation => ({
        id: invitation.id,
        trip_id: invitation.trip_id,
        trip_name: invitation.trips?.name || 'Unknown Trip',
        inviter_name: invitation.profiles?.full_name || 'Unknown User',
        role: invitation.role,
        created_at: invitation.created_at,
        expires_at: invitation.expires_at,
        token: invitation.token
      }));

      setInvitations(formattedInvitations);
      console.log('Formatted invitations:', formattedInvitations);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (invitationId: string) => {
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    // Trigger refetch to ensure notifications are updated
    setTimeout(() => fetchInvitations(), 1000);
  }, [fetchInvitations]);

  const getInvitationLink = useCallback((invitation: InvitationNotification) => {
    return `/accept-invitation?token=${invitation.token}`;
  }, []);

  const showInvitationToast = useCallback((invitation: InvitationNotification) => {
    toast({
      title: "Nueva invitación de viaje",
      description: `${invitation.inviter_name} te ha invitado a "${invitation.trip_name}"`,
    });
  }, [toast]);

  const setupInvitationListener = useCallback((userId: string) => {
    const channel = supabase
      .channel(`invitation-notifications-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'trip_invitations',
        filter: `email=eq.${user?.email || ''}`
      }, async (payload) => {
        if (payload.new.email === user?.email) {
          const { data: invitationData } = await supabase
            .from('trip_invitations')
            .select(`
              *,
              trips!trip_invitations_trip_id_fkey (
                id,
                name
              ),
              profiles!trip_invitations_inviter_id_fkey (
                full_name
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (invitationData) {
            const newInvitation = {
              id: invitationData.id,
              trip_id: invitationData.trip_id,
              trip_name: invitationData.trips?.name || 'Unknown Trip',
              inviter_name: invitationData.profiles?.full_name || 'Unknown User',
              role: invitationData.role,
              created_at: invitationData.created_at,
              expires_at: invitationData.expires_at,
              token: invitationData.token
            };

            setInvitations(prev => [newInvitation, ...prev]);
            showInvitationToast(newInvitation);
          }
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, showInvitationToast]);

  // Real-time subscription for new invitations
  useEffect(() => {
    if (!user?.id) return;

    const cleanup = setupInvitationListener(user.id);
    return cleanup;
  }, [user?.id, setupInvitationListener]);

  // Initial fetch
  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  return {
    invitations,
    loading,
    refetch: fetchInvitations,
    markAsRead,
    getInvitationLink,
    totalCount: invitations.length
  };
};