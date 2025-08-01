import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useInvitations } from "@/hooks/useInvitations";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { MapPin, Users, Calendar, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

interface TripDetails {
  id: string;
  name: string;
  description?: string;
  destination: string[];
  dates: string;
  image?: string;
  travelers: number;
  status: string;
}

interface InvitationDetails {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  trip_id: string;
  inviter_name?: string;
}

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { acceptInvitation, loading } = useInvitations();
  const { user, session } = useAuth();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [invitationStatus, setInvitationStatus] = useState<'loading' | 'valid' | 'expired' | 'invalid' | 'accepted' | 'error'>('loading');
  const [isAccepting, setIsAccepting] = useState(false);

  // Get token from URL params (handle both 'token' and 'code' for backward compatibility)
  const token = searchParams.get('token') || searchParams.get('code');

  useEffect(() => {
    console.log('🔍 AcceptInvitation: Component loaded with full context:', {
      token: token,
      allParams: Object.fromEntries(searchParams.entries()),
      fullURL: window.location.href,
      authState: {
        hasUser: !!user,
        hasSession: !!session,
        userEmail: user?.email,
        userId: user?.id?.substring(0, 8) + "...",
      }
    });

    if (!token) {
      console.log('No token found in URL parameters');
      setInvitationStatus('invalid');
      return;
    }

    // Clean up URL by removing the code parameter if it exists
    if (searchParams.get('code') && !searchParams.get('token')) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('code');
      newSearchParams.set('token', token);
      navigate(`/accept-invitation?${newSearchParams.toString()}`, { replace: true });
    }

    fetchInvitationDetails();
  }, [token, searchParams, navigate]);

  const fetchInvitationDetails = async () => {
    if (!token) return;

    console.log('Fetching invitation details for token:', token);

    try {
      // Fetch invitation details
      const { data: invitationData, error: invitationError } = await supabase
        .from('trip_invitations')
        .select('*')
        .eq('token', token)
        .single();

      console.log('📧 Invitation query result:', { invitationData, invitationError });

      if (invitationError || !invitationData) {
        console.log('❌ Invalid invitation:', invitationError?.message || 'No data found');
        setInvitationStatus('invalid');
        return;
      }

      // Check email match with current user
      const currentUserEmail = user?.email;
      const invitationEmail = invitationData.email;
      
      console.log('📨 Email validation:', {
        currentUserEmail,
        invitationEmail,
        emailsMatch: currentUserEmail === invitationEmail,
        userAuthenticated: !!user
      });

      if (!user) {
        console.log('❌ User not authenticated');
        setInvitationStatus('invalid');
        return;
      }

      if (currentUserEmail !== invitationEmail) {
        console.log('❌ Email mismatch - invitation is for different user');
        setInvitationStatus('invalid');
        return;
      }

      // Check if invitation is expired
      const expiresAt = new Date(invitationData.expires_at);
      const now = new Date();
      
      if (now > expiresAt) {
        setInvitationStatus('expired');
        return;
      }

      // Check if already accepted
      if (invitationData.status === 'accepted') {
        setInvitationStatus('accepted');
        return;
      }

      // Fetch inviter details
      const { data: inviterData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', invitationData.inviter_id)
        .single();

      setInvitation({
        ...invitationData,
        inviter_name: inviterData?.full_name || 'Someone'
      });

      // Fetch trip details
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', invitationData.trip_id)
        .single();

      if (tripError || !tripData) {
        setInvitationStatus('invalid');
        return;
      }

      let parsedDestination: string[] = [];
      try {
        parsedDestination = Array.isArray(tripData.destination) 
          ? tripData.destination 
          : JSON.parse(String(tripData.destination) || '[]');
      } catch {
        parsedDestination = [];
      }

      setTripDetails({
        ...tripData,
        destination: parsedDestination
      });

      setInvitationStatus('valid');
    } catch (error) {
      console.error('Error fetching invitation details:', error);
      setInvitationStatus('error');
    }
  };

  const handleAcceptInvitation = async () => {
    if (!token) return;

    console.log('🚀 Starting invitation acceptance process:', {
      token,
      userEmail: user?.email,
      invitationEmail: invitation?.email,
      hasSession: !!session
    });

    setIsAccepting(true);
    try {
      await acceptInvitation(token);
      
      toast({
        title: t("invitations.acceptedSuccessfully") || "¡Invitación aceptada!",
        description: t("invitations.welcomeToTrip") || "Te has unido al viaje exitosamente",
      });

      // Redirect to main app after successful acceptance
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error accepting invitation:', error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDeclineInvitation = async () => {
    if (!invitation) return;

    try {
      const { error } = await supabase
        .from('trip_invitations')
        .update({ status: 'declined' })
        .eq('id', invitation.id);

      if (error) throw error;

      toast({
        title: t("invitations.declined") || "Invitación rechazada",
        description: t("invitations.declinedMessage") || "Has rechazado la invitación al viaje",
      });

      navigate('/');
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast({
        title: "Error",
        description: t("common.genericError") || "Error al procesar la invitación",
        variant: "destructive",
      });
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'editor': return t("invitations.roleEditor") || "Editor";
      case 'viewer': return t("invitations.roleViewer") || "Visualizador";
      default: return role;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return t("trips.status.upcoming") || "Próximo";
      case 'planning': return t("trips.status.planning") || "Planificando";
      case 'completed': return t("trips.status.completed") || "Completado";
      default: return status;
    }
  };

  const renderContent = () => {
    switch (invitationStatus) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">{t("common.loading") || "Cargando..."}</p>
          </div>
        );

      case 'expired':
        return (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Clock className="h-16 w-16 text-orange-500" />
            <h2 className="text-2xl font-bold text-foreground">{t("invitations.expired") || "Invitación Expirada"}</h2>
            <p className="text-muted-foreground text-center max-w-md">
              {t("invitations.expiredMessage") || "Esta invitación ha expirado. Contacta al organizador del viaje para obtener una nueva invitación."}
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              {t("common.backToHome") || "Volver al Inicio"}
            </Button>
          </div>
        );

      case 'invalid':
        return (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <XCircle className="h-16 w-16 text-destructive" />
            <h2 className="text-2xl font-bold text-foreground">{t("invitations.invalid") || "Invitación Inválida"}</h2>
            <p className="text-muted-foreground text-center max-w-md">
              {t("invitations.invalidMessage") || "Esta invitación no es válida o ya no existe."}
            </p>
            {/* Debug information in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-muted-foreground bg-muted p-4 rounded-lg max-w-lg">
                <p><strong>Debug Info:</strong></p>
                <p>Token: {token}</p>
                <p>User Email: {user?.email || 'No user'}</p>
                <p>User ID: {user?.id || 'No ID'}</p>
                <p>Has Session: {session ? 'Yes' : 'No'}</p>
              </div>
            )}
            <Button onClick={() => navigate('/')} variant="outline">
              {t("common.backToHome") || "Volver al Inicio"}
            </Button>
          </div>
        );

      case 'accepted':
        return (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold text-foreground">{t("invitations.alreadyAccepted") || "Ya Aceptada"}</h2>
            <p className="text-muted-foreground text-center max-w-md">
              {t("invitations.alreadyAcceptedMessage") || "Ya has aceptado esta invitación anteriormente."}
            </p>
            <Button onClick={() => navigate('/')}>
              {t("common.backToHome") || "Volver al Inicio"}
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <XCircle className="h-16 w-16 text-destructive" />
            <h2 className="text-2xl font-bold text-foreground">{t("common.error") || "Error"}</h2>
            <p className="text-muted-foreground text-center max-w-md">
              {t("invitations.errorMessage") || "Ocurrió un error al procesar la invitación."}
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              {t("common.backToHome") || "Volver al Inicio"}
            </Button>
          </div>
        );

      case 'valid':
        return (
          <div className="space-y-6">
            {/* Invitation Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                {t("invitations.youAreInvited") || "¡Estás Invitado!"}
              </h1>
              <p className="text-muted-foreground">
                {invitation?.inviter_name} {t("invitations.invitedYouTo") || "te ha invitado a"} 
                <span className="font-semibold text-foreground"> {tripDetails?.name}</span>
              </p>
            </div>

            {/* Trip Details Card */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                <CardTitle className="flex items-center space-x-3">
                  <span className="text-3xl">{tripDetails?.image || "✈️"}</span>
                  <div>
                    <h3 className="text-xl font-bold">{tripDetails?.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className="text-xs">
                        {getStatusText(tripDetails?.status || '')}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getRoleText(invitation?.role || '')}
                      </Badge>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4 pt-6">
                {tripDetails?.description && (
                  <p className="text-muted-foreground">{tripDetails.description}</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">
                        {t("trips.destination") || "Destino"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {tripDetails?.destination?.length ? 
                          tripDetails.destination.slice(0, 2).join(", ") + 
                          (tripDetails.destination.length > 2 ? "..." : "") 
                          : "Multiple destinations"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">
                        {t("trips.dates") || "Fechas"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {tripDetails?.dates}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">
                        {t("trips.travelers") || "Viajeros"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {tripDetails?.travelers} {t("trips.people") || "personas"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={handleAcceptInvitation} 
                disabled={isAccepting || loading}
                className="flex-1 h-12 text-base font-semibold"
                size="lg"
              >
                {isAccepting || loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("invitations.accepting") || "Aceptando..."}
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {t("invitations.acceptInvite") || "Aceptar Invitación"}
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleDeclineInvitation} 
                variant="outline" 
                className="flex-1 h-12 text-base"
                size="lg"
              >
                <XCircle className="mr-2 h-4 w-4" />
                {t("invitations.decline") || "Rechazar"}
              </Button>
            </div>

            {/* Role Information */}
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <h4 className="font-medium mb-2">
                  {t("invitations.rolePermissions") || "Permisos del Rol"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {invitation?.role === 'editor' 
                    ? (t("invitations.editorPermissions") || "Como editor, podrás ver y modificar los detalles del viaje, agregar lugares y colaborar en la planificación.")
                    : (t("invitations.viewerPermissions") || "Como visualizador, podrás ver los detalles del viaje pero no modificarlos.")
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;