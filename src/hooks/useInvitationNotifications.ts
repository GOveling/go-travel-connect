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
  status: string;
}

export const useInvitationNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<InvitationNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInvitations = useCallback(async () => {
    console.log('=== Starting fetchInvitations ===');
    if (!user) {
      console.log('No user found, returning');
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching profile for user:', user.id);
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();

      console.log('Profile data:', profileData);
      if (!profileData?.email) {
        console.log('No email found in profile');
        return;
      }

      console.log('Executing query with email:', profileData.email);
      console.log('Current time:', new Date().toISOString());
      
      const { data, error } = await supabase
        .from('trip_invitations')
        .select('*')
        .eq('email', profileData.email)
        .in('status', ['pending', 'accepted', 'declined'])
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      console.log('Query executed - Error:', error);
      console.log('Query executed - Data:', data);

      if (error) {
        console.error('Error fetching invitations:', error);
        return;
      }

      console.log('Raw invitation data:', data);

      // First get the basic invitation data, then fetch related data separately
      const formattedInvitations = await Promise.all((data || []).map(async (invitation) => {
        console.log('Processing invitation:', invitation.id, 'trip_id:', invitation.trip_id);
        
        // Fetch trip name
        console.log('🔍 About to fetch trip with ID:', invitation.trip_id);
        
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select('name')
          .eq('id', invitation.trip_id)
          .single();
        
        console.log('🏖️ Trip query result:', { 
          tripId: invitation.trip_id,
          tripData, 
          tripError,
          tripName: tripData?.name 
        });
        
        // Fetch inviter name
        const { data: inviterData, error: inviterError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', invitation.inviter_id)
          .single();

        console.log('Inviter query result:', { inviterData, inviterError });

        const result = {
          id: invitation.id,
          trip_id: invitation.trip_id,
          trip_name: tripData?.name || 'Unknown Trip',
          inviter_name: inviterData?.full_name || 'Unknown User',
          role: invitation.role,
          created_at: invitation.created_at,
          expires_at: invitation.expires_at,
          token: invitation.token,
          status: invitation.status
        };

        console.log('Final invitation result:', result);
        return result;
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
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (invitationData) {
            // Fetch trip name
            const { data: tripData } = await supabase
              .from('trips')
              .select('name')
              .eq('id', invitationData.trip_id)
              .single();
            
            // Fetch inviter name
            const { data: inviterData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', invitationData.inviter_id)
              .single();

            const newInvitation = {
              id: invitationData.id,
              trip_id: invitationData.trip_id,
              trip_name: tripData?.name || 'Unknown Trip',
              inviter_name: inviterData?.full_name || 'Unknown User',
              role: invitationData.role,
              created_at: invitationData.created_at,
              expires_at: invitationData.expires_at,
              token: invitationData.token,
              status: invitationData.status
            };

            // Evitar duplicados: si ya existe, reemplazar; si no, agregar
            setInvitations(prev => {
              const exists = prev.find(inv => inv.id === newInvitation.id);
              if (exists) {
                return prev.map(inv => inv.id === newInvitation.id ? newInvitation : inv);
              }
              return [newInvitation, ...prev];
            });
            
            // Solo mostrar toast para invitaciones pending
            if (invitationData.status === 'pending') {
              showInvitationToast(newInvitation);
            }
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

  // Filtrar invitaciones por estado
  const activeInvitations = invitations.filter(inv => inv.status === 'pending');
  const completedInvitations = invitations.filter(inv => inv.status === 'accepted' || inv.status === 'declined');

  return {
    invitations,
    activeInvitations,
    completedInvitations,
    loading,
    refetch: fetchInvitations,
    markAsRead,
    getInvitationLink,
    totalCount: activeInvitations.length // Solo contar las activas para el badge
  };
};