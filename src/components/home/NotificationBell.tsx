import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Bell, MapPin, Trophy, Utensils } from "lucide-react";
import { useUnifiedNotifications } from "@/hooks/useUnifiedNotifications";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";
import { ActiveInvitations } from "@/components/invitations/ActiveInvitations";

const iconMap = {
  MapPin,
  Trophy,
  Utensils
};

const NotificationBell = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const {
    activeInvitations,
    completedInvitations,
    generalNotifications,
    totalCount,
    loading,
    markInvitationAsRead,
    markGeneralNotificationAsRead,
    markAllNotificationsAsRead,
    getInvitationLink,
    pendingInvitation,
    handleAcceptPendingInvitation,
    handleDeclinePendingInvitation,
    handleDeclineInvitation
  } = useUnifiedNotifications();

  const handleAcceptInvitation = (token: string, invitationId: string) => {
    navigate(`/accept-invitation?token=${token}`);
    markInvitationAsRead(invitationId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="relative">
      <Popover>
        <PopoverTrigger asChild>
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
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notificaciones</h3>
              {totalCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllNotificationsAsRead}
                  className="text-xs"
                >
                  Marcar todas como leídas
                </Button>
              )}
            </div>
          </div>
          
          <ScrollArea className="max-h-96">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Cargando notificaciones...
              </div>
            ) : totalCount === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No tienes notificaciones nuevas
              </div>
            ) : (
              <div className="space-y-1">
                {/* Pending Invitation from localStorage */}
                {pendingInvitation && (
                  <>
                    <div className="px-4 py-2 bg-blue-50">
                      <h4 className="text-sm font-medium text-blue-700">Invitación pendiente</h4>
                    </div>
                    <div className="p-3 hover:bg-gray-50">
                      <Card className="border-l-4 border-l-blue-500 bg-blue-50">
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            <div>
                              <p className="font-medium text-sm">{pendingInvitation.trips?.name}</p>
                              <p className="text-xs text-gray-600">
                                Invitado por {pendingInvitation.inviter?.full_name} como {pendingInvitation.role}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={handleAcceptPendingInvitation}
                                className="flex-1 h-7 text-xs"
                              >
                                Aceptar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDeclinePendingInvitation}
                                className="flex-1 h-7 text-xs"
                              >
                                Rechazar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    {(activeInvitations.length > 0 || completedInvitations.length > 0 || generalNotifications.filter(n => !n.isRead).length > 0) && <Separator />}
                  </>
                )}

                {/* Active Invitations Section with new component */}
                <ActiveInvitations 
                  invitations={activeInvitations.map(inv => ({
                    token: inv.token,
                    tripName: inv.trip_name,
                    inviterName: inv.inviter_name,
                    role: inv.role
                  }))}
                  onAccepted={() => {
                    // Refresh notifications after acceptance
                    window.location.reload();
                  }}
                  onDeclined={() => {
                    // Refresh notifications after decline
                    window.location.reload();
                  }}
                  className="mx-3 mb-2"
                />
                {(completedInvitations.length > 0 || generalNotifications.filter(n => !n.isRead).length > 0) && activeInvitations.length > 0 && <Separator />}

                {/* Completed Invitations Section */}
                {completedInvitations.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-700">Invitaciones completadas</h4>
                    </div>
                    {completedInvitations.map((invitation) => (
                      <div key={invitation.id} className="p-3 hover:bg-gray-50">
                        <Card className={`border-l-4 ${
                          invitation.status === 'accepted' ? 'border-l-green-500' : 'border-l-orange-500'
                        }`}>
                          <CardContent className="p-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">{invitation.trip_name}</p>
                                  <p className="text-xs text-gray-600">
                                    Invitado por {invitation.inviter_name} como {invitation.role}
                                  </p>
                                </div>
                                <Badge 
                                  variant="secondary"
                                  className={`text-xs ${
                                    invitation.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                                  }`}
                                >
                                  {invitation.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                    {generalNotifications.filter(n => !n.isRead).length > 0 && <Separator />}
                  </>
                )}

                {/* General Notifications Section */}
                {generalNotifications.filter(n => !n.isRead).length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-700">Otras notificaciones</h4>
                    </div>
                    {generalNotifications
                      .filter(notification => !notification.isRead)
                      .map((notification) => {
                        const IconComponent = iconMap[notification.icon as keyof typeof iconMap] || Bell;
                        return (
                          <div 
                            key={notification.id} 
                            className="p-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => markGeneralNotificationAsRead(notification.id)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-full ${
                                notification.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                notification.color === 'gold' ? 'bg-yellow-100 text-yellow-600' :
                                notification.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                <IconComponent size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                <p className="text-xs text-gray-600">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </>
                )}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default NotificationBell;
