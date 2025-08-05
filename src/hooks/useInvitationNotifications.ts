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
    console.log('=== Starting optimized fetchInvitations ===');
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

      console.log('🚀 Using optimized RPC function with email:', profileData.email);
      
      // Usar la función RPC optimizada
      const { data, error } = await supabase
        .rpc('get_pending_invitations', { user_email: profileData.email });

      console.log('✅ RPC Query executed - Error:', error);
      console.log('✅ RPC Query executed - Data:', data);

      if (error) {
        console.error('❌ Error fetching invitations:', error);
        return;
      }

      // Los datos ya vienen formateados de la función RPC
      const formattedInvitations = (data || []).map(invitation => ({
        id: invitation.id,
        trip_id: invitation.trip_id,
        trip_name: invitation.trip_name || 'Unknown Trip',
        inviter_name: invitation.inviter_name || 'Unknown User',
        role: invitation.role,
        created_at: invitation.created_at,
        expires_at: invitation.expires_at,
        token: invitation.token,
        status: 'pending' // Solo devolvemos pending invitations
      }));

      setInvitations(formattedInvitations);
      console.log('✅ Optimized formatted invitations:', formattedInvitations);
    } catch (error) {
      console.error('❌ Error fetching invitations:', error);
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

  const setupInvitationListener = useCallback((userId: string, userEmail: string) => {
    // Create a unique channel name with timestamp to avoid conflicts
    const channelName = `invitation-notifications-${userId}-${Date.now()}`;
    console.log('🔌 Setting up invitation listener with channel:', channelName);
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'trip_invitations',
        filter: `email=eq.${userEmail}`
      }, async (payload) => {
        console.log('📨 New invitation INSERT detected:', payload.new);
        if (payload.new.email === userEmail) {
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
              toast({
                title: "Nueva invitación de viaje",
                description: `${newInvitation.inviter_name} te ha invitado a "${newInvitation.trip_name}"`,
              });
            }
          }
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'trip_invitations',
        filter: `email=eq.${userEmail}`
      }, async (payload) => {
        console.log('🔄 Invitation UPDATE detected:', payload.new);
        if (payload.new.email === userEmail) {
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

            const updatedInvitation = {
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

            // Actualizar la invitación existente con el nuevo estado
            setInvitations(prev => {
              const exists = prev.find(inv => inv.id === updatedInvitation.id);
              if (exists) {
                console.log('🔄 Updating existing invitation status:', updatedInvitation.status);
                return prev.map(inv => inv.id === updatedInvitation.id ? updatedInvitation : inv);
              }
              // Si no existe, agregarla (por si acaso)
              return [updatedInvitation, ...prev];
            });
          }
        }
      })
      .subscribe();

    console.log('✅ Channel subscribed:', channelName);
    return () => {
      console.log('🧹 Cleaning up channel:', channelName);
      supabase.removeChannel(channel);
    };
  }, [toast]); // Only depend on toast

  // Real-time subscription for new invitations
  useEffect(() => {
    if (!user?.id || !user?.email) {
      console.log('⏸️ No user or email, skipping invitation listener setup');
      return;
    }

    console.log('🚀 Setting up invitation listener for user:', user.id);
    const cleanup = setupInvitationListener(user.id, user.email);
    return cleanup;
  }, [user?.id, user?.email, setupInvitationListener]);

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