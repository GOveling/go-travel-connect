import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { useInvitationNotifications } from "@/hooks/useInvitationNotifications";
import { MapPin, Calendar, Clock, ExternalLink, Users, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface InvitationNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InvitationNotificationsModal = ({
  isOpen,
  onClose,
}: InvitationNotificationsModalProps) => {
  const { t } = useLanguage();
  const { invitations, loading, markAsRead, getInvitationLink } = useInvitationNotifications();

  const handleViewInvitation = (invitation: any) => {
    markAsRead(invitation.id);
    window.location.href = getInvitationLink(invitation);
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'editor': return t("invitations.roleEditor") || "Editor";
      case 'viewer': return t("invitations.roleViewer") || "Visualizador";
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'editor': return "default";
      case 'viewer': return "secondary";
      default: return "outline";
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span>{t("invitations.title") || "Invitaciones de Viaje"}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t("invitations.title") || "Invitaciones de Viaje"}</span>
            {invitations.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {invitations.length}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto">
          {invitations.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="text-6xl">✈️</div>
              <h3 className="text-lg font-semibold text-foreground">
                {t("invitations.noInvitations") || "No hay invitaciones"}
              </h3>
              <p className="text-muted-foreground">
                {t("invitations.noInvitationsMessage") || "No tienes invitaciones de viaje pendientes en este momento."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <Card key={invitation.id} className="border-l-4 border-l-primary hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground line-clamp-1">
                              {invitation.trip_name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {t("invitations.invitedBy") || "Invitado por"} <span className="font-medium">{invitation.inviter_name}</span>
                            </p>
                          </div>
                          <Badge variant={getRoleBadgeVariant(invitation.role)} className="text-xs">
                            {getRoleText(invitation.role)}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {t("invitations.expires") || "Expira"} {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 sm:ml-4">
                        <Button
                          onClick={() => handleViewInvitation(invitation)}
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>{t("invitations.viewInvitation") || "Ver Invitación"}</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvitationNotificationsModal;