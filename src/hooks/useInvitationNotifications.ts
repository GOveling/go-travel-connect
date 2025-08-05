import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeFallback } from '@/hooks/useRealtimeFallback';

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
  const [isRealtimeWorking, setIsRealtimeWorking] = useState(true);

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

  const setupInvitationListener = useCallback((userId: string) => {
    // Solo configurar realtime si tenemos email del usuario
    if (!user?.email) {
      console.log('No user email, skipping realtime setup');
      return () => {};
    }

    console.log('🔊 Setting up realtime listener for user:', user.email);
    
    const channel = supabase
      .channel(`invitation-notifications-${userId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: userId }
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'trip_invitations',
        filter: `email=eq.${user.email}`
      }, async (payload) => {
        console.log('🔔 New invitation INSERT detected:', payload);
        if (payload.new.email === user.email && payload.new.status === 'pending') {
          await handleNewInvitation(payload.new);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'trip_invitations',
        filter: `email=eq.${user.email}`
      }, async (payload) => {
        console.log('🔄 Invitation UPDATE detected:', payload);
        if (payload.new.email === user.email) {
          await handleInvitationUpdate(payload.new);
        }
      })
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to realtime updates');
          setIsRealtimeWorking(true);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel error - realtime may not work properly');
          setIsRealtimeWorking(false);
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Subscription timed out - attempting to reconnect');
          setIsRealtimeWorking(false);
          // Intentar reconectar después de un delay
          setTimeout(() => {
            if (user?.id) {
              console.log('🔄 Attempting to reconnect realtime...');
              setupInvitationListener(user.id);
            }
          }, 5000);
        } else if (status === 'CLOSED') {
          console.log('🔌 Channel closed');
          setIsRealtimeWorking(false);
        }
      });

    return () => {
      console.log('🧹 Cleaning up realtime subscription');
      channel.unsubscribe();
    };
  }, [user]);

  const handleNewInvitation = async (invitationData: any) => {
    try {
      console.log('🆕 Processing new invitation:', invitationData.id);
      
      // Fetch additional data
      const [tripData, inviterData] = await Promise.all([
        supabase.from('trips').select('name').eq('id', invitationData.trip_id).single(),
        supabase.from('profiles').select('full_name').eq('id', invitationData.inviter_id).single()
      ]);

      const newInvitation: InvitationNotification = {
        id: invitationData.id,
        trip_id: invitationData.trip_id,
        trip_name: tripData.data?.name || 'Unknown Trip',
        inviter_name: inviterData.data?.full_name || 'Unknown User',
        role: invitationData.role,
        created_at: invitationData.created_at,
        expires_at: invitationData.expires_at,
        token: invitationData.token,
        status: invitationData.status
      };

      // Actualizar estado evitando duplicados
      setInvitations(prev => {
        const exists = prev.find(inv => inv.id === newInvitation.id);
        if (exists) {
          return prev.map(inv => inv.id === newInvitation.id ? newInvitation : inv);
        }
        return [newInvitation, ...prev];
      });
      
      // Mostrar toast solo para invitaciones pendientes
      if (invitationData.status === 'pending') {
        showInvitationToast(newInvitation);
      }
    } catch (error) {
      console.error('❌ Error processing new invitation:', error);
    }
  };

  const handleInvitationUpdate = async (invitationData: any) => {
    try {
      console.log('🔄 Processing invitation update:', invitationData.id);
      
      // Fetch additional data
      const [tripData, inviterData] = await Promise.all([
        supabase.from('trips').select('name').eq('id', invitationData.trip_id).single(),
        supabase.from('profiles').select('full_name').eq('id', invitationData.inviter_id).single()
      ]);

      const updatedInvitation: InvitationNotification = {
        id: invitationData.id,
        trip_id: invitationData.trip_id,
        trip_name: tripData.data?.name || 'Unknown Trip',
        inviter_name: inviterData.data?.full_name || 'Unknown User',
        role: invitationData.role,
        created_at: invitationData.created_at,
        expires_at: invitationData.expires_at,
        token: invitationData.token,
        status: invitationData.status
      };

      // Actualizar el estado
      setInvitations(prev => {
        return prev.map(inv => inv.id === updatedInvitation.id ? updatedInvitation : inv);
      });
    } catch (error) {
      console.error('❌ Error processing invitation update:', error);
    }
  };

  // Real-time subscription for new invitations with improved error handling
  useEffect(() => {
    if (!user?.id || !user?.email) {
      console.log('Missing user ID or email, skipping realtime setup');
      return;
    }

    console.log('🚀 Initializing realtime listener for user:', user.id);
    
    // Pequeño delay para asegurar que el componente esté montado
    const timeoutId = setTimeout(() => {
      const cleanup = setupInvitationListener(user.id);
      
      // Cleanup function
      return cleanup;
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [user?.id, user?.email, setupInvitationListener]);

  // Configurar fallback de polling cuando realtime no funciona
  useRealtimeFallback(isRealtimeWorking, fetchInvitations, 30000);

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