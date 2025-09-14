import { useState, useEffect, useCallback } from "react";
import { useInvitationNotifications } from "./useInvitationNotifications";
import { useLanguage } from "./useLanguage";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export interface GeneralNotification {
  id: string;
  type: "place_added" | "place_updated" | "expense_added" | "expense_updated" | "decision_added" | "decision_updated" | "achievement" | "recommendation" | "system";
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
    activeInvitations,
    completedInvitations,
    loading: invitationsLoading,
    markAsRead: markInvitationAsRead,
    getInvitationLink,
    totalCount: invitationCount,
    refetch,
  } = useInvitationNotifications();

  // Check for pending invitation in localStorage - only after onboarding is complete
  useEffect(() => {
    const checkPendingInvitation = async () => {
      if (!user) return;

      // Check for invitation token in URL parameters first
      const urlParams = new URLSearchParams(window.location.search);
      const codeFromUrl = urlParams.get("code");

      if (codeFromUrl && !localStorage.getItem("invitation_token")) {
        console.log("Found invitation code in URL, storing as token");
        localStorage.setItem("invitation_token", codeFromUrl);
        // Clean the URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("code");
        window.history.replaceState({}, document.title, newUrl.toString());
      }

      // First check if user has completed onboarding
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error checking profile:", profileError);
        return;
      }

      // Only process invitation if onboarding is completed
      // Type assertion since we know the column exists
      const profileWithOnboarding = profile as {
        onboarding_completed?: boolean;
      } | null;
      if (!profileWithOnboarding?.onboarding_completed) {
        console.log(
          "Onboarding not completed, invitation will be processed after onboarding"
        );
        return;
      }

      const invitationToken = localStorage.getItem("invitation_token");
      if (invitationToken) {
        try {
          const { data: invitation, error } = await supabase
            .from("trip_invitations")
            .select(
              `
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
            `
            )
            .eq("token", invitationToken)
            .eq("status", "pending")
            .eq("email", user.email)
            .single();

          if (!error && invitation) {
            console.log(
              "Pending invitation found and onboarding complete, showing in notifications"
            );
            setPendingInvitation(invitation);
          }
        } catch (error) {
          console.error("Error fetching pending invitation:", error);
        }
      }
    };

    checkPendingInvitation();
  }, [user]);

  // General notification state
  const [generalNotifications, setGeneralNotifications] = useState<GeneralNotification[]>([]);
  const [generalLoading, setGeneralLoading] = useState(false);

  // Fetch general notifications from database
  const fetchGeneralNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    setGeneralLoading(true);
    try {
      const { data, error } = await supabase
        .from('general_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching general notifications:', error);
        return;
      }

      const formattedNotifications: GeneralNotification[] = (data || []).map(notification => ({
        id: notification.id,
        type: notification.type as any,
        title: notification.title,
        message: `${notification.actor_name} ${notification.message}`,
        time: formatDistanceToNow(new Date(notification.created_at), { addSuffix: true }),
        isRead: notification.is_read,
        icon: notification.icon,
        color: notification.color
      }));

      setGeneralNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error fetching general notifications:', error);
    } finally {
      setGeneralLoading(false);
    }
  }, [user?.id]);

  // Fetch general notifications on mount and when user changes
  useEffect(() => {
    fetchGeneralNotifications();
  }, [fetchGeneralNotifications]);

  // Set up real-time subscription for general notifications
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('general-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'general_notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refetch notifications when new ones are added
          fetchGeneralNotifications();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'general_notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refetch notifications when they are updated (e.g., marked as read)
          fetchGeneralNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchGeneralNotifications]);

  const markGeneralNotificationAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const { error } = await supabase
          .from('general_notifications')
          .update({ is_read: true })
          .eq('id', notificationId)
          .eq('user_id', user?.id);

        if (error) {
          console.error('Error marking notification as read:', error);
          return;
        }

        setGeneralNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    [user?.id]
  );

  const markAllGeneralNotificationsAsRead = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('general_notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      setGeneralNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user?.id]);

  const handleAcceptPendingInvitation = async () => {
    if (!pendingInvitation) return;

    try {
      const { data, error } = await supabase.functions.invoke(
        "accept-trip-invitation",
        {
          body: { token: pendingInvitation.token },
        }
      );

      if (!error && data.success) {
        localStorage.removeItem("invitation_token");
        setPendingInvitation(null);
        toast({
          title: "¡Invitación aceptada!",
          description: "Te has unido al viaje exitosamente",
        });
        if (refetch) refetch();

        // Trigger custom event to refresh trips
        window.dispatchEvent(
          new CustomEvent("tripInvitationAccepted", {
            detail: { tripId: data.trip?.id },
          })
        );
      } else {
        toast({
          title: "Error",
          description:
            error?.message || data?.error || "No se pudo aceptar la invitación",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast({
        title: "Error",
        description: "No se pudo aceptar la invitación",
        variant: "destructive",
      });
    }
  };

  const handleDeclinePendingInvitation = async () => {
    if (!pendingInvitation?.token) return;

    try {
      const { data, error } = await supabase.functions.invoke(
        "decline-trip-invitation",
        {
          body: { token: pendingInvitation.token },
        }
      );

      if (!error && data.success) {
        localStorage.removeItem("invitation_token");
        setPendingInvitation(null);
        toast({
          title: "Invitación rechazada",
          description: "Has rechazado la invitación al viaje",
        });
        if (refetch) refetch();
      } else {
        toast({
          title: "Error",
          description:
            error?.message ||
            data?.error ||
            "No se pudo rechazar la invitación",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error declining invitation:", error);
      toast({
        title: "Error",
        description: "No se pudo rechazar la invitación",
        variant: "destructive",
      });
    }
  };

  const handleDeclineInvitation = async (
    token: string,
    invitationId: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "decline-trip-invitation",
        {
          body: { token },
        }
      );

      if (!error && data.success) {
        markInvitationAsRead(invitationId);
        toast({
          title: "Invitación rechazada",
          description: "Has rechazado la invitación al viaje",
        });
        if (refetch) refetch();
      } else {
        toast({
          title: "Error",
          description:
            error?.message ||
            data?.error ||
            "No se pudo rechazar la invitación",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error declining invitation:", error);
      toast({
        title: "Error",
        description: "No se pudo rechazar la invitación",
        variant: "destructive",
      });
    }
  };

  const markAllNotificationsAsRead = useCallback(() => {
    markAllGeneralNotificationsAsRead();
    // Note: Invitations don't have a "mark all as read" - they are dismissed individually
  }, [markAllGeneralNotificationsAsRead]);

  const totalCount =
    invitationCount +
    generalNotifications.filter((n) => !n.isRead).length +
    (pendingInvitation ? 1 : 0);
  const loading = invitationsLoading || generalLoading;

  return {
    // Invitations
    invitations,
    activeInvitations,
    completedInvitations,
    markInvitationAsRead,
    getInvitationLink,
    invitationCount,

    // Pending invitation from localStorage
    pendingInvitation,
    handleAcceptPendingInvitation,
    handleDeclinePendingInvitation,
    handleDeclineInvitation,

    // General notifications
    generalNotifications,
    markGeneralNotificationAsRead,
    markAllGeneralNotificationsAsRead,

    // Combined
    totalCount,
    loading,
    markAllNotificationsAsRead,
  };
};
