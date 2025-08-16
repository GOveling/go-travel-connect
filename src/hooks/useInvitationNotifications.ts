import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeFallback } from "@/hooks/useRealtimeFallback";
import { useEnvironment } from "@/hooks/useEnvironment";

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
  const { isVercel, isClient } = useEnvironment();
  const [invitations, setInvitations] = useState<InvitationNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRealtimeWorking, setIsRealtimeWorking] = useState(true);

  const fetchInvitations = useCallback(async () => {
    console.log("=== Starting optimized fetchInvitations ===");
    if (!user) {
      console.log("No user found, returning");
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching profile for user:", user.id);
      const { data: profileData } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", user.id)
        .single();

      console.log("Profile data:", profileData);
      if (!profileData?.email) {
        console.log("No email found in profile");
        return;
      }

      console.log(
        "🚀 Using optimized RPC function with email:",
        profileData.email
      );

      // Usar la función RPC optimizada
      const { data, error } = await supabase.rpc("get_pending_invitations", {
        user_email: profileData.email,
      });

      console.log("✅ RPC Query executed - Error:", error);
      console.log("✅ RPC Query executed - Data:", data);

      if (error) {
        console.error("❌ Error fetching invitations:", error);
        return;
      }

      // Los datos ya vienen formateados de la función RPC
      const formattedInvitations = (data || []).map((invitation) => ({
        id: invitation.id,
        trip_id: invitation.trip_id,
        trip_name: invitation.trip_name || "Unknown Trip",
        inviter_name: invitation.inviter_name || "Unknown User",
        role: invitation.role,
        created_at: invitation.created_at,
        expires_at: invitation.expires_at,
        token: invitation.token,
        status: "pending", // Solo devolvemos pending invitations
      }));

      setInvitations(formattedInvitations);
      console.log("✅ Optimized formatted invitations:", formattedInvitations);
    } catch (error) {
      console.error("❌ Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(
    async (invitationId: string) => {
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
      // Trigger refetch to ensure notifications are updated
      setTimeout(() => fetchInvitations(), 1000);
    },
    [fetchInvitations]
  );

  const getInvitationLink = useCallback(
    (invitation: InvitationNotification) => {
      return `/accept-invitation?token=${invitation.token}`;
    },
    []
  );

  const showInvitationToast = useCallback(
    (invitation: InvitationNotification) => {
      toast({
        title: "Nueva invitación de viaje",
        description: `${invitation.inviter_name} te ha invitado a "${invitation.trip_name}"`,
      });
    },
    [toast]
  );

  const handleNewInvitation = useCallback(
    async (invitationData: any) => {
      try {
        console.log("🆕 Processing new invitation:", invitationData.id);

        // Verificar que supabase esté disponible
        if (!supabase) {
          console.error(
            "Supabase client not available for new invitation handling"
          );
          return;
        }

        // Fetch additional data con timeout
        const fetchPromises = [
          supabase
            .from("trips")
            .select("name")
            .eq("id", invitationData.trip_id)
            .single(),
          supabase
            .from("profiles")
            .select("full_name")
            .eq("id", invitationData.inviter_id)
            .single(),
        ];

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Fetch timeout")), 10000)
        );

        const [tripData, inviterData] = (await Promise.race([
          Promise.all(fetchPromises),
          timeoutPromise,
        ])) as any;

        const newInvitation: InvitationNotification = {
          id: invitationData.id,
          trip_id: invitationData.trip_id,
          trip_name: tripData.data?.name || "Unknown Trip",
          inviter_name: inviterData.data?.full_name || "Unknown User",
          role: invitationData.role,
          created_at: invitationData.created_at,
          expires_at: invitationData.expires_at,
          token: invitationData.token,
          status: invitationData.status,
        };

        // Actualizar estado evitando duplicados
        setInvitations((prev) => {
          const exists = prev.find((inv) => inv.id === newInvitation.id);
          if (exists) {
            return prev.map((inv) =>
              inv.id === newInvitation.id ? newInvitation : inv
            );
          }
          return [newInvitation, ...prev];
        });

        // Mostrar toast solo para invitaciones pendientes
        if (invitationData.status === "pending") {
          showInvitationToast(newInvitation);
        }
      } catch (error) {
        console.error("❌ Error processing new invitation:", error);
      }
    },
    [showInvitationToast]
  );

  const handleInvitationUpdate = useCallback(async (invitationData: any) => {
    try {
      console.log("🔄 Processing invitation update:", invitationData.id);

      // Verificar que supabase esté disponible
      if (!supabase) {
        console.error("Supabase client not available for update handling");
        return;
      }

      // Fetch additional data con timeout
      const fetchPromises = [
        supabase
          .from("trips")
          .select("name")
          .eq("id", invitationData.trip_id)
          .single(),
        supabase
          .from("profiles")
          .select("full_name")
          .eq("id", invitationData.inviter_id)
          .single(),
      ];

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Fetch timeout")), 10000)
      );

      const [tripData, inviterData] = (await Promise.race([
        Promise.all(fetchPromises),
        timeoutPromise,
      ])) as any;

      const updatedInvitation: InvitationNotification = {
        id: invitationData.id,
        trip_id: invitationData.trip_id,
        trip_name: tripData.data?.name || "Unknown Trip",
        inviter_name: inviterData.data?.full_name || "Unknown User",
        role: invitationData.role,
        created_at: invitationData.created_at,
        expires_at: invitationData.expires_at,
        token: invitationData.token,
        status: invitationData.status,
      };

      // Actualizar el estado
      setInvitations((prev) => {
        return prev.map((inv) =>
          inv.id === updatedInvitation.id ? updatedInvitation : inv
        );
      });
    } catch (error) {
      console.error("❌ Error processing invitation update:", error);
    }
  }, []);

  const setupInvitationListener = useCallback(
    (userId: string) => {
      // Protecciones adicionales
      if (!user?.email || !userId) {
        console.log("Missing user email or userId, skipping realtime setup");
        return () => {};
      }

      // Verificar que supabase esté disponible
      if (!supabase) {
        console.error("Supabase client not available");
        return () => {};
      }

      console.log("🔊 Setting up realtime listener for user:", user.email);

      try {
        const channel = supabase
          .channel(`invitation-notifications-${userId}`, {
            config: {
              broadcast: { self: true },
              presence: { key: userId },
            },
          })
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "trip_invitations",
              filter: `email=eq.${user.email}`,
            },
            async (payload) => {
              try {
                console.log("🔔 New invitation INSERT detected:", payload);
                if (
                  payload.new.email === user.email &&
                  payload.new.status === "pending"
                ) {
                  await handleNewInvitation(payload.new);
                }
              } catch (error) {
                console.error("❌ Error handling new invitation:", error);
              }
            }
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "trip_invitations",
              filter: `email=eq.${user.email}`,
            },
            async (payload) => {
              try {
                console.log("🔄 Invitation UPDATE detected:", payload);
                if (payload.new.email === user.email) {
                  await handleInvitationUpdate(payload.new);
                }
              } catch (error) {
                console.error("❌ Error handling invitation update:", error);
              }
            }
          )
          .subscribe((status) => {
            console.log("📡 Realtime subscription status:", status);
            if (status === "SUBSCRIBED") {
              console.log("✅ Successfully subscribed to realtime updates");
              setIsRealtimeWorking(true);
            } else if (status === "CHANNEL_ERROR") {
              console.error(
                "❌ Channel error - realtime may not work properly"
              );
              setIsRealtimeWorking(false);
            } else if (status === "TIMED_OUT") {
              console.error(
                "⏱️ Subscription timed out - attempting to reconnect"
              );
              setIsRealtimeWorking(false);
              // Intentar reconectar después de un delay
              setTimeout(() => {
                if (user?.id) {
                  console.log("🔄 Attempting to reconnect realtime...");
                  setupInvitationListener(user.id);
                }
              }, 5000);
            } else if (status === "CLOSED") {
              console.log("🔌 Channel closed");
              setIsRealtimeWorking(false);
            }
          });

        return () => {
          try {
            console.log("🧹 Cleaning up realtime subscription");
            channel.unsubscribe();
          } catch (error) {
            console.error("❌ Error during cleanup:", error);
          }
        };
      } catch (error) {
        console.error("❌ Error setting up realtime subscription:", error);
        setIsRealtimeWorking(false);
        return () => {}; // Función de limpieza vacía
      }
    },
    [user, handleNewInvitation, handleInvitationUpdate]
  );

  // Real-time subscription for new invitations with improved error handling
  useEffect(() => {
    if (!user?.id || !user?.email || !isClient) {
      console.log("Missing requirements for realtime setup:", {
        userId: !!user?.id,
        email: !!user?.email,
        isClient,
      });
      return;
    }

    // En Vercel, aumentar el delay inicial para evitar problemas de hidratación
    const initialDelay = isVercel ? 500 : 100;

    console.log(
      "🚀 Initializing realtime listener for user:",
      user.id,
      "environment: Vercel =",
      isVercel
    );

    const timeoutId = setTimeout(() => {
      try {
        const cleanup = setupInvitationListener(user.id);
        return cleanup;
      } catch (error) {
        console.error("❌ Error initializing realtime listener:", error);
        setIsRealtimeWorking(false);
      }
    }, initialDelay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [user?.id, user?.email, setupInvitationListener, isVercel, isClient]);

  // Configurar fallback de polling cuando realtime no funciona
  // En Vercel, usar intervalo más frecuente para compensar problemas de realtime
  const pollingInterval = isVercel ? 20000 : 30000; // 20s en Vercel, 30s en otros
  useRealtimeFallback(isRealtimeWorking, fetchInvitations, pollingInterval);

  // Initial fetch
  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  // Filtrar invitaciones por estado
  const activeInvitations = invitations.filter(
    (inv) => inv.status === "pending"
  );
  const completedInvitations = invitations.filter(
    (inv) => inv.status === "accepted" || inv.status === "declined"
  );

  return {
    invitations,
    activeInvitations,
    completedInvitations,
    loading,
    refetch: fetchInvitations,
    markAsRead,
    getInvitationLink,
    totalCount: activeInvitations.length, // Solo contar las activas para el badge
  };
};
