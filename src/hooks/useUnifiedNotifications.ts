import { useState, useEffect, useCallback } from 'react';
import { useInvitationNotifications } from './useInvitationNotifications';
import { useLanguage } from './useLanguage';

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
  const { 
    invitations, 
    loading: invitationsLoading, 
    markAsRead: markInvitationAsRead,
    getInvitationLink,
    totalCount: invitationCount 
  } = useInvitationNotifications();
  
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

  const markAllNotificationsAsRead = useCallback(() => {
    markAllGeneralNotificationsAsRead();
    // Note: Invitations don't have a "mark all as read" - they are dismissed individually
  }, [markAllGeneralNotificationsAsRead]);

  const totalCount = invitationCount + generalNotifications.filter(n => !n.isRead).length;
  const loading = invitationsLoading;

  return {
    // Invitations
    invitations,
    markInvitationAsRead,
    getInvitationLink,
    invitationCount,
    
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