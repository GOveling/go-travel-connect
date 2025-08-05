import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useInvitationNotifications } from '@/hooks/useInvitationNotifications';

// Components
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader } from '@/components/ui/loader';
import TripCard from '@/components/trips/TripCard';
import TripDetailModal from '@/components/modals/TripDetailModal';
import { EditTripModal } from '@/components/modals/EditTripModal';
import NewTripModal from '@/components/modals/NewTripModal';
import ActiveInvitations from '@/components/invitations/ActiveInvitations';
import NotificationBell from '@/components/home/NotificationBell';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Icons
import { Plus, Search, MapPin, Calendar, ChevronRight } from 'lucide-react';

export function HomePage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { invitations, loading: invitationsLoading } = useInvitationNotifications();
  
  // Main navigation state
  const [activeSection, setActiveSection] = useState('home');
  
  // Trips state
  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [profile, setProfile] = useState(null);
  
  // Modal states
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [showEditTrip, setShowEditTrip] = useState(false);
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  
  // Current tab in My Trips
  const [tripsTab, setTripsTab] = useState('upcoming');

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      setProfile(data);
    };
    
    fetchProfile();
  }, [user]);
  
  // Fetch user's trips
  useEffect(() => {
    const fetchTrips = async () => {
      if (!user) return;
      
      setLoadingTrips(true);
      try {
        // Fetch trips where user is owner
        const { data: ownedTrips, error: ownedError } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (ownedError) throw ownedError;
        
        // Fetch trips where user is a collaborator
        const { data: collaboratorTrips, error: collaboratorError } = await supabase
          .from('trip_collaborators')
          .select(`
            trip_id,
            role,
            trips (*)
          `)
          .eq('user_id', user.id);
          
        if (collaboratorError) throw collaboratorError;
        
        // Combine and format trips
        const collaboratorTripsFormatted = collaboratorTrips?.map(item => ({
          ...item.trips,
          role: item.role
        })) || [];
        
        const allTrips = [
          ...(ownedTrips || []).map(trip => ({ ...trip, role: 'owner' })),
          ...collaboratorTripsFormatted
        ];
        
        setTrips(allTrips);
      } catch (error) {
        console.error('Error fetching trips:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your trips',
          variant: 'destructive'
        });
      } finally {
        setLoadingTrips(false);
      }
    };
    
    // Only fetch when in my-trips section or when active section changes
    if (activeSection === 'my-trips') {
      fetchTrips();
    }
  }, [user, toast, activeSection]);
  
  // Open trip details modal
  const handleOpenTripDetails = (tripId) => {
    const trip = trips.find(t => t.id === tripId);
    setSelectedTrip(trip);
    setShowTripDetails(true);
  };
  
  // Open edit trip modal
  const handleOpenEditTrip = (tripId) => {
    const trip = trips.find(t => t.id === tripId);
    setSelectedTrip(trip);
    setShowEditTrip(true);
  };
  
  // Handle trip update
  const handleTripUpdated = () => {
    // Refetch trips to update the list
    const fetchTrips = async () => {
      if (!user) return;
      
      try {
        // Fetch trips where user is owner
        const { data: ownedTrips } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        // Fetch trips where user is a collaborator
        const { data: collaboratorTrips } = await supabase
          .from('trip_collaborators')
          .select(`
            trip_id,
            role,
            trips (*)
          `)
          .eq('user_id', user.id);
          
        // Combine and format trips
        const collaboratorTripsFormatted = collaboratorTrips?.map(item => ({
          ...item.trips,
          role: item.role
        })) || [];
        
        const allTrips = [
          ...(ownedTrips || []).map(trip => ({ ...trip, role: 'owner' })),
          ...collaboratorTripsFormatted
        ];
        
        setTrips(allTrips);
      } catch (error) {
        console.error('Error refetching trips:', error);
      }
    };
    
    fetchTrips();
  };
  
  // Handle trip creation
  const handleTripCreated = (newTrip) => {
    setTrips(prev => [
      { ...newTrip, role: 'owner' },
      ...prev
    ]);
    toast({
      title: 'Trip created',
      description: 'Your new trip has been created successfully'
    });
  };
  
  // Handle invitation accepted
  const handleInvitationAccepted = (tripId) => {
    // Refetch trips to include the newly joined trip
    handleTripUpdated();
  };
  
  // Filter trips based on current tab
  const getFilteredTrips = () => {
    if (!trips.length) return [];
    
    const today = new Date();
    
    switch (tripsTab) {
      case 'upcoming':
        return trips.filter(trip => {
          if (!trip.start_date) return false;
          const startDate = new Date(trip.start_date);
          return startDate >= today;
        });
      case 'past':
        return trips.filter(trip => {
          if (!trip.end_date) return false;
          const endDate = new Date(trip.end_date);
          return endDate < today;
        });
      case 'planning':
        return trips.filter(trip => !trip.start_date);
      default:
        return trips;
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Welcome to Travel Connect</h1>
        <p className="text-center mb-8">Please sign in to view your trips and plan your next adventure.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      {/* Header with notification bell */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Travel Connect</h1>
        <NotificationBell />
      </div>
      
      {/* Active invitations section - show on any page */}
      {invitations.length > 0 && (
        <div className="mb-6">
          <ActiveInvitations 
            invitations={invitations.map(inv => ({
              token: inv.token,
              tripName: inv.trip_name,
              inviterName: inv.inviter_name,
              role: inv.role
            }))}
            onAccepted={handleInvitationAccepted}
            className="mb-4"
          />
        </div>
      )}
      
      {/* HOME SECTION */}
      {activeSection === 'home' && (
        <div>
          <h2 className="text-xl font-bold mb-5">Hi, {profile?.full_name || user.email}</h2>
          
          {/* Quick search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Where to?" 
              className="pl-10" 
            />
          </div>
          
          {/* Quick access cards */}
          <h3 className="font-medium mb-3">Quick access</h3>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <Button 
              variant="outline" 
              className="flex flex-col h-24 items-center justify-center"
              onClick={() => {
                setActiveSection('my-trips');
                setShowCreateTrip(true);
              }}
            >
              <Plus className="h-6 w-6 mb-2" />
              <span>Create Trip</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col h-24 items-center justify-center"
              onClick={() => setActiveSection('explore')}
            >
              <Search className="h-6 w-6 mb-2" />
              <span>Explore</span>
            </Button>
          </div>
          
          {/* Recent trips */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Recent Trips</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm"
                onClick={() => setActiveSection('my-trips')}
              >
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            {loadingTrips ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : trips.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {trips.slice(0, 2).map(trip => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onViewDetails={() => handleOpenTripDetails(trip.id)}
                    onEditTrip={() => handleOpenEditTrip(trip.id)}
                    onInviteFriends={() => {}}
                    onGroupOptions={() => {}}
                    onAISmartRoute={() => {}}
                    onViewSavedPlaces={() => {}}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-6">
                <CardContent>
                  <p className="text-muted-foreground">No trips yet</p>
                  <Button 
                    onClick={() => {
                      setActiveSection('my-trips');
                      setShowCreateTrip(true);
                    }} 
                    className="mt-3"
                  >
                    Create your first trip
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Popular destinations */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Popular Destinations</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm"
                onClick={() => setActiveSection('explore')}
              >
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {['Paris', 'Tokyo', 'New York', 'Rome'].map((city) => (
                <Card key={city} className="overflow-hidden">
                  <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                    <span className="text-xl font-medium">{city}</span>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      {city}, {city === 'Paris' ? 'France' : 
                        city === 'Tokyo' ? 'Japan' : 
                        city === 'New York' ? 'USA' : 'Italy'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* EXPLORE SECTION */}
      {activeSection === 'explore' && (
        <div>
          <h2 className="text-xl font-bold mb-5">Explore</h2>
          
          {/* Search bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search destinations" 
              className="pl-10" 
            />
          </div>
          
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {['All', 'Beach', 'Mountains', 'Cities', 'History', 'Nature'].map(category => (
              <Button 
                key={category} 
                variant={category === 'All' ? 'default' : 'outline'} 
                size="sm"
                className="rounded-full whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
          
          {/* Popular destinations */}
          <h3 className="font-medium mb-3">Popular Destinations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              { name: 'Paris', country: 'France' },
              { name: 'Tokyo', country: 'Japan' },
              { name: 'New York', country: 'USA' },
              { name: 'Rome', country: 'Italy' },
              { name: 'Bali', country: 'Indonesia' },
              { name: 'Barcelona', country: 'Spain' }
            ].map((destination) => (
              <Card key={destination.name} className="overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <span className="text-xl font-medium">{destination.name}</span>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-medium">{destination.name}</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    {destination.country}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* MY TRIPS SECTION */}
      {activeSection === 'my-trips' && (
        <div>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold">My Trips</h2>
            <Button 
              onClick={() => setShowCreateTrip(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Trip
            </Button>
          </div>
          
          <Tabs value={tripsTab} onValueChange={setTripsTab} className="mb-6">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="planning">Planning</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {loadingTrips ? (
            <div className="flex justify-center py-12">
              <Loader size={32} />
            </div>
          ) : getFilteredTrips().length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {getFilteredTrips().map(trip => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onViewDetails={() => handleOpenTripDetails(trip.id)}
                  onEditTrip={() => handleOpenEditTrip(trip.id)}
                  onInviteFriends={() => {}}
                  onGroupOptions={() => {}}
                  onAISmartRoute={() => {}}
                  onViewSavedPlaces={() => {}}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">No trips found</h3>
              <p className="text-muted-foreground mt-2">
                {tripsTab === 'upcoming' 
                  ? "You don't have any upcoming trips" 
                  : tripsTab === 'planning' 
                  ? "No trips in planning phase"
                  : "You don't have any past trips"
                }
              </p>
              <Button 
                onClick={() => setShowCreateTrip(true)} 
                className="mt-4"
              >
                Create Trip
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* BOOKING SECTION */}
      {activeSection === 'booking' && (
        <div>
          <h2 className="text-xl font-bold mb-5">Your Bookings</h2>
          
          {/* Tabs for bookings */}
          <Tabs defaultValue="active" className="mb-6">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              <div className="text-center py-12 border rounded-lg">
                <h3 className="text-lg font-medium">No active bookings</h3>
                <p className="text-muted-foreground mt-2">You don't have any active hotel or flight bookings</p>
                <Button 
                  variant="outline"
                  onClick={() => {}} 
                  className="mt-4"
                >
                  Find hotels
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <div className="text-center py-12 border rounded-lg">
                <h3 className="text-lg font-medium">No booking history</h3>
                <p className="text-muted-foreground mt-2">Your past bookings will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Suggested hotels */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Suggested for you</h3>
            <div className="grid grid-cols-1 gap-4">
              {['Grand Hotel', 'Beachside Resort', 'City Center Suites'].map((hotel) => (
                <Card key={hotel} className="overflow-hidden">
                  <div className="aspect-[16/9] bg-muted flex items-center justify-center">
                    <span className="text-lg font-medium">{hotel}</span>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{hotel}</h4>
                      <div className="text-sm font-bold">$120/night</div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3 mr-1" />
                      City Center
                    </div>
                    <Button className="w-full">View Details</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* PROFILE SECTION */}
      {activeSection === 'profile' && (
        <div>
          <h2 className="text-xl font-bold mb-5">Profile</h2>
          
          <div className="flex flex-col items-center mb-6 pb-6 border-b">
            <Avatar className="h-20 w-20 mb-3">
              <AvatarFallback>
                {profile?.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
              {profile?.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt={profile?.full_name || 'User'} />
              )}
            </Avatar>
            <h3 className="text-lg font-medium">{profile?.full_name || 'User'}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          
          {/* Profile stats */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-center">
            <Card>
              <CardContent className="py-4">
                <div className="text-3xl font-bold">{trips.length}</div>
                <div className="text-sm text-muted-foreground">Trips</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <div className="text-3xl font-bold">
                  {trips.filter(t => t.is_group_trip).length}
                </div>
                <div className="text-sm text-muted-foreground">Group Trips</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Settings options */}
          <div className="space-y-3">
            <Card className="cursor-pointer">
              <CardContent className="p-4 flex justify-between items-center">
                <span>Edit Profile</span>
                <ChevronRight className="h-4 w-4" />
              </CardContent>
            </Card>
            <Card className="cursor-pointer">
              <CardContent className="p-4 flex justify-between items-center">
                <span>Notifications</span>
                <ChevronRight className="h-4 w-4" />
              </CardContent>
            </Card>
            <Card className="cursor-pointer">
              <CardContent className="p-4 flex justify-between items-center">
                <span>Help & Support</span>
                <ChevronRight className="h-4 w-4" />
              </CardContent>
            </Card>
            <Button 
              variant="destructive"
              className="w-full mt-8"
              onClick={signOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      )}
      
      {/* MODALES */}
      {selectedTrip && (
        <>
          {/* Trip Details Modal */}
          <TripDetailModal
            trip={selectedTrip}
            isOpen={showTripDetails}
            onClose={() => {
              setShowTripDetails(false);
              setSelectedTrip(null);
            }}
            onUpdateTrip={handleTripUpdated}
            onDeleteTrip={handleTripUpdated}
          />
          
          {/* Edit Trip Modal */}
          <EditTripModal
            trip={selectedTrip}
            isOpen={showEditTrip}
            onClose={() => {
              setShowEditTrip(false);
              setSelectedTrip(null);
            }}
            onUpdate={(updatedTrip) => {
              handleTripUpdated();
              setShowEditTrip(false);
            }}
          />
        </>
      )}
      
      {/* Create Trip Modal */}
      <NewTripModal
        isOpen={showCreateTrip}
        onClose={() => setShowCreateTrip(false)}
        onCreateTrip={handleTripCreated}
      />
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        activeSection={activeSection} 
        onChangeSection={setActiveSection}
      />
    </div>
  );
}