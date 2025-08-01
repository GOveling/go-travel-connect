import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Share2, 
  Send, 
  Copy, 
  Check, 
  X, 
  Clock, 
  UserPlus, 
  RefreshCw,
  Crown,
  Edit3,
  Eye,
  Mail,
  Link
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInvitations } from "@/hooks/useInvitations";
import { supabase } from "@/integrations/supabase/client";
import type { Trip } from "@/types";

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  user_id?: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
}

const InviteFriendsModal = ({ isOpen, onClose, trip }: InviteFriendsModalProps) => {
  const [activeTab, setActiveTab] = useState("invite");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("viewer");
  const [customMessage, setCustomMessage] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { toast } = useToast();
  const { 
    loading, 
    invitations, 
    sendInvitation, 
    fetchInvitations, 
    cancelInvitation 
  } = useInvitations();

  // Fetch collaborators and invitations
  useEffect(() => {
    if (isOpen && trip?.id) {
      fetchCollaborators();
      fetchInvitations(trip.id);
    }
  }, [isOpen, trip?.id, refreshKey]);

  // Real-time subscription for invitation changes
  useEffect(() => {
    if (isOpen && trip?.id) {
      const subscription = supabase
        .channel('invitation-changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'trip_invitations' },
            (payload) => {
          setRefreshKey(prev => prev + 1);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isOpen, trip?.id]);

  const fetchCollaborators = async () => {
    if (!trip?.id) return;
    
    setLoadingCollaborators(true);
    try {
      const { data, error } = await supabase
        .from('trip_collaborators')
        .select(`
          id,
          role,
          name,
          email,
          avatar,
          user_id
        `)
        .eq('trip_id', trip.id);

      if (error) {
        console.error('Error fetching collaborators:', error);
        return;
      }

      // Fetch profile data separately for users who have user_id
      const collaboratorData = data || [];
      const userIds = collaboratorData
        .filter(collab => collab.user_id)
        .map(collab => collab.user_id);

      let profilesData: any[] = [];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);
        
        profilesData = profiles || [];
      }

      const formattedCollaborators = collaboratorData.map(collab => {
        const profile = profilesData.find(p => p.id === collab.user_id);
        return {
          id: collab.id,
          name: collab.name || profile?.full_name || 'Unknown User',
          email: collab.email || '',
          role: collab.role,
          avatar: collab.avatar || profile?.avatar_url,
          user_id: collab.user_id
        };
      });

      // Add trip owner as collaborator if not already in the list
      if (trip.user_id) {
        const ownerInCollaborators = formattedCollaborators.find(c => c.user_id === trip.user_id);
        if (!ownerInCollaborators) {
          // Fetch owner profile
          const { data: ownerProfile } = await supabase
            .from('profiles')
            .select('full_name, email, avatar_url')
            .eq('id', trip.user_id)
            .single();

          if (ownerProfile) {
            formattedCollaborators.unshift({
              id: `owner-${trip.user_id}`,
              name: ownerProfile.full_name || 'Trip Owner',
              email: ownerProfile.email || '',
              role: 'owner',
              avatar: ownerProfile.avatar_url,
              user_id: trip.user_id
            });
          }
        }
      }

      setCollaborators(formattedCollaborators);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    } finally {
      setLoadingCollaborators(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!inviteEmail.trim() || !trip?.id) return;

    try {
      await sendInvitation({
        tripId: trip.id,
        email: inviteEmail.trim(),
        role: inviteRole,
        message: customMessage
      });

      setInviteEmail("");
      setCustomMessage("");
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleCopyInviteLink = () => {
    const baseUrl = window.location.origin;
    const inviteLink = `${baseUrl}/trips/${trip.id}/join`;
    navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleUpdateCollaboratorRole = async (collaboratorId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('trip_collaborators')
        .update({ role: newRole })
        .eq('id', collaboratorId);

      if (error) {
        throw error;
      }

      setCollaborators(prev =>
        prev.map(collab =>
          collab.id === collaboratorId
            ? { ...collab, role: newRole }
            : collab
        )
      );

      toast({
        title: "Rol actualizado",
        description: "El rol del colaborador ha sido actualizado exitosamente",
      });
    } catch (error: any) {
      console.error('Error updating collaborator role:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el rol del colaborador",
        variant: "destructive",
      });
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    try {
      const { error } = await supabase
        .from('trip_collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) {
        throw error;
      }

      setCollaborators(prev =>
        prev.filter(collab => collab.id !== collaboratorId)
      );

      toast({
        title: "Colaborador eliminado",
        description: "El colaborador ha sido eliminado del viaje",
      });
    } catch (error: any) {
      console.error('Error removing collaborator:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el colaborador",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pendiente" },
      accepted: { color: "bg-green-100 text-green-800", label: "Aceptado" },
      declined: { color: "bg-red-100 text-red-800", label: "Rechazado" },
      cancelled: { color: "bg-gray-100 text-gray-800", label: "Cancelado" },
      expired: { color: "bg-red-100 text-red-800", label: "Expirado" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={`${config.color} text-xs rounded-lg`}>{config.label}</Badge>;
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (!trip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[95vh] overflow-hidden flex flex-col rounded-xl">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center justify-center space-x-2 text-lg font-semibold text-center">
            <Users className="text-primary" size={22} />
            <span className="truncate">{trip.name}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation - Mobile optimized */}
        <div className="flex bg-muted/50 p-1 rounded-lg mb-4 mx-1">
          {[
            { id: "invite", label: "Invitar", icon: UserPlus },
            { id: "team", label: "Equipo", icon: Users },
            { id: "share", label: "Compartir", icon: Share2 },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className={`flex-1 h-11 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab.id 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} className="mr-1 sm:mr-2" />
              <span className="hidden xs:inline">{tab.label}</span>
            </Button>
          ))}
        </div>

        {/* Invite Tab - Mobile optimized */}
        {activeTab === "invite" && (
          <div className="flex-1 overflow-y-auto space-y-4 px-1">
            <Card className="rounded-xl border-0 bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Mail size={16} className="text-primary" />
                  </div>
                  Invitar por Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">Email del invitado</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="amigo@ejemplo.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="h-12 rounded-lg mt-2 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role" className="text-sm font-medium">Rol</Label>
                    <Select value={inviteRole} onValueChange={(value: "editor" | "viewer") => setInviteRole(value)}>
                      <SelectTrigger className="h-12 rounded-lg mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        <SelectItem value="viewer" className="h-12 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-secondary">
                              <Eye size={14} />
                            </div>
                            <div>
                              <div className="font-medium">Visualizador</div>
                              <div className="text-xs text-muted-foreground">Solo puede ver</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="editor" className="h-12 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                              <Edit3 size={14} className="text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">Editor</div>
                              <div className="text-xs text-muted-foreground">Puede editar</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="message" className="text-sm font-medium">Mensaje personalizado (opcional)</Label>
                  <textarea
                    id="message"
                    className="w-full mt-2 p-3 border rounded-lg text-base resize-none bg-background"
                    rows={3}
                    placeholder="Añade un mensaje personal para la invitación..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleSendInvitation} 
                  disabled={!inviteEmail.trim() || loading}
                  className="w-full h-12 rounded-lg text-base font-medium"
                >
                  {loading ? (
                    <RefreshCw size={18} className="mr-2 animate-spin" />
                  ) : (
                    <Send size={18} className="mr-2" />
                  )}
                  Enviar Invitación
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-0 bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Link size={16} className="text-primary" />
                  </div>
                  Enlace de Invitación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={`${window.location.origin}/trips/${trip.id}/join`}
                      readOnly
                      className="flex-1 bg-background text-sm rounded-lg"
                    />
                    <Button 
                      onClick={handleCopyInviteLink} 
                      variant="outline"
                      className="h-12 px-4 rounded-lg"
                    >
                      {linkCopied ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cualquiera con este enlace puede unirse a tu viaje.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pending Invitations */}
            {invitations.length > 0 && (
              <Card className="rounded-xl border-0 bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <Clock size={16} className="text-orange-500" />
                    </div>
                    Invitaciones Activas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invitations.map((invitation) => (
                      <div key={invitation.id} className="flex items-center justify-between p-4 bg-background rounded-lg shadow-sm">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{invitation.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {getStatusBadge(isExpired(invitation.expires_at) ? 'expired' : invitation.status)}
                            <span className="text-xs text-muted-foreground">
                              {invitation.role}
                            </span>
                          </div>
                        </div>
                        {invitation.status === 'pending' && !isExpired(invitation.expires_at) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelInvitation(invitation.id)}
                            className="ml-3 h-9 w-9 p-0 rounded-lg text-destructive hover:text-destructive"
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Team Tab - Mobile optimized */}
        {activeTab === "team" && (
          <div className="flex-1 overflow-y-auto px-1">
            <Card className="rounded-xl border-0 bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users size={16} className="text-primary" />
                  </div>
                  Colaboradores ({collaborators.length})
                  {loadingCollaborators && <RefreshCw size={16} className="animate-spin ml-2" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {collaborators.map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center p-4 bg-background rounded-lg shadow-sm">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center text-primary-foreground text-base font-medium flex-shrink-0">
                          {collaborator.avatar ? (
                            <img src={collaborator.avatar} alt={collaborator.name} className="w-full h-full rounded-xl object-cover" />
                          ) : (
                            collaborator.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-base truncate">{collaborator.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{collaborator.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-3">
                        {collaborator.role === "owner" ? (
                          <Badge className="bg-yellow-100 text-yellow-800 rounded-lg px-3 py-1">
                            <Crown size={12} className="mr-1" />
                            Propietario
                          </Badge>
                        ) : (
                          <>
                            <Select
                              value={collaborator.role}
                              onValueChange={(value) => handleUpdateCollaboratorRole(collaborator.id, value)}
                            >
                              <SelectTrigger className="w-28 h-9 rounded-lg text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-lg">
                                <SelectItem value="editor" className="rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <Edit3 size={12} />
                                    Editor
                                  </div>
                                </SelectItem>
                                <SelectItem value="viewer" className="rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <Eye size={12} />
                                    Visualizador
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-lg text-destructive hover:text-destructive">
                                  <X size={14} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Eliminar colaborador</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    ¿Estás seguro de que quieres eliminar a {collaborator.name} del viaje? Esta acción no se puede deshacer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-lg">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRemoveCollaborator(collaborator.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {collaborators.length === 0 && !loadingCollaborators && (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="p-4 rounded-xl bg-muted/50 inline-block mb-4">
                        <Users size={32} className="opacity-50" />
                      </div>
                      <p className="text-sm">No hay colaboradores en este viaje aún.</p>
                      <p className="text-xs mt-1">Invita a amigos para compartir la experiencia.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Share Tab - Mobile optimized */}
        {activeTab === "share" && (
          <div className="flex-1 overflow-y-auto px-1">
            <Card className="rounded-xl border-0 bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Share2 size={16} className="text-primary" />
                  </div>
                  Compartir Viaje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Enlace público del viaje</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={`${window.location.origin}/trips/${trip.id}/view`}
                      readOnly
                      className="flex-1 bg-background text-sm rounded-lg"
                    />
                    <Button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/trips/${trip.id}/view`);
                        toast({ title: "Enlace copiado", description: "El enlace ha sido copiado al portapapeles" });
                      }}
                      variant="outline"
                      className="h-12 px-4 rounded-lg"
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col rounded-xl border-2 border-dashed hover:border-solid transition-all"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `Viaje: ${trip.name}`,
                          text: `¡Mira mi viaje a ${Array.isArray(trip.destination) ? trip.destination[0] : trip.destination || 'destinos increíbles'}!`,
                          url: `${window.location.origin}/trips/${trip.id}/view`
                        });
                      }
                    }}
                  >
                    <div className="p-2 rounded-lg bg-primary/10 mb-2">
                      <Share2 size={18} className="text-primary" />
                    </div>
                    <span className="text-sm font-medium">Compartir</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col rounded-xl border-2 border-dashed hover:border-solid transition-all"
                    onClick={() => {
                      const text = `¡Mira mi viaje a ${Array.isArray(trip.destination) ? trip.destination[0] : trip.destination || 'destinos increíbles'}! ${window.location.origin}/trips/${trip.id}/view`;
                      navigator.clipboard.writeText(text);
                      toast({ title: "Texto copiado", description: "El texto ha sido copiado al portapapeles" });
                    }}
                  >
                    <div className="p-2 rounded-lg bg-primary/10 mb-2">
                      <Copy size={18} className="text-primary" />
                    </div>
                    <span className="text-sm font-medium">Copiar texto</span>
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                  Comparte tu viaje con amigos y familiares para que puedan seguir tu aventura.
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InviteFriendsModal;