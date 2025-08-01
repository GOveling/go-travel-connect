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

      const formattedInvitations: InvitationNotification[] = [];
      
      for (const inv of data || []) {
        // Fetch trip details
        const { data: tripData } = await supabase
          .from('trips')
          .select('name')
          .eq('id', inv.trip_id)
          .single();
          
        // Fetch inviter details
        const { data: inviterData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', inv.inviter_id)
          .single();

        formattedInvitations.push({
          id: inv.id,
          trip_id: inv.trip_id,
          trip_name: tripData?.name || 'Unknown Trip',
          inviter_name: inviterData?.full_name || 'Unknown User',
          role: inv.role,
          created_at: inv.created_at,
          expires_at: inv.expires_at,
          token: inv.token
        });
      }

      setInvitations(formattedInvitations);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (invitationId: string) => {
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
  }, []);

  const getInvitationLink = useCallback((invitation: InvitationNotification) => {
    return `/trips/${invitation.trip_id}/join?token=${invitation.token}`;
  }, []);

  const showInvitationToast = useCallback((invitation: InvitationNotification) => {
    toast({
      title: "Nueva invitación de viaje",
      description: `${invitation.inviter_name} te ha invitado a "${invitation.trip_name}"`,
    });
  }, [toast]);

  // Real-time subscription for new invitations
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('invitation-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trip_invitations',
          filter: `status=eq.pending`
        },
        async (payload) => {
          // Check if this invitation is for the current user
          const { data: profileData } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', user.id)
            .single();

          if (profileData?.email === payload.new.email) {
            // Fetch the full invitation details
            const { data: invitationData } = await supabase
              .from('trip_invitations')
              .select('*')
              .eq('id', payload.new.id)
              .single();

            if (invitationData) {
              // Fetch trip and inviter details
              const { data: tripData } = await supabase
                .from('trips')
                .select('name')
                .eq('id', invitationData.trip_id)
                .single();
                
              const { data: inviterData } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', invitationData.inviter_id)
                .single();

              const newInvitation: InvitationNotification = {
                id: invitationData.id,
                trip_id: invitationData.trip_id,
                trip_name: tripData?.name || 'Unknown Trip',
                inviter_name: inviterData?.full_name || 'Unknown User',
                role: invitationData.role,
                created_at: invitationData.created_at,
                expires_at: invitationData.expires_at,
                token: invitationData.token
              };

              setInvitations(prev => [newInvitation, ...prev]);
              showInvitationToast(newInvitation);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, showInvitationToast]);

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