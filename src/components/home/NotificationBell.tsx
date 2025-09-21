import React, { useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Bell, MapPin, Trophy, Utensils, Check } from "lucide-react";
import { useUnifiedNotifications } from "@/hooks/useUnifiedNotifications";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";
import { ActiveInvitations } from "@/components/invitations/ActiveInvitations";

const iconMap = {
  MapPin,
  Trophy,
  Utensils,
};

const NotificationBell = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const popoverContentRef = useRef<HTMLDivElement>(null);
  const {
    activeInvitations,
    completedInvitations,
    generalNotifications,
    loading,
    totalCount,
    markNotificationsAsViewed,
    markGeneralNotificationAsRead,
    markAllGeneralNotificationsAsRead,
    handleAcceptPendingInvitation,
    handleDeclinePendingInvitation,
    handleDeclineInvitation,
    markAsRead,
    getInvitationLink,
    pendingInvitationId,
    pendingInvitationToken
  } = useUnifiedNotifications();

  const handleAcceptInvitation = (token: string, invitationId: string) => {
    navigate(`/accept-invitation?token=${token}`);
    markAsRead(invitationId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Touch event handling for mobile scroll prevention
  useEffect(() => {
    const popoverElement = popoverContentRef.current;
    if (!popoverElement) return;

    let startY = 0;
    let isScrolling = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isScrolling = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isScrolling) {
        const currentY = e.touches[0].clientY;
        const diffY = Math.abs(currentY - startY);
        
        // Determine if it's a vertical scroll
        if (diffY > 5) {
          isScrolling = true;
          
          // Find the scroll container
          const scrollContainer = popoverElement.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollContainer) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
            const isAtTop = scrollTop === 0;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight;
            const scrollingUp = currentY > startY;
            const scrollingDown = currentY < startY;
            
            // Prevent default only if we can scroll in that direction
            if ((scrollingDown && !isAtBottom) || (scrollingUp && !isAtTop)) {
              e.preventDefault();
              e.stopPropagation();
            }
          }
        }
      } else {
        // Continue preventing default for vertical scrolling
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleTouchEnd = () => {
      isScrolling = false;
    };

    popoverElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    popoverElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    popoverElement.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      popoverElement.removeEventListener('touchstart', handleTouchStart);
      popoverElement.removeEventListener('touchmove', handleTouchMove);
      popoverElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div className="relative">
      <Popover onOpenChange={(open) => {
        if (open && totalCount > 0) {
          // Marcar notificaciones como vistas (quitar badge rojo) sin eliminarlas
          markNotificationsAsViewed();
        }
      }}>
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
        <PopoverContent 
          ref={popoverContentRef}
          className="w-80 p-0 touch-pan-y overscroll-contain" 
          align="end"
        >
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notificaciones</h3>
              {generalNotifications.some(n => !n.is_read) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllGeneralNotificationsAsRead}
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
            ) : (activeInvitations.length === 0 && completedInvitations.length === 0 && generalNotifications.length === 0 && !pendingInvitationId) ? (
              <div className="p-4 text-center text-gray-500">
                No tienes notificaciones
              </div>
            ) : (
              <div className="space-y-1">
                {/* Pending Invitation from localStorage */}
                {pendingInvitationId && pendingInvitationToken && (
                  <>
                    <div className="px-4 py-2 bg-blue-50">
                      <h4 className="text-sm font-medium text-blue-700">
                        Invitación pendiente
                      </h4>
                    </div>
                    <div className="p-3 hover:bg-gray-50">
                      <Card className="border-l-4 border-l-blue-500 bg-blue-50">
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            <div>
                              <p className="font-medium text-sm">
                                Tienes una invitación pendiente
                              </p>
                              <p className="text-xs text-gray-600">
                                Revisa tu email para más detalles
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
                    <Separator />
                  </>
                )}

                {/* Active Invitations Section */}
                {activeInvitations.length > 0 && (
                  <>
                    <ActiveInvitations
                      invitations={activeInvitations.map((inv) => ({
                        token: inv.token,
                        tripName: inv.trip_name,
                        inviterName: inv.inviter_name,
                        role: inv.role,
                      }))}
                      onAccepted={() => {
                        window.location.reload();
                      }}
                      onDeclined={() => {
                        window.location.reload();
                      }}
                      className="mx-3 mb-2"
                    />
                    <Separator />
                  </>
                )}

                {/* Completed Invitations Section */}
                {completedInvitations.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-700">
                        Invitaciones completadas
                      </h4>
                    </div>
                    {completedInvitations.map((invitation) => (
                      <div key={invitation.id} className="p-3 hover:bg-gray-50">
                        <Card
                          className={`border-l-4 ${
                            invitation.status === "accepted"
                              ? "border-l-green-500"
                              : "border-l-orange-500"
                          }`}
                        >
                          <CardContent className="p-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">
                                    {invitation.trip_name}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Invitado por {invitation.inviter_name} como{" "}
                                    {invitation.role}
                                  </p>
                                </div>
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${
                                    invitation.status === "accepted"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-orange-100 text-orange-800"
                                  }`}
                                >
                                  {invitation.status === "accepted"
                                    ? "Aceptada"
                                    : "Rechazada"}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                    <Separator />
                  </>
                )}

                {/* General notifications */}
                {generalNotifications.length > 0 && (
                  <>
                    <div className="space-y-2">
                      {generalNotifications.map((notification) => {
                        const IconComponent = iconMap[notification.icon as keyof typeof iconMap] || Bell;
                        const isUnread = !notification.is_read;
                        const isUnviewed = !notification.viewed_at;
                        
                        return (
                          <div 
                            key={notification.id} 
                            className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer group relative mx-2 ${
                              isUnviewed ? 'bg-primary/5 border border-primary/20' : 'hover:bg-accent/50'
                            }`}
                            onClick={() => {
                              if (isUnread) {
                                markGeneralNotificationAsRead(notification.id);
                              }
                            }}
                          >
                            <div className={`p-2 rounded-lg ${notification.color || 'text-blue-600'}`}>
                              <IconComponent size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-sm mb-1 ${
                                isUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'
                              }`}>
                                {notification.title}
                              </h4>
                              <p className={`text-sm mb-2 ${
                                isUnread ? 'text-muted-foreground font-medium' : 'text-muted-foreground/80'
                              }`}>
                                {notification.actor_name} {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground/60">
                                {formatDate(notification.created_at)}
                              </p>
                            </div>
                            {/* Indicador visual para notificaciones no leídas */}
                            {isUnread && (
                              <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full"></div>
                            )}
                            {/* Botón para marcar como leída */}
                            {isUnread && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-6 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markGeneralNotificationAsRead(notification.id);
                                }}
                              >
                                <Check size={12} />
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
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