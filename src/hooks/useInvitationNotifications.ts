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
        .select('*')
        .eq('email', profileData.email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invitations:', error);
        return;
      }

      // Get unique trip and inviter IDs
      const tripIds = [...new Set((data || []).map(inv => inv.trip_id))];
      const inviterIds = [...new Set((data || []).map(inv => inv.inviter_id))];

      // Batch fetch trip details
      const { data: tripsData } = await supabase
        .from('trips')
        .select('id, name')
        .in('id', tripIds);

      // Batch fetch inviter details
      const { data: invitersData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', inviterIds);

      // Create lookup maps
      const tripsMap = new Map(tripsData?.map(trip => [trip.id, trip.name]) || []);
      const invitersMap = new Map(invitersData?.map(profile => [profile.id, profile.full_name]) || []);

      const formattedInvitations: InvitationNotification[] = (data || []).map(inv => ({
        id: inv.id,
        trip_id: inv.trip_id,
        trip_name: tripsMap.get(inv.trip_id) || 'Unknown Trip',
        inviter_name: invitersMap.get(inv.inviter_id) || 'Unknown User',
        role: inv.role,
        created_at: inv.created_at,
        expires_at: inv.expires_at,
        token: inv.token
      }));

      setInvitations(formattedInvitations);
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
          // Fetch the full invitation details
          const { data: invitationData } = await supabase
            .from('trip_invitations')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (invitationData) {
            // Fetch trip and inviter details
            const [tripResult, inviterResult] = await Promise.all([
              supabase.from('trips').select('name').eq('id', invitationData.trip_id).single(),
              supabase.from('profiles').select('full_name').eq('id', invitationData.inviter_id).single()
            ]);

            const newInvitation: InvitationNotification = {
              id: invitationData.id,
              trip_id: invitationData.trip_id,
              trip_name: tripResult.data?.name || 'Unknown Trip',
              inviter_name: inviterResult.data?.full_name || 'Unknown User',
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