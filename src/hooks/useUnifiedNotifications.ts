import { useState, useEffect, useCallback, useMemo } from "react";
import { useInvitationNotifications } from "./useInvitationNotifications";
import { useLanguage } from "./useLanguage";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface GeneralNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  viewed_at: string | null;
  icon: string;
  color: string;
  actor_name: string;
  user_id: string;
  trip_id: string;
  updated_at: string;
  actor_user_id: string;
  related_id: string | null;
}

export const useUnifiedNotifications = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [pendingInvitationId, setPendingInvitationId] = useState<string | null>(null);
  const [pendingInvitationToken, setPendingInvitationToken] = useState<string | null>(null);
  const {
    invitations,
    activeInvitations,
    completedInvitations,
    loading: invitationLoading,
    markAsRead,
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
            setPendingInvitationId(invitation.id);
            setPendingInvitationToken(invitation.token);
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

  // Fetch general notifications from the database (limited to 20 most recent)
  const fetchGeneralNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setGeneralLoading(true);
      const { data, error } = await supabase
        .from('general_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching general notifications:', error);
        return;
      }

      setGeneralNotifications(data || []);
    } catch (error) {
      console.error('Error in fetchGeneralNotifications:', error);
    } finally {
      setGeneralLoading(false);
    }
  }, [user]);

  // Set up real-time subscriptions for general notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('general_notifications_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'general_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New general notification received:', payload.new);
          setGeneralNotifications(prev => {
            const newNotifications = [payload.new as GeneralNotification, ...prev];
            // Keep only the latest 20 notifications
            return newNotifications.slice(0, 20);
          });
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
        (payload) => {
          console.log('General notification updated:', payload.new);
          setGeneralNotifications(prev => 
            prev.map(notif => 
              notif.id === payload.new.id ? payload.new as GeneralNotification : notif
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Fetch notifications on mount
  useEffect(() => {
    fetchGeneralNotifications();
  }, [fetchGeneralNotifications]);

  // Function to mark notifications as viewed (hide red badge)
  const markNotificationsAsViewed = useCallback(async () => {
    if (!user) return;

    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('general_notifications')
        .update({ 
          viewed_at: now,
          updated_at: now
        })
        .eq('user_id', user.id)
        .is('viewed_at', null);

      if (error) {
        console.error('Error marking notifications as viewed:', error);
      }
    } catch (error) {
      console.error('Error in markNotificationsAsViewed:', error);
    }
  }, [user]);

  // Function to mark a general notification as read
  const markGeneralNotificationAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('general_notifications')
        .update({ 
          is_read: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking notification as read:', error);
      }
    } catch (error) {
      console.error('Error in markGeneralNotificationAsRead:', error);
    }
  }, [user]);

  // Function to mark all general notifications as read
  const markAllGeneralNotificationsAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('general_notifications')
        .update({ 
          is_read: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
      }
    } catch (error) {
      console.error('Error in markAllGeneralNotificationsAsRead:', error);
    }
  }, [user]);

  const handleAcceptPendingInvitation = async () => {
    if (!pendingInvitationToken) return;

    try {
      const { data, error } = await supabase.functions.invoke(
        "accept-trip-invitation",
        {
          body: { token: pendingInvitationToken },
        }
      );

      if (!error && data.success) {
        localStorage.removeItem("invitation_token");
        setPendingInvitationId(null);
        setPendingInvitationToken(null);
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
    if (!pendingInvitationToken) return;

    try {
      const { data, error } = await supabase.functions.invoke(
        "decline-trip-invitation",
        {
          body: { token: pendingInvitationToken },
        }
      );

      if (!error && data.success) {
        localStorage.removeItem("invitation_token");
        setPendingInvitationId(null);
        setPendingInvitationToken(null);
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
        markAsRead(invitationId);
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

  // Calculate total count of unviewed notifications (for red badge)
  const totalCount = useMemo(() => {
    const unviewedGeneral = generalNotifications.filter(n => !n.viewed_at).length;
    return activeInvitations.length + unviewedGeneral;
  }, [activeInvitations.length, generalNotifications]);

  const loading = invitationLoading || generalLoading;

  return {
    invitations,
    activeInvitations,
    completedInvitations,
    generalNotifications,
    loading,
    totalCount,
    refetch,
    markAsRead,
    getInvitationLink,
    markNotificationsAsViewed,
    markGeneralNotificationAsRead,
    markAllGeneralNotificationsAsRead,
    handleAcceptPendingInvitation,
    handleDeclinePendingInvitation,
    handleDeclineInvitation,
    pendingInvitationId,
    pendingInvitationToken
  };
};
