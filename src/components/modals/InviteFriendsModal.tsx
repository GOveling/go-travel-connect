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
    return <Badge className={`${config.color} text-xs`}>{config.label}</Badge>;
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (!trip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Users className="text-primary" size={20} />
            <span>Gestionar Colaboración - {trip.name}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-6">
          {[
            { id: "invite", label: "Invitar Amigos", icon: UserPlus },
            { id: "team", label: "Equipo", icon: Users },
            { id: "share", label: "Compartir", icon: Share2 },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className={`flex-1 text-xs sm:text-sm ${
                activeTab === tab.id ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={16} className="mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Invite Tab */}
        {activeTab === "invite" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail size={18} />
                  Invitar por Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email del invitado</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="amigo@ejemplo.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Rol</Label>
                    <Select value={inviteRole} onValueChange={(value: "editor" | "viewer") => setInviteRole(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">
                          <div className="flex items-center gap-2">
                            <Eye size={16} />
                            Visualizador - Solo puede ver
                          </div>
                        </SelectItem>
                        <SelectItem value="editor">
                          <div className="flex items-center gap-2">
                            <Edit3 size={16} />
                            Editor - Puede editar
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="message">Mensaje personalizado (opcional)</Label>
                  <textarea
                    id="message"
                    className="w-full mt-1 p-2 border rounded-md text-sm resize-none"
                    rows={3}
                    placeholder="Añade un mensaje personal para la invitación..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleSendInvitation} 
                  disabled={!inviteEmail.trim() || loading}
                  className="w-full"
                >
                  {loading ? (
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Send size={16} className="mr-2" />
                  )}
                  Enviar Invitación
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link size={18} />
                  Enlace de Invitación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}/trips/${trip.id}/join`}
                    readOnly
                    className="flex-1 bg-muted text-sm"
                  />
                  <Button onClick={handleCopyInviteLink} variant="outline">
                    {linkCopied ? <Check size={16} /> : <Copy size={16} />}
                    {linkCopied ? "¡Copiado!" : "Copiar"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Cualquiera con este enlace puede unirse a tu viaje.
                </p>
              </CardContent>
            </Card>

            {/* Pending Invitations */}
            {invitations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock size={18} />
                    Invitaciones Pendientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invitations.map((invitation) => (
                      <div key={invitation.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{invitation.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(isExpired(invitation.expires_at) ? 'expired' : invitation.status)}
                            <span className="text-xs text-muted-foreground">
                              Rol: {invitation.role}
                            </span>
                          </div>
                        </div>
                        {invitation.status === 'pending' && !isExpired(invitation.expires_at) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelInvitation(invitation.id)}
                            className="text-destructive hover:text-destructive"
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

        {/* Team Tab */}
        {activeTab === "team" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={18} />
                Colaboradores Actuales
                {loadingCollaborators && <RefreshCw size={16} className="animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                        {collaborator.avatar ? (
                          <img src={collaborator.avatar} alt={collaborator.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          collaborator.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{collaborator.name}</p>
                        <p className="text-xs text-muted-foreground">{collaborator.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {collaborator.role === "owner" ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Crown size={12} className="mr-1" />
                          Propietario
                        </Badge>
                      ) : (
                        <>
                          <Select
                            value={collaborator.role}
                            onValueChange={(value) => handleUpdateCollaboratorRole(collaborator.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="editor">
                                <div className="flex items-center gap-2">
                                  <Edit3 size={12} />
                                  Editor
                                </div>
                              </SelectItem>
                              <SelectItem value="viewer">
                                <div className="flex items-center gap-2">
                                  <Eye size={12} />
                                  Visualizador
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                                <X size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminar Colaborador</AlertDialogTitle>
                                <AlertDialogDescription>
                                  ¿Estás seguro de que quieres eliminar a {collaborator.name} de este viaje? 
                                  Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveCollaborator(collaborator.id)}
                                  className="bg-destructive hover:bg-destructive/90"
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
                  <p className="text-center text-muted-foreground py-8">
                    Aún no hay colaboradores en este viaje
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Share Tab */}
        {activeTab === "share" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Viaje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Destino</p>
                    <p className="text-sm text-muted-foreground">
                      {Array.isArray(trip.destination) ? trip.destination.join(', ') : trip.destination}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Fechas</p>
                    <p className="text-sm text-muted-foreground">{trip.dates}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Viajeros</p>
                    <p className="text-sm text-muted-foreground">{trip.travelers} personas</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Presupuesto</p>
                    <p className="text-sm text-muted-foreground">{trip.budget || 'No especificado'}</p>
                  </div>
                </div>
                {trip.description && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Descripción</p>
                    <p className="text-sm text-muted-foreground">{trip.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Opciones de Compartir</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="w-full">
                    <Share2 size={16} className="mr-2" />
                    Compartir por Email
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Copy size={16} className="mr-2" />
                    Copiar Enlace del Itinerario
                  </Button>
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