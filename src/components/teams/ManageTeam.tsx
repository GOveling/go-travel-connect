import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Loader2, Send, UserPlus, Trash2, Mail, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface ManageTeamProps {
  tripId: string;
  isOpen: boolean;
  onClose: () => void;
  refreshData?: () => void;
}

export function ManageTeam({
  tripId,
  isOpen,
  onClose,
  refreshData,
}: ManageTeamProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState("members");

  // Form data
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");

  // Data lists
  const [members, setMembers] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [completedInvites, setCompletedInvites] = useState<any[]>([]);

  // Trip data
  const [tripDetails, setTripDetails] = useState<any>(null);
  const [userRole, setUserRole] = useState("viewer");

  // Función mejorada para obtener datos
  const fetchData = async () => {
    if (!tripId || !user) return;

    setLoading(true);
    try {
      // Get trip details
      const { data: tripData, error: tripError } = await supabase
        .from("trips")
        .select("*")
        .eq("id", tripId)
        .single();

      if (tripError) throw tripError;
      setTripDetails(tripData);

      // Verificar rol del usuario
      if (tripData.user_id === user.id) {
        setUserRole("owner");
      } else {
        const { data: memberData } = await supabase
          .from("trip_collaborators")
          .select("role")
          .eq("trip_id", tripId)
          .eq("user_id", user.id)
          .single();

        setUserRole(memberData?.role || "viewer");
      }

      // Obtener miembros actuales - USAR TRIP_COLLABORATORS como fuente principal
      const { data: membersData, error: membersError } = await supabase
        .from("trip_collaborators")
        .select(
          `
          id,
          role,
          email,
          name,
          user_id,
          joined_at
        `
        )
        .eq("trip_id", tripId)
        .neq("user_id", user?.id || "");

      if (membersError) throw membersError;

      // Enriquecer con datos de perfil
      const enrichedMembers = await Promise.all(
        (membersData || []).map(async (member) => {
          if (member.user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, avatar_url")
              .eq("id", member.user_id)
              .single();

            return {
              ...member,
              profiles: {
                id: member.user_id,
                email: member.email,
                full_name: profile?.full_name || member.name,
                avatar_url: profile?.avatar_url,
              },
            };
          }
          return {
            ...member,
            profiles: {
              id: null,
              email: member.email,
              full_name: member.name,
              avatar_url: null,
            },
          };
        })
      );

      setMembers(enrichedMembers);

      // Get pending invitations - only for trip owners
      let pendingData = [];
      if (tripData.user_id === user.id) {
        const { data: invitationData, error: pendingError } = await supabase
          .from("trip_invitations")
          .select("*, inviter:inviter_id(full_name)")
          .eq("trip_id", tripId)
          .eq("status", "pending")
          .gt("expires_at", new Date().toISOString());

        if (pendingError) throw pendingError;
        pendingData = invitationData || [];
      }
      setPendingInvites(pendingData);

      // Get completed invitations (accepted or declined) - only for trip owners
      let completedData = [];
      if (tripData.user_id === user.id) {
        const { data: invitationData, error: completedError } = await supabase
          .from("trip_invitations")
          .select("*, inviter:inviter_id(full_name)")
          .eq("trip_id", tripId)
          .in("status", ["accepted", "declined"]);

        if (completedError) throw completedError;
        completedData = invitationData || [];
      }
      setCompletedInvites(completedData);
    } catch (error) {
      console.error("Error fetching team data:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del equipo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load all data
  useEffect(() => {
    if (!isOpen || !tripId) return;
    fetchData();
  }, [tripId, isOpen, user]);

  // Escuchar eventos de invitaciones aceptadas
  useEffect(() => {
    const handleRefreshTeam = (event: CustomEvent) => {
      if (event.detail.tripId === tripId) {
        console.log("🔄 Refreshing team data after invitation accepted");
        fetchData();
      }
    };

    const handleInvitationAccepted = (event: CustomEvent) => {
      if (event.detail.tripId === tripId) {
        console.log("🔄 Invitation accepted, refreshing team data");
        fetchData();
      }
    };

    window.addEventListener(
      "refreshManageTeam",
      handleRefreshTeam as EventListener
    );
    window.addEventListener(
      "tripInvitationAccepted",
      handleInvitationAccepted as EventListener
    );

    return () => {
      window.removeEventListener(
        "refreshManageTeam",
        handleRefreshTeam as EventListener
      );
      window.removeEventListener(
        "tripInvitationAccepted",
        handleInvitationAccepted as EventListener
      );
    };
  }, [tripId]);

  // Configurar subscription de Supabase para cambios en tiempo real
  useEffect(() => {
    if (!isOpen || !tripId) return;

    const subscription = supabase
      .channel(`team-changes-${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trip_invitations",
          filter: `trip_id=eq.${tripId}`,
        },
        (payload) => {
          console.log("🔄 Trip invitation changed:", payload);
          fetchData();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trip_collaborators",
          filter: `trip_id=eq.${tripId}`,
        },
        (payload) => {
          console.log("🔄 Trip collaborator changed:", payload);
          fetchData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [isOpen, tripId]);

  // Send invitation
  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa un correo electrónico",
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);

      // Check if email is already invited
      const emailExists = [
        ...pendingInvites.map((i) => i.email.toLowerCase()),
        ...members.map((m) => m.profiles?.email?.toLowerCase()).filter(Boolean),
      ].includes(email.toLowerCase());

      if (emailExists) {
        toast({
          title: "Invitación duplicada",
          description: "Esta persona ya ha sido invitada o ya es miembro",
          variant: "destructive",
        });
        return;
      }

      // Generate a unique token
      const token = crypto.randomUUID();

      // Calculate expiration date (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Create invitation
      const { error } = await supabase.from("trip_invitations").insert({
        trip_id: tripId,
        email: email.toLowerCase(),
        role: role,
        status: "pending",
        inviter_id: user?.id,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        token: token,
      });

      if (error) throw error;

      toast({
        title: "Invitación enviada",
        description: `Se ha enviado una invitación a ${email}`,
      });

      // Clear form and refresh data
      setEmail("");

      // Refresh invitations list
      const { data: refreshedInvites } = await supabase
        .from("trip_invitations")
        .select("*, inviter:inviter_id(full_name)")
        .eq("trip_id", tripId)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString());

      setPendingInvites(refreshedInvites || []);
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar la invitación",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  // Handle invitation cancelation
  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from("trip_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;

      // Update local state
      setPendingInvites((prev) =>
        prev.filter((inv) => inv.id !== invitationId)
      );

      toast({
        title: "Invitación cancelada",
        description: "La invitación ha sido eliminada",
      });
    } catch (error) {
      console.error("Error canceling invitation:", error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la invitación",
        variant: "destructive",
      });
    }
  };

  // Handle member removal
  const handleRemoveMember = async (memberId: string) => {
    try {
      // Locate member to get user_id
      const member = members.find((m) => m.id === memberId);
      if (!member || !member.user_id) {
        toast({
          title: "Error",
          description: "No se encontró el usuario del miembro",
          variant: "destructive",
        });
        return;
      }

      // Call RPC to archive debts, clean participation and remove collaborator
      const { data, error } = await supabase.rpc(
        "remove_collaborator_and_archive",
        {
          p_trip_id: tripId,
          p_user_id: member.user_id,
        }
      );

      if (error) throw error;

      // Update local state
      setMembers((prev) => prev.filter((mem) => mem.id !== memberId));

      // Notify that a collaborator was removed to refresh trips lists
      window.dispatchEvent(new CustomEvent("collaboratorRemoved"));

      // Optionally refresh parent data
      if (refreshData) refreshData();

      const backupCount = (data as any)?.backup_count ?? 0;
      toast({
        title: "Miembro eliminado",
        description:
          backupCount > 0
            ? `Se archivaron ${backupCount} respaldo(s) de deuda.`
            : "Participación eliminada y datos archivados",
      });
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar al miembro",
        variant: "destructive",
      });
    }
  };

  // Handle role change
  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("trip_collaborators")
        .update({
          role: newRole,
        })
        .eq("id", memberId);

      if (error) throw error;

      // Update local state
      setMembers((prev) =>
        prev.map((mem) =>
          mem.id === memberId ? { ...mem, role: newRole } : mem
        )
      );

      toast({
        title: "Rol actualizado",
        description: "El rol del miembro ha sido actualizado",
      });
    } catch (error) {
      console.error("Error changing role:", error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el rol del miembro",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Administrar Equipo</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="members">Miembros</TabsTrigger>
            <TabsTrigger value="invitations">Invitaciones</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          {/* MEMBERS TAB */}
          <TabsContent value="members">
            {loading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Owner info */}
                {tripDetails && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            {tripDetails.user_id === user?.id ? (
                              <span className="font-bold text-lg">
                                {user.email?.charAt(0).toUpperCase()}
                              </span>
                            ) : (
                              <span className="font-bold text-lg">O</span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">
                              {tripDetails.user_id === user?.id
                                ? "Tú"
                                : "Propietario"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {tripDetails.user_id === user?.id
                                ? user.email
                                : ""}
                            </div>
                          </div>
                        </div>
                        <Badge>Propietario</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Members list */}
                {members.length > 0 ? (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <Card key={member.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="font-medium">
                                  {member.profiles?.full_name?.charAt(0) ||
                                    member.profiles?.email
                                      ?.charAt(0)
                                      .toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">
                                  {member.profiles?.full_name || "Usuario"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {member.profiles?.email}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {userRole === "owner" && (
                                <>
                                  <Select
                                    defaultValue={member.role}
                                    onValueChange={(value) =>
                                      handleChangeRole(member.id, value)
                                    }
                                  >
                                    <SelectTrigger className="w-24">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="editor">
                                        Editor
                                      </SelectItem>
                                      <SelectItem value="viewer">
                                        Visualizador
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleRemoveMember(member.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}

                              {userRole !== "owner" && (
                                <Badge
                                  variant={
                                    member.role === "editor"
                                      ? "default"
                                      : "outline"
                                  }
                                >
                                  {member.role === "editor"
                                    ? "Editor"
                                    : "Visualizador"}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-md">
                    <UserPlus className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      No hay miembros adicionales en este viaje
                    </p>
                    {userRole === "owner" && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setActiveTab("invitations")}
                      >
                        Invitar colaboradores
                      </Button>
                    )}
                  </div>
                )}

                {/* Add member form - Only for owners */}
                {userRole === "owner" && (
                  <div className="pt-4 mt-4 border-t">
                    <h3 className="text-sm font-medium mb-3">
                      Invitar a un nuevo miembro
                    </h3>
                    <form onSubmit={handleSendInvitation} className="space-y-4">
                      <div className="grid grid-cols-5 gap-3">
                        <Input
                          className="col-span-3"
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <Select value={role} onValueChange={setRole}>
                          <SelectTrigger className="col-span-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Visualizador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={sending}
                      >
                        {sending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Enviar invitación
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* INVITATIONS TAB */}
          <TabsContent value="invitations">
            {loading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : pendingInvites.length > 0 ? (
              <div className="space-y-3">
                {pendingInvites.map((invite) => (
                  <Card key={invite.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{invite.email}</span>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Expira:{" "}
                              {format(
                                new Date(invite.expires_at),
                                "dd/MM/yyyy"
                              )}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">
                              {invite.role === "editor"
                                ? "Editor"
                                : "Visualizador"}
                            </Badge>
                            <Badge variant="secondary">Pendiente</Badge>
                          </div>
                        </div>

                        {userRole === "owner" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCancelInvitation(invite.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md">
                <Mail className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  No hay invitaciones pendientes
                </p>
              </div>
            )}

            {/* Show invitation form on this tab as well */}
            {userRole === "owner" && (
              <div className="pt-4 mt-4 border-t">
                <h3 className="text-sm font-medium mb-3">
                  Invitar a un nuevo miembro
                </h3>
                <form onSubmit={handleSendInvitation} className="space-y-4">
                  <div className="grid grid-cols-5 gap-3">
                    <Input
                      className="col-span-3"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="col-span-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={sending}>
                    {sending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar invitación
                      </>
                    )}
                  </Button>
                </form>
              </div>
            )}
          </TabsContent>

          {/* HISTORY TAB */}
          <TabsContent value="history">
            {loading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : completedInvites.length > 0 ? (
              <div className="space-y-3">
                {completedInvites.map((invite) => (
                  <Card key={invite.id}>
                    <CardContent className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{invite.email}</span>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {invite.status === "accepted"
                              ? "Aceptada"
                              : "Rechazada"}
                            :{" "}
                            {invite.accepted_at
                              ? format(
                                  new Date(invite.accepted_at),
                                  "dd/MM/yyyy"
                                )
                              : format(
                                  new Date(invite.updated_at),
                                  "dd/MM/yyyy"
                                )}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">
                            {invite.role === "editor"
                              ? "Editor"
                              : "Visualizador"}
                          </Badge>
                          <Badge
                            variant={
                              invite.status === "accepted"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {invite.status === "accepted"
                              ? "Aceptada"
                              : "Rechazada"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md">
                <Mail className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  No hay historial de invitaciones
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
