import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TripOverview } from './TripOverview';
import { TripItinerary } from './TripItinerary';
import { TripCollaborators } from './TripCollaborators';
import { TripSavedPlaces } from './TripSavedPlaces';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const TripDetails = () => {
  const { tripId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('viewer');
  const [collaborators, setCollaborators] = useState([]);
  const [savedPlaces, setSavedPlaces] = useState([]);
  
  // Cargar todos los datos del viaje incluyendo información para colaboradores
  useEffect(() => {
    const fetchTripDetails = async () => {
      if (!tripId || !user) return;
      
      try {
        setLoading(true);
        
        // Obtener detalles del viaje
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select('*')
          .eq('id', tripId)
          .single();
          
        if (tripError) throw tripError;
        
        // Obtener rol del usuario actual en trip_collaborators
        const { data: memberData, error: memberError } = await supabase
          .from('trip_collaborators')
          .select('role')
          .eq('trip_id', tripId)
          .eq('user_id', user.id)
          .single();
          
        if (!tripError && !memberError) {
          // El usuario es miembro o propietario
          setTrip(tripData);
          setUserRole(memberData?.role || (tripData.user_id === user.id ? 'owner' : 'viewer'));
          
          // Cargar colaboradores
          fetchCollaborators();
          
          // Cargar lugares guardados
          fetchSavedPlaces();
        } else {
          // Verificar si el usuario es propietario
          if (tripData?.user_id === user.id) {
            setTrip(tripData);
            setUserRole('owner');
            fetchCollaborators();
            fetchSavedPlaces();
          } else {
            toast({
              title: "Acceso denegado",
              description: "No tienes permisos para ver este viaje",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error("Error fetching trip details:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del viaje",
          variant: "destructive"
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
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!trip) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No se encontró el viaje</h2>
          <p className="text-muted-foreground">El viaje que buscas no existe o no tienes acceso a él.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">{trip.name}</h1>
      
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