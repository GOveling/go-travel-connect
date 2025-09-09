import { useState, useEffect, useCallback } from "react";
import { useInvitationNotifications } from "./useInvitationNotifications";
import { useLanguage } from "./useLanguage";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface GeneralNotification {
  id: string;
  type: "trip_update" | "achievement" | "recommendation" | "system";
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

  // Real-time notifications will be populated here based on actual app events
  const [generalNotifications, setGeneralNotifications] = useState<
    GeneralNotification[]
  >([]);

  const markGeneralNotificationAsRead = useCallback(
    (notificationId: string) => {
      setGeneralNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    },
    []
  );

  const markAllGeneralNotificationsAsRead = useCallback(() => {
    setGeneralNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  }, []);

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
  const loading = invitationsLoading;

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
