import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AuthHeader from '@/components/auth/AuthHeader';

interface TripDetails {
  id: string;
  name: string;
  destination: any;
  dates: string;
  travelers: number;
  status: string;
  image?: string;
}

interface InvitationDetails {
  id: string;
  role: string;
  expires_at: string;
  inviter_name: string;
  status: string;
}

const InvitationLanding = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'loading' | 'valid' | 'expired' | 'invalid' | 'accepted'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setLoading(false);
      return;
    }

    fetchInvitationDetails();
  }, [token]);

  useEffect(() => {
    // If user is already logged in, redirect to accept invitation page
    if (user && token) {
      navigate(`/accept-invitation?token=${token}`);
    }
  }, [user, token, navigate]);

  const fetchInvitationDetails = async () => {
    try {
      const { data: invitationData, error: invitationError } = await supabase
        .from('trip_invitations')
        .select('id, role, expires_at, status, inviter_id, trip_id')
        .eq('token', token)
        .single();

      if (invitationError || !invitationData) {
        setStatus('invalid');
        setLoading(false);
        return;
      }

      if (invitationData.status === 'accepted') {
        setStatus('accepted');
        setLoading(false);
        return;
      }

      if (new Date(invitationData.expires_at) < new Date()) {
        setStatus('expired');
        setLoading(false);
        return;
      }

      // Get inviter details
      const { data: inviterData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', invitationData.inviter_id)
        .single();

      // Get trip details
      const { data: tripData } = await supabase
        .from('trips')
        .select('id, name, destination, dates, travelers, status, image')
        .eq('id', invitationData.trip_id)
        .single();

      if (!tripData) {
        setStatus('invalid');
        setLoading(false);
        return;
      }

      setInvitation({
        id: invitationData.id,
        role: invitationData.role,
        expires_at: invitationData.expires_at,
        inviter_name: inviterData?.full_name || 'Usuario',
        status: invitationData.status
      });

      setTrip(tripData);
      setStatus('valid');
    } catch (error) {
      console.error('Error fetching invitation:', error);
      setStatus('invalid');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAndJoin = () => {
    // Store the invitation token in localStorage for auto-acceptance after registration
    localStorage.setItem('invitation_token', token || '');
    navigate('/');
  };

  const getRoleText = (role: string) => {
    return role === 'editor' ? 'Colaborador' : 'Observador';
  };

  const getDestinationText = (destination: any) => {
    if (Array.isArray(destination)) {
      return destination.join(', ');
    }
    return destination || 'Destino no especificado';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Cargando invitación...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (status) {
      case 'expired':
        return (
          <Card className="p-8 text-center">
            <div className="mb-6">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Invitación Expirada</h2>
              <p className="text-gray-600">Esta invitación ha expirado. Contacta al organizador del viaje para solicitar una nueva invitación.</p>
            </div>
          </Card>
        );

      case 'invalid':
        return (
          <Card className="p-8 text-center">
            <div className="mb-6">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">❌</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Invitación Inválida</h2>
              <p className="text-gray-600">Esta invitación no es válida o no existe.</p>
            </div>
          </Card>
        );

      case 'accepted':
        return (
          <Card className="p-8 text-center">
            <div className="mb-6">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Invitación Ya Aceptada</h2>
              <p className="text-gray-600">Esta invitación ya ha sido aceptada.</p>
            </div>
          </Card>
        );

      case 'valid':
        return (
          <>
            <Card className="p-8 mb-6">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">¡Te han invitado a un viaje!</h1>
                <p className="text-gray-600">Únete a <span className="font-semibold">{invitation?.inviter_name}</span> en la planificación de este viaje</p>
              </div>

              {trip?.image && (
                <div className="mb-6">
                  <img 
                    src={trip.image} 
                    alt={trip.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">{trip?.name}</h2>
                  <Badge variant="secondary">
                    {getRoleText(invitation?.role || '')}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{getDestinationText(trip?.destination)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{trip?.dates}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    <span>{trip?.travelers} viajero{(trip?.travelers || 0) > 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>Expira: {new Date(invitation?.expires_at || '').toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button 
                  onClick={handleRegisterAndJoin}
                  className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white px-8 py-3 text-lg"
                >
                  Registrarse y Unirse al Viaje
                </Button>
                <p className="text-sm text-gray-500 mt-3">
                  Al hacer clic, serás redirigido a crear tu cuenta y automáticamente te unirás al viaje
                </p>
              </div>
            </Card>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-orange-500">
      <AuthHeader />
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-2xl">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default InvitationLanding;