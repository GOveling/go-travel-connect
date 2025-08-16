import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SendInvitationParams {
  tripId: string;
  email: string;
  role: "editor" | "viewer";
  message?: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
  trip_id: string;
  trip: {
    id: string;
    name: string;
  };
}

interface AcceptInvitationResult {
  success: boolean;
  error?: string;
  trip_id?: string;
  trip_name?: string;
  role?: string;
}

export const useInvitations = () => {
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const { toast } = useToast();

  const sendInvitation = async ({
    tripId,
    email,
    role,
    message,
  }: SendInvitationParams) => {
    setLoading(true);
    try {
      // Validate permissions first
      const { data: permissions } = await supabase
        .from("trips")
        .select("user_id, is_group_trip")
        .eq("id", tripId)
        .single();

      if (!permissions) {
        throw new Error("No tienes permisos para invitar");
      }

      const { data, error } = await supabase.functions.invoke(
        "send-trip-invitation",
        {
          body: {
            tripId,
            email: email.toLowerCase().trim(),
            role,
            message,
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (!data || !data.success) {
        throw new Error(data?.error || "Failed to send invitation");
      }

      toast({
        title: "Invitación enviada",
        description: `Invitación enviada a ${email} exitosamente`,
      });

      // Update local state and emit event
      window.dispatchEvent(new CustomEvent("invitationSent"));

      // Refresh invitations list
      await fetchInvitations(tripId);

      return data;
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Error",
        description: error.message || "Error al enviar la invitación",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async (tripId: string) => {
    try {
      const { data, error } = await supabase
        .from("trip_invitations")
        .select(
          `
          *,
          trips!trip_invitations_trip_id_fkey(
            id,
            name
          ),
          profiles!trip_invitations_inviter_id_fkey(
            full_name
          )
        `
        )
        .eq("trip_id", tripId)
        .in("status", ["pending", "accepted", "declined"])
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      console.log("Raw invitations data from useInvitations:", data);

      // Transform the data to ensure trip name is available
      const processedInvitations = (data || []).map((invitation: any) => ({
        ...invitation,
        trip: invitation.trips || { id: tripId, name: "Unknown Trip" },
        inviter_name: invitation.profiles?.full_name || "Unknown User",
      }));

      setInvitations(processedInvitations);

      // Log for debugging
      console.log(
        "Processed invitations from useInvitations:",
        processedInvitations
      );
    } catch (error: any) {
      console.error("Error fetching invitations:", error);
      toast({
        title: "Error",
        description: "Error al cargar las invitaciones",
        variant: "destructive",
      });
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from("trip_invitations")
        .update({ status: "cancelled" })
        .eq("id", invitationId);

      if (error) {
        throw error;
      }

      toast({
        title: "Invitación cancelada",
        description: "La invitación ha sido cancelada exitosamente",
      });

      // Remove cancelled invitation from local state (since we only show active ones)
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
    } catch (error: any) {
      console.error("Error cancelling invitation:", error);
      toast({
        title: "Error",
        description: "Error al cancelar la invitación",
        variant: "destructive",
      });
    }
  };

  const acceptInvitation = async (token: string) => {
    try {
      console.log(
        "🎫 Aceptando invitación con función v3:",
        token.substring(0, 10) + "..."
      );
      setLoading(true);

      // Obtener datos del usuario actual
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para aceptar invitaciones",
          variant: "destructive",
        });
        return { success: false, error: "Usuario no autenticado" };
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("email, onboarding_completed, full_name")
        .eq("id", userData.user.id)
        .single();

      if (!profileData) {
        return {
          success: false,
          requiresProfile: true,
          error: "Necesitas crear tu perfil antes de aceptar invitaciones",
        };
      }

      if (!profileData.onboarding_completed) {
        return {
          success: false,
          requiresOnboarding: true,
          token,
          error: "Necesitas completar tu perfil antes de aceptar invitaciones",
        };
      }

      console.log("🚀 Usando función RPC v3 para aceptar invitación");

      // Usar la nueva función RPC v3
      const { data: result, error: rpcError } = await supabase.rpc(
        "accept_trip_invitation_v3",
        {
          p_token: token,
        }
      );

      console.log("✅ RPC Result:", result);

      if (rpcError) {
        console.error("❌ Error RPC:", rpcError);
        toast({
          title: "Error",
          description: "Error al procesar la invitación",
          variant: "destructive",
        });
        return { success: false, error: rpcError.message };
      }

      // Cast result to proper type
      const acceptResult = result as unknown as AcceptInvitationResult;

      if (!acceptResult || !acceptResult.success) {
        const errorMessage =
          acceptResult?.error || "Error desconocido al aceptar la invitación";
        console.error("❌ RPC failed:", errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      }

      console.log("✅ Invitación aceptada exitosamente");

      // Disparar eventos para actualizar la UI
      window.dispatchEvent(
        new CustomEvent("tripInvitationAccepted", {
          detail: {
            tripId: acceptResult.trip_id,
            role: acceptResult.role,
          },
        })
      );

      window.dispatchEvent(
        new CustomEvent("refreshManageTeam", {
          detail: { tripId: acceptResult.trip_id },
        })
      );

      toast({
        title: "Invitación aceptada",
        description: `¡Te has unido al viaje "${acceptResult.trip_name}"!`,
      });

      return {
        success: true,
        trip: {
          id: acceptResult.trip_id || "",
          name: acceptResult.trip_name || "",
        },
        userRole: acceptResult.role || "",
        onboardingCompleted: true,
      };
    } catch (error: any) {
      console.error("❌ Error inesperado:", error);
      toast({
        title: "Error",
        description: "Error inesperado al aceptar la invitación",
        variant: "destructive",
      });
      return { success: false, error: "Error inesperado" };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    invitations,
    sendInvitation,
    fetchInvitations,
    cancelInvitation,
    acceptInvitation,
  };
};
