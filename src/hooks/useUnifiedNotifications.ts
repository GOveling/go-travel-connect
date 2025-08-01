import { useState, useEffect, useCallback } from 'react';
import { useInvitationNotifications } from './useInvitationNotifications';
import { useLanguage } from './useLanguage';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface GeneralNotification {
  id: string;
  type: 'trip_update' | 'achievement' | 'recommendation' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  icon: string;
  color: string;
}

export const useUnifiedNotifications = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [pendingInvitation, setPendingInvitation] = useState<any>(null);
  const { 
    invitations, 
    loading: invitationsLoading, 
    markAsRead: markInvitationAsRead,
    getInvitationLink,
    totalCount: invitationCount,
    refetch
  } = useInvitationNotifications();
  
  // Check for pending invitation in localStorage
  useEffect(() => {
    const checkPendingInvitation = async () => {
      if (!user) return;
      
      const invitationToken = localStorage.getItem('invitation_token');
      if (invitationToken) {
        try {
          const { data: invitation, error } = await supabase
            .from('trip_invitations')
            .select(`
              id,
              email,
              role,
              expires_at,
              status,
              token,
              trip_id,
              trips:trip_id (
                name,
                destination,
                dates,
                image
              ),
              inviter:inviter_id (
                full_name
              )
            `)
            .eq('token', invitationToken)
            .eq('status', 'pending')
            .eq('email', user.email)
            .single();

          if (!error && invitation) {
            setPendingInvitation(invitation);
          }
        } catch (error) {
          console.error('Error fetching pending invitation:', error);
        }
      }
    };

    checkPendingInvitation();
  }, [user]);

  const [generalNotifications, setGeneralNotifications] = useState<GeneralNotification[]>([
    {
      id: '1',
      type: 'trip_update',
      title: t('notifications.tripUpdate') || 'Trip Update',
      message: t('notifications.newRecommendation') || 'New places recommended for your Paris trip',
      time: '2h',
      isRead: false,
      icon: 'MapPin',
      color: 'blue'
    },
    {
      id: '2',
      type: 'achievement',
      title: t('notifications.achievement') || 'Achievement Unlocked',
      message: t('notifications.explorerBadge') || 'You earned the "Explorer" badge!',
      time: '1d',
      isRead: false,
      icon: 'Trophy',
      color: 'gold'
    },
    {
      id: '3',
      type: 'recommendation',
      title: t('notifications.recommendation') || 'New Recommendation',
      message: t('notifications.restaurantSuggestion') || 'Check out this restaurant in Tokyo',
      time: '2d',
      isRead: true,
      icon: 'Utensils',
      color: 'orange'
    }
  ]);

  const markGeneralNotificationAsRead = useCallback((notificationId: string) => {
    setGeneralNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  const markAllGeneralNotificationsAsRead = useCallback(() => {
    setGeneralNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  }, []);

  const handleAcceptPendingInvitation = async () => {
    if (!pendingInvitation) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('accept-trip-invitation', {
        body: { token: pendingInvitation.token }
      });

      if (!error && data.success) {
        localStorage.removeItem('invitation_token');
        setPendingInvitation(null);
        toast({
          title: "¡Invitación aceptada!",
          description: "Te has unido al viaje exitosamente",
        });
        if (refetch) refetch();
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: "No se pudo aceptar la invitación",
        variant: "destructive",
      });
    }
  };

  const handleDeclinePendingInvitation = () => {
    localStorage.removeItem('invitation_token');
    setPendingInvitation(null);
    toast({
      title: "Invitación rechazada",
      description: "Has rechazado la invitación al viaje",
    });
  };

  const markAllNotificationsAsRead = useCallback(() => {
    markAllGeneralNotificationsAsRead();
    // Note: Invitations don't have a "mark all as read" - they are dismissed individually
  }, [markAllGeneralNotificationsAsRead]);

  const totalCount = invitationCount + generalNotifications.filter(n => !n.isRead).length + (pendingInvitation ? 1 : 0);
  const loading = invitationsLoading;

  return {
    // Invitations
    invitations,
    markInvitationAsRead,
    getInvitationLink,
    invitationCount,
    
    // Pending invitation from localStorage
    pendingInvitation,
    handleAcceptPendingInvitation,
    handleDeclinePendingInvitation,
    
    // General notifications
    generalNotifications,
    markGeneralNotificationAsRead,
    markAllGeneralNotificationsAsRead,
    
    // Combined
    totalCount,
    loading,
    markAllNotificationsAsRead
  };
};