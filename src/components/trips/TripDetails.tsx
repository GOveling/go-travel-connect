import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { MapPin, Users, Calendar, Edit } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { TripOverview } from './TripOverview';
import { TripItinerary } from './TripItinerary';
import { TripCollaborators } from './TripCollaborators';
import { TripSavedPlaces } from './TripSavedPlaces';

export const TripDetails = () => {
  const { tripId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('viewer');
  const [collaborators, setCollaborators] = useState([]);
  const [savedPlaces, setSavedPlaces] = useState([]);
  
  // Cargar datos del trip y verificar permisos
  useEffect(() => {
    const fetchTripDetails = async () => {
      if (!tripId || !user) return;

      try {
        setLoading(true);
        
        // 1. Verificar si el usuario es el propietario
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select('*')
          .eq('id', tripId)
          .single();
          
        if (tripError) throw tripError;
        
        let role = 'viewer';
        if (tripData.user_id === user.id) {
          role = 'owner';
        } else {
          // 2. Verificar si el usuario es un colaborador usando la función existente
          const { data: canEdit } = await supabase.rpc('can_edit_trip', {
            p_trip_id: tripId,
            p_user_id: user.id
          });
          
          if (canEdit) {
            // Obtener el rol específico del colaborador
            const { data: memberData, error: memberError } = await supabase
              .from('trip_collaborators')
              .select('role')
              .eq('trip_id', tripId)
              .eq('user_id', user.id)
              .single();
              
            if (!memberError && memberData) {
              role = memberData.role;
            }
          } else {
            // Verificar si tiene acceso como viewer
            const { data: isCollaborator } = await supabase.rpc('is_trip_collaborator', {
              trip_id: tripId,
              user_id: user.id
            });
            
            if (isCollaborator) {
              const { data: memberData } = await supabase
                .from('trip_collaborators')
                .select('role')
                .eq('trip_id', tripId)
                .eq('user_id', user.id)
                .single();
              
              if (memberData) {
                role = memberData.role;
              }
            } else {
              toast({
                title: "Acceso denegado",
                description: "No tienes acceso a este viaje",
                variant: "destructive",
              });
              return;
            }
          }
        }
        
        setUserRole(role);
        setTrip(tripData);
        
        // Cargar colaboradores y lugares guardados
        fetchCollaborators();
        fetchSavedPlaces();
        
        console.log("Datos del viaje cargados:", tripData);
        console.log("Rol del usuario:", role);
        
      } catch (error) {
        console.error("Error al cargar detalles:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del viaje",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [tripId, user, toast]);
  
  // Función para cargar colaboradores
  const fetchCollaborators = async () => {
    if (!tripId) return;
    
    try {
      const allCollaborators: any[] = [];
      
      // Obtener información del trip para el propietario
      const { data: tripData } = await supabase
        .from('trips')
        .select('user_id')
        .eq('id', tripId)
        .single();
        
      if (tripData?.user_id) {
        // Obtener info del propietario
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, email')
          .eq('id', tripData.user_id)
          .single();
          
        if (ownerProfile) {
          allCollaborators.push({
            ...ownerProfile,
            role: 'owner',
            isOwner: true
          });
        }
      }
        
      // Obtener colaboradores
      const { data: membersData } = await supabase
        .from('trip_collaborators')
        .select('role, user_id')
        .eq('trip_id', tripId);
        
      if (membersData && membersData.length > 0) {
        // Obtener perfiles de los colaboradores
        const userIds = membersData.map(member => member.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, email')
          .in('id', userIds);
          
        if (profiles) {
          profiles.forEach(profile => {
            const memberData = membersData.find(m => m.user_id === profile.id);
            if (memberData) {
              allCollaborators.push({
                ...profile,
                role: memberData.role,
                isOwner: false
              });
            }
          });
        }
      }
      
      setCollaborators(allCollaborators);
      
      // Actualizar tipo a grupo si hay colaboradores
      if (membersData && membersData.length > 0) {
        await supabase
          .from('trips')
          .update({ is_group_trip: true })
          .eq('id', tripId);
      }
      
    } catch (error) {
      console.error("Error fetching collaborators:", error);
    }
  };
  
  // Función para cargar lugares guardados
  const fetchSavedPlaces = async () => {
    if (!tripId) return;
    
    try {
      const { data, error } = await supabase
        .from('saved_places')
        .select('*')
        .eq('trip_id', tripId)
        .order('position_order', { ascending: true });
        
      if (error) throw error;
      setSavedPlaces(data || []);
    } catch (error) {
      console.error("Error fetching saved places:", error);
    }
  };
  
  // Formatear rango de fechas
  const formatDateRange = () => {
    if (!trip?.start_date) return 'Sin fechas definidas';
    
    const start = new Date(trip.start_date);
    if (!trip.end_date) return format(start, 'PPP');
    
    const end = new Date(trip.end_date);
    return `${format(start, 'PPP')} - ${format(end, 'PPP')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size={48} />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-bold">Viaje no encontrado</h2>
        <p className="mt-2 text-gray-500">El viaje solicitado no existe o no tienes acceso.</p>
        <Link to="/trips">
          <Button className="mt-4">Volver a mis viajes</Button>
        </Link>
      </div>
    );
  }

  // Verificar si puede editar (propietario o editor)
  const canEdit = userRole === 'owner' || userRole === 'editor';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{trip.name}</h1>
          <div className="flex items-center gap-2 text-gray-600 mt-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDateRange()}</span>
          </div>
          {trip.location && (
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <MapPin className="h-4 w-4" />
              <span>{trip.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600 mt-1">
            <Users className="h-4 w-4" />
            <span>{trip.is_group_trip ? 'Viaje grupal' : 'Viaje individual'}</span>
          </div>
        </div>
        
        {canEdit && (
          <Link to={`/trips/${tripId}/edit`}>
            <Button className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              <span>Editar viaje</span>
            </Button>
          </Link>
        )}
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="itinerary">Itinerario</TabsTrigger>
          <TabsTrigger value="places">Lugares</TabsTrigger>
          <TabsTrigger value="collaborators">Colaboradores</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <TripOverview 
            trip={trip}
            userRole={userRole}
            onUpdate={(updatedTrip) => setTrip({...trip, ...updatedTrip})}
          />
        </TabsContent>
        
        <TabsContent value="itinerary">
          <TripItinerary 
            tripId={tripId!}
            userRole={userRole}
          />
        </TabsContent>
        
        <TabsContent value="places">
          <TripSavedPlaces 
            places={savedPlaces}
            tripId={tripId!}
            userRole={userRole}
            onUpdate={fetchSavedPlaces}
          />
        </TabsContent>
        
        <TabsContent value="collaborators">
          <TripCollaborators 
            collaborators={collaborators}
            tripId={tripId!}
            userRole={userRole}
            onUpdate={fetchCollaborators}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};