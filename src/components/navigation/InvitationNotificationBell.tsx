import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useInvitationNotifications } from "@/hooks/useInvitationNotifications";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const InvitationNotificationBell = () => {
  const { invitations, loading, markAsRead, totalCount } = useInvitationNotifications();
  const navigate = useNavigate();

  const handleAcceptInvitation = (token: string, invitationId: string) => {
    markAsRead(invitationId);
    navigate(`/accept-invitation?token=${token}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2 hover:bg-gray-100 rounded-full"
          >
            <Bell size={24} className="text-gray-600" />
            {totalCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
              >
                {totalCount > 9 ? "9+" : totalCount}
              </Badge>
            )}
          </Button>
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Invitaciones de Viaje
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-0">
            {loading ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Cargando invitaciones...
              </div>
            ) : invitations.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No tienes invitaciones pendientes
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {invitation.trip_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Invitado por {invitation.inviter_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Rol: {invitation.role === 'editor' ? 'Editor' : 'Observador'}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground ml-2">
                        {formatDate(invitation.expires_at)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        className="h-7 text-xs flex-1"
                        onClick={() => handleAcceptInvitation(invitation.token, invitation.id)}
                      >
                        Aceptar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => markAsRead(invitation.id)}
                      >
                        Descartar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default InvitationNotificationBell;