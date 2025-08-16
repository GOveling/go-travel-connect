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
import { useProfileValidation } from "@/hooks/useProfileValidation";
import { MapPin, Users, Calendar, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import NewUserPersonalInfoModal from "@/components/modals/NewUserPersonalInfoModal";
import { getFormattedDateRange } from "@/utils/dateHelpers";
interface TripDetails {
  id: string;
  name: string;
  description?: string;
  destination: string[];
  dates?: string;
  start_date?: string | null;
  end_date?: string | null;
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
  const { user, session, loading: authLoading } = useAuth();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [invitationStatus, setInvitationStatus] = useState<'loading' | 'authenticating' | 'valid' | 'expired' | 'invalid' | 'accepted' | 'error'>('loading');
  const [isAccepting, setIsAccepting] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [pendingInvitationToken, setPendingInvitationToken] = useState<string | null>(null);
  const [authRetryCount, setAuthRetryCount] = useState(0);

  const { isValid: isProfileValid, requiresOnboarding, validateForInvitation } = useProfileValidation();

  // Get token from URL params (handle both 'token' and 'code' for backward compatibility)
  const token = searchParams.get('token') || searchParams.get('code');

  useEffect(() => {
    console.log('🔍 AcceptInvitation: Component loaded with auth state:', {
      token: token,
      authLoading,
      hasUser: !!user,
      hasSession: !!session,
      userEmail: user?.email,
      sessionAccessToken: session?.access_token ? 'present' : 'missing',
      retryCount: authRetryCount
    });

    if (!token) {
      console.log('❌ No token found in URL parameters');
      setInvitationStatus('invalid');
      return;
    }

    // Clean up URL by removing the code parameter if it exists
    if (searchParams.get('code') && !searchParams.get('token')) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('code');
      newSearchParams.set('token', token);
      navigate(`/accept-invitation?${newSearchParams.toString()}`, { replace: true });
      return;
    }

    // Handle authentication states
    if (authLoading) {
      console.log('⏳ Auth still loading, waiting...');
      setInvitationStatus('authenticating');
      return;
    }

    if (!session) {
      console.log('❌ No session found - user not authenticated');
      // Implement retry mechanism for Google Auth timing issues
      if (authRetryCount < 3) {
        console.log(`🔄 Retrying auth check in 1s (attempt ${authRetryCount + 1}/3)`);
        setTimeout(() => {
          setAuthRetryCount(prev => prev + 1);
        }, 1000);
        return;
      }
      setInvitationStatus('invalid');
      return;
    }

    // Reset retry count on successful session
    if (authRetryCount > 0) {
      setAuthRetryCount(0);
    }

    fetchInvitationDetails();
  }, [token, searchParams, navigate, authLoading, session, user, authRetryCount]);

  const fetchInvitationDetails = async () => {
    if (!token) return;

    console.log('🔍 Fetching invitation details for token:', token);

    try {
      // Fetch invitation details
      const { data: invitationData, error: invitationError } = await supabase
        .from('trip_invitations')
        .select('*')
        .eq('token', token)
        .single();

      console.log('📧 Invitation query result:', { 
        hasData: !!invitationData, 
        error: invitationError?.message,
        invitationEmail: invitationData?.email,
        status: invitationData?.status,
        expiresAt: invitationData?.expires_at
      });

      if (invitationError || !invitationData) {
        console.log('❌ Invalid invitation:', invitationError?.message || 'No data found');
        setInvitationStatus('invalid');
        return;
      }

      // Use session-based authentication check
      const currentUserEmail = session?.user?.email;
      const invitationEmail = invitationData.email?.toLowerCase().trim();
      const normalizedCurrentEmail = currentUserEmail?.toLowerCase().trim();
      
      console.log('📨 Enhanced email validation:', {
        sessionEmail: currentUserEmail,
        invitationEmail: invitationData.email,
        normalizedSessionEmail: normalizedCurrentEmail,
        normalizedInvitationEmail: invitationEmail,
        emailsMatch: normalizedCurrentEmail === invitationEmail,
        hasSession: !!session,
        hasAccessToken: !!session?.access_token
      });

      // Session should already be validated above, but double-check for safety
      if (!normalizedCurrentEmail || !invitationEmail) {
        console.log('❌ Missing email information');
        setInvitationStatus('invalid');
        return;
      }

      if (normalizedCurrentEmail !== invitationEmail) {
        console.log('❌ Email mismatch - invitation is for different user');
        console.log(`Expected: "${invitationEmail}", Got: "${normalizedCurrentEmail}"`);
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
    if (!token || !invitation || !user) return;

    console.log('🚀 Starting invitation acceptance process:', {
      token,
      userEmail: user?.email,
      invitationEmail: invitation?.email,
      hasSession: !!session,
      invitationId: invitation.id
    });

    // Validate profile before attempting to accept
    const validation = validateForInvitation();
    if (!validation.canAccept && validation.requiresOnboarding) {
      console.log('⚠️ User needs to complete onboarding first');
      setPendingInvitationToken(token);
      setShowOnboardingModal(true);
      return;
    }

    setIsAccepting(true);
    try {
      // Use the atomic RPC function for safe transaction processing
      const { data, error } = await supabase.rpc('accept_trip_invitation_v3', {
        p_token: token
      }) as { data: { success: boolean; message?: string; trip_id?: string; role?: string } | null; error: any };

      if (error) {
        console.error("RPC Error:", error);
        throw new Error("Error al procesar la invitación");
      }

      console.log("RPC result:", data);

      if (!data?.success) {
        throw new Error(data?.message || "Error al procesar la invitación");
      }

      console.log('✅ Invitation accepted successfully via RPC');

      // Trigger custom event to refresh trips and update UI
      window.dispatchEvent(new CustomEvent('tripInvitationAccepted', {
        detail: { tripId: invitation.trip_id }
      }));

      toast({
        title: t("invitations.acceptedSuccessfully") || "¡Invitación aceptada!",
        description: t("invitations.welcomeToTrip") || "Te has unido al viaje exitosamente",
      });

      setInvitationStatus('accepted');

      // Redirect to main app after successful acceptance
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Error al aceptar la invitación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleOnboardingComplete = async () => {
    setShowOnboardingModal(false);
    
    if (pendingInvitationToken && invitation && user) {
      console.log('🔄 Continuing invitation acceptance after onboarding');
      
      // Small delay to ensure profile is updated
      setTimeout(async () => {
        setIsAccepting(true);
        try {
          // Use the atomic RPC function for safe transaction processing
          const { data, error } = await supabase.rpc('accept_trip_invitation_v3', {
            p_token: token
          }) as { data: { success: boolean; message?: string; trip_id?: string; role?: string } | null; error: any };

          if (error) {
            console.error("RPC Error:", error);
            throw new Error("Error al procesar la invitación");
          }

          if (!data?.success) {
            throw new Error(data?.message || "Error al procesar la invitación");
          }
          
          // Trigger custom event to refresh trips and update UI
          window.dispatchEvent(new CustomEvent('tripInvitationAccepted', {
            detail: { tripId: invitation.trip_id }
          }));
          
          toast({
            title: t("invitations.acceptedSuccessfully") || "¡Invitación aceptada!",
            description: t("invitations.welcomeToTrip") || "Te has unido al viaje exitosamente",
          });

          setTimeout(() => {
            navigate('/');
          }, 2000);
        } catch (error) {
          console.error('Error accepting invitation after onboarding:', error);
          toast({
            title: "Error",
            description: "Error al completar la aceptación de la invitación",
            variant: "destructive",
          });
        } finally {
          setIsAccepting(false);
          setPendingInvitationToken(null);
        }
      }, 1000);
    }
  };

  const handleDeclineInvitation = async () => {
    if (!token) return;

    try {
      const { data, error } = await supabase.functions.invoke('decline-trip-invitation', {
        body: { token }
      });

      if (!error && data.success) {
        toast({
          title: t("invitations.declined") || "Invitación rechazada",
          description: t("invitations.declinedMessage") || "Has rechazado la invitación al viaje",
        });

        navigate('/');
      } else {
        toast({
          title: "Error",
          description: error?.message || data?.error || t("common.genericError") || "Error al procesar la invitación",
          variant: "destructive",
        });
      }
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
            <p className="text-muted-foreground">{t("common.loading") || "Cargando invitación..."}</p>
          </div>
        );

      case 'authenticating':
        return (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Verificando autenticación...</p>
            {authRetryCount > 0 && (
              <p className="text-xs text-muted-foreground">
                Reintentando... ({authRetryCount}/3)
              </p>
            )}
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
            {/* Enhanced debug information in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-muted-foreground bg-muted p-4 rounded-lg max-w-lg">
                <p><strong>Debug Info:</strong></p>
                <p>Token: {token}</p>
                <p>User Email: {user?.email || 'No user'}</p>
                <p>Session Email: {session?.user?.email || 'No session'}</p>
                <p>User ID: {user?.id?.substring(0, 8) || 'No ID'}...</p>
                <p>Has Session: {session ? 'Yes' : 'No'}</p>
                <p>Has Access Token: {session?.access_token ? 'Yes' : 'No'}</p>
                <p>Auth Loading: {authLoading ? 'Yes' : 'No'}</p>
                <p>Auth Retries: {authRetryCount}</p>
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
                        {getFormattedDateRange(
                          tripDetails?.start_date ? new Date(tripDetails.start_date) : undefined,
                          tripDetails?.end_date ? new Date(tripDetails.end_date) : undefined
                        )}
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

      {/* Onboarding Modal */}
      <NewUserPersonalInfoModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
};

export default AcceptInvitation;