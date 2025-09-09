import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface InvitationProps {
  token: string;
  tripName: string;
  inviterName: string;
  role: string;
}

export const ActiveInvitations = ({
  invitations = [],
  onAccepted,
  onDeclined,
  className,
}: {
  invitations: InvitationProps[];
  onAccepted?: (tripId: string) => void;
  onDeclined?: () => void;
  className?: string;
}) => {
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAccept = async (token: string, tripName: string) => {
    if (!user) return;

    setProcessing(token);
    try {
      console.log(
        "🚀 Accepting invitation with v3 RPC:",
        token.substring(0, 10) + "..."
      );

      // Use the atomic RPC function for safe transaction processing
      const { data: result, error: rpcError } = await supabase.rpc(
        "accept_trip_invitation_v3",
        {
          p_token: token,
        }
      );

      console.log("✅ RPC Result:", result);

      if (rpcError) {
        console.error("❌ Error RPC:", rpcError);
        throw new Error("Error al procesar la invitación");
      }

      // Type assertion for RPC result
      const typedResult = result as {
        success: boolean;
        error?: string;
        trip_id?: string;
        trip_name?: string;
        role?: string;
      } | null;

      if (!typedResult || !typedResult.success) {
        const errorMessage =
          typedResult?.error || "Error desconocido al aceptar la invitación";
        throw new Error(errorMessage);
      }

      console.log("✅ Invitation accepted successfully");

      // Trigger events to update the UI
      window.dispatchEvent(
        new CustomEvent("tripInvitationAccepted", {
          detail: {
            tripId: typedResult.trip_id,
            role: typedResult.role,
          },
        })
      );

      window.dispatchEvent(
        new CustomEvent("refreshManageTeam", {
          detail: { tripId: typedResult.trip_id },
        })
      );

      toast({
        title: "¡Te has unido al viaje!",
        description: `Ahora eres colaborador de "${typedResult.trip_name}"`,
      });

      if (onAccepted) onAccepted(typedResult.trip_id!);

      // Redirect to trips tab
      navigate(`/?tab=trips`);
    } catch (error: any) {
      console.error("❌ Error accepting invitation:", error);
      toast({
        title: "Error al aceptar invitación",
        description: error.message || "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (token: string) => {
    if (!user) return;

    setProcessing(token);
    try {
      const { data: invitation, error: fetchError } = await supabase
        .from("trip_invitations")
        .select("id, email, status")
        .eq("token", token)
        .single();

      if (fetchError || !invitation) {
        throw new Error("No se encontró la invitación");
      }

      if (invitation.status !== "pending") {
        throw new Error("La invitación ya fue respondida");
      }

      if (invitation.email?.toLowerCase() !== user.email?.toLowerCase()) {
        throw new Error("Esta invitación no corresponde a tu cuenta");
      }

      const { error: updateError } = await supabase
        .from("trip_invitations")
        .update({
          status: "declined",
        })
        .eq("id", invitation.id);

      if (updateError) {
        throw new Error("Error al declinar la invitación");
      }

      toast({
        title: "Invitación declinada",
        description: "Has rechazado la invitación al viaje",
      });

      if (onDeclined) onDeclined();
    } catch (error: any) {
      console.error("Error declining invitation:", error);
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  if (!invitations.length) {
    return null;
  }

  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="font-medium mb-3">Invitaciones activas</h3>
      <div className="space-y-4">
        {invitations.map((invitation) => (
          <div
            key={invitation.token}
            className="border-b pb-4 last:border-0 last:pb-0"
          >
            <h4 className="font-medium">{invitation.tripName}</h4>
            <p className="text-sm text-muted-foreground mb-2">
              {invitation.inviterName} te ha invitado como{" "}
              {invitation.role === "editor" ? "editor" : "espectador"}
            </p>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                onClick={() =>
                  handleAccept(invitation.token, invitation.tripName)
                }
                disabled={!!processing}
                className="bg-primary hover:bg-primary/90"
              >
                {processing === invitation.token ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Aceptando...
                  </>
                ) : (
                  "Aceptar"
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDecline(invitation.token)}
                disabled={!!processing}
              >
                {processing === invitation.token ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Declinando...
                  </>
                ) : (
                  "Declinar"
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ActiveInvitations;
