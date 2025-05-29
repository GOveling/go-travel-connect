import { Plus, Calendar, MapPin, Users, Edit, Map, UserPlus, Share2, Settings, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import TripMap from "@/components/maps/TripMap";
import TripDetailModal from "@/components/modals/TripDetailModal";
import NewTripModal from "@/components/modals/NewTripModal";
import InviteFriendsModal from "@/components/modals/InviteFriendsModal";
import GroupOptionsModal from "@/components/modals/GroupOptionsModal";
import AISmartRouteModal from "@/components/modals/AISmartRouteModal";

const TripsSection = () => {
  const [showMap, setShowMap] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showTripDetail, setShowTripDetail] = useState(false);
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [showInviteFriendsModal, setShowInviteFriendsModal] = useState(false);
  const [showGroupOptionsModal, setShowGroupOptionsModal] = useState(false);
  const [showAISmartRouteModal, setShowAISmartRouteModal] = useState(false);
  
  const [trips, setTrips] = useState([
    {
      id: 1,
      name: "European Adventure",
      destination: "Paris → Rome → Barcelona",
      dates: "Dec 15 - Dec 25, 2024",
      status: "upcoming",
      travelers: 2,
      image: "🇪🇺",
      isGroupTrip: true,
      collaborators: [
        { id: "1", name: "Alice Johnson", email: "alice@example.com", avatar: "AJ", role: "owner" as const },
        { id: "2", name: "Bob Smith", email: "bob@example.com", avatar: "BS", role: "editor" as const },
        { id: "3", name: "Carol Davis", email: "carol@example.com", avatar: "CD", role: "viewer" as const }
      ],
      coordinates: [
        { name: "Paris", lat: 48.8566, lng: 2.3522 },
        { name: "Rome", lat: 41.9028, lng: 12.4964 },
        { name: "Barcelona", lat: 41.3851, lng: 2.1734 }
      ],
      description: "A wonderful journey through Europe's most iconic cities, exploring rich history, amazing cuisine, and beautiful architecture.",
      budget: "$3,500 per person",
      accommodation: "Mix of boutique hotels and Airbnb",
      transportation: "Flights and high-speed trains"
    },
    {
      id: 2,
      name: "Tokyo Discovery",
      destination: "Tokyo, Japan",
      dates: "Jan 8 - Jan 15, 2025",
      status: "planning",
      travelers: 1,
      image: "🇯🇵",
      isGroupTrip: false,
      coordinates: [
        { name: "Tokyo", lat: 35.6762, lng: 139.6503 }
      ],
      description: "Immerse yourself in Japanese culture, from traditional temples to modern technology and incredible food experiences.",
      budget: "$2,800 per person",
      accommodation: "Traditional ryokan and modern hotels",
      transportation: "JR Pass and local trains"
    },
    {
      id: 3,
      name: "Bali Retreat",
      destination: "Bali, Indonesia",
      dates: "Nov 20 - Nov 27, 2024",
      status: "completed",
      travelers: 3,
      image: "🇮🇩",
      isGroupTrip: true,
      collaborators: [
        { id: "1", name: "You", email: "you@example.com", avatar: "YO", role: "owner" as const },
        { id: "4", name: "Emma Wilson", email: "emma@example.com", avatar: "EW", role: "editor" as const },
        { id: "5", name: "David Brown", email: "david@example.com", avatar: "DB", role: "editor" as const }
      ],
      coordinates: [
        { name: "Bali", lat: -8.3405, lng: 115.0920 }
      ],
      description: "A relaxing retreat in paradise with yoga sessions, beautiful beaches, and spiritual experiences in temples.",
      budget: "$1,800 per person",
      accommodation: "Beach resort and villas",
      transportation: "Private transfers and scooters"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-green-100 text-green-800";
      case "planning":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "editor":
        return "bg-blue-100 text-blue-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewDetails = (trip: any) => {
    setSelectedTrip(trip);
    setShowTripDetail(true);
  };

  const handleCreateTrip = (tripData: any) => {
    setTrips(prev => [...prev, tripData]);
  };

  const handleInviteFriends = (trip: any) => {
    setSelectedTrip(trip);
    setShowInviteFriendsModal(true);
  };

  const handleGroupOptions = (trip: any) => {
    setSelectedTrip(trip);
    setShowGroupOptionsModal(true);
  };

  const handleAISmartRoute = (trip: any) => {
    setSelectedTrip(trip);
    setShowAISmartRouteModal(true);
  };

  if (showMap) {
    return (
      <div className="min-h-screen p-2 sm:p-4 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="pt-4 sm:pt-8 pb-2 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Trip Map</h2>
              <p className="text-gray-600 text-sm sm:text-base">View all your trip destinations</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowMap(false)}
              className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
            >
              Back to List
            </Button>
          </div>
        </div>

        {/* Map Component */}
        <TripMap trips={trips} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="pt-4 sm:pt-8 pb-2 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">My Trips</h2>
            <p className="text-gray-600 text-sm sm:text-base">Plan and manage your adventures</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button 
              variant="outline"
              onClick={() => setShowMap(true)}
              className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
            >
              <Map size={20} className="mr-2" />
              Map View
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-orange-500 border-0 w-full sm:w-auto"
              onClick={() => setShowNewTripModal(true)}
            >
              <Plus size={20} className="mr-2" />
              New Trip
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="text-center">
          <CardContent className="p-3 sm:p-4">
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{trips.length}</p>
            <p className="text-xs sm:text-sm text-gray-600">Total Trips</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3 sm:p-4">
            <p className="text-xl sm:text-2xl font-bold text-green-600">{trips.filter(t => t.status === 'upcoming').length}</p>
            <p className="text-xs sm:text-sm text-gray-600">Upcoming</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3 sm:p-4">
            <p className="text-xl sm:text-2xl font-bold text-orange-600">{trips.filter(t => t.isGroupTrip).length}</p>
            <p className="text-xs sm:text-sm text-gray-600">Group Trips</p>
          </CardContent>
        </Card>
      </div>

      {/* Trips List */}
      <div className="space-y-4">
        {trips.map((trip) => (
          <Card key={trip.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-20 h-16 sm:h-auto bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl">{trip.image}</span>
                </div>
                <div className="flex-1 p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 space-y-2 sm:space-y-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                      <h3 className="font-semibold text-lg">{trip.name}</h3>
                      {trip.isGroupTrip && (
                        <div className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded-full w-fit">
                          <Users size={12} className="text-blue-600" />
                          <span className="text-xs text-blue-600 font-medium">Group</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-row sm:flex-col items-start sm:items-end space-x-2 sm:space-x-0 sm:space-y-1">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(trip.status)}`}>
                        {trip.status}
                      </span>
                      {trip.isGroupTrip && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGroupOptions(trip)}
                          className="text-xs px-2 sm:px-3 py-2 h-8 border-purple-200 text-purple-600 hover:bg-purple-50 min-w-[90px] sm:min-w-auto"
                        >
                          <Settings size={12} className="mr-1" />
                          <span>Group Options</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Collaborators for group trips */}
                  {trip.collaborators && trip.collaborators.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Users size={14} className="text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Collaborators:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {trip.collaborators.slice(0, 2).map((collaborator) => (
                          <div key={collaborator.id} className="flex items-center space-x-1 bg-white border rounded-lg px-2 py-1">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-xs text-white">
                              {collaborator.avatar}
                            </div>
                            <span className="text-xs text-gray-700 hidden sm:inline">{collaborator.name}</span>
                            <span className="text-xs text-gray-700 sm:hidden">{collaborator.name.split(' ')[0]}</span>
                            <span className={`text-xs px-1 py-0.5 rounded-full ${getRoleColor(collaborator.role)}`}>
                              {collaborator.role}
                            </span>
                          </div>
                        ))}
                        {trip.collaborators.length > 2 && (
                          <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 bg-gray-200 rounded-full">
                            <span className="text-xs text-gray-600">+{trip.collaborators.length - 2}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} className="flex-shrink-0" />
                      <span className="truncate">{trip.destination}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{trip.dates}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users size={16} className="flex-shrink-0" />
                      <span>{trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* AI Smart Route Button for All Trips */}
                  <div className="mb-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAISmartRoute(trip)}
                      className="w-full bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 text-xs sm:text-sm"
                    >
                      <Brain size={16} className="mr-2" />
                      AI Smart Route
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs sm:text-sm">
                      <Edit size={16} className="mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 text-xs sm:text-sm"
                      onClick={() => handleInviteFriends(trip)}
                    >
                      <UserPlus size={16} className="mr-1" />
                      <span className="hidden sm:inline">Invite Friends</span>
                      <span className="sm:hidden">Invite</span>
                    </Button>
                    <Button 
                      size="lg" 
                      className="flex-1 bg-gradient-to-r from-blue-500 to-orange-500 text-sm sm:text-base px-4 py-3"
                      onClick={() => handleViewDetails(trip)}
                    >
                      <span className="hidden sm:inline">Trip plan details</span>
                      <span className="sm:hidden">Trip details</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trip Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Quick Trip Templates</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 sm:gap-3">
          <Button variant="outline" className="h-12 sm:h-16 flex-col space-y-1 border-2 border-blue-200 hover:bg-blue-50">
            <span className="text-lg sm:text-xl">🏖️</span>
            <span className="text-xs sm:text-sm">Beach Vacation</span>
          </Button>
          <Button variant="outline" className="h-12 sm:h-16 flex-col space-y-1 border-2 border-green-200 hover:bg-green-50">
            <span className="text-lg sm:text-xl">🏔️</span>
            <span className="text-xs sm:text-sm">Mountain Trip</span>
          </Button>
          <Button variant="outline" className="h-12 sm:h-16 flex-col space-y-1 border-2 border-purple-200 hover:bg-purple-50">
            <span className="text-lg sm:text-xl">🏛️</span>
            <span className="text-xs sm:text-sm">City Break</span>
          </Button>
          <Button variant="outline" className="h-12 sm:h-16 flex-col space-y-1 border-2 border-orange-200 hover:bg-orange-50">
            <span className="text-lg sm:text-xl">🎒</span>
            <span className="text-xs sm:text-sm">Backpacking</span>
          </Button>
        </CardContent>
      </Card>

      {/* Group Trip Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
            <Users size={20} className="text-blue-600" />
            <span>Group Trip Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-1 text-sm sm:text-base">Collaborate with Friends</h4>
            <p className="text-xs sm:text-sm text-blue-600">Invite friends to plan trips together. Share itineraries, split costs, and make group decisions.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start text-xs sm:text-sm">
              <UserPlus size={16} className="mr-2" />
              Invite Friends
            </Button>
            <Button variant="outline" className="justify-start text-xs sm:text-sm">
              <Share2 size={16} className="mr-2" />
              Share Trip Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* New Trip Modal */}
      <NewTripModal 
        isOpen={showNewTripModal}
        onClose={() => setShowNewTripModal(false)}
        onCreateTrip={handleCreateTrip}
      />

      <TripDetailModal 
        trip={selectedTrip}
        isOpen={showTripDetail}
        onClose={() => {
          setShowTripDetail(false);
          setSelectedTrip(null);
        }}
      />

      <InviteFriendsModal
        trip={selectedTrip}
        isOpen={showInviteFriendsModal}
        onClose={() => {
          setShowInviteFriendsModal(false);
          setSelectedTrip(null);
        }}
      />

      <GroupOptionsModal
        trip={selectedTrip}
        isOpen={showGroupOptionsModal}
        onClose={() => {
          setShowGroupOptionsModal(false);
          setSelectedTrip(null);
        }}
      />

      <AISmartRouteModal
        trip={selectedTrip}
        isOpen={showAISmartRouteModal}
        onClose={() => {
          setShowAISmartRouteModal(false);
          setSelectedTrip(null);
        }}
      />
    </div>
  );
};

export default TripsSection;
