
import { Plus, Calendar, MapPin, Users, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TripsSection = () => {
  const trips = [
    {
      id: 1,
      name: "European Adventure",
      destination: "Paris → Rome → Barcelona",
      dates: "Dec 15 - Dec 25, 2024",
      status: "upcoming",
      travelers: 2,
      image: "🇪🇺"
    },
    {
      id: 2,
      name: "Tokyo Discovery",
      destination: "Tokyo, Japan",
      dates: "Jan 8 - Jan 15, 2025",
      status: "planning",
      travelers: 1,
      image: "🇯🇵"
    },
    {
      id: 3,
      name: "Bali Retreat",
      destination: "Bali, Indonesia",
      dates: "Nov 20 - Nov 27, 2024",
      status: "completed",
      travelers: 3,
      image: "🇮🇩"
    }
  ];

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

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="pt-8 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">My Trips</h2>
            <p className="text-gray-600">Plan and manage your adventures</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-500 to-orange-500 border-0">
            <Plus size={20} className="mr-2" />
            New Trip
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-blue-600">3</p>
            <p className="text-sm text-gray-600">Total Trips</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">1</p>
            <p className="text-sm text-gray-600">Upcoming</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-orange-600">8</p>
            <p className="text-sm text-gray-600">Countries</p>
          </CardContent>
        </Card>
      </div>

      {/* Trips List */}
      <div className="space-y-4">
        {trips.map((trip) => (
          <Card key={trip.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-0">
              <div className="flex">
                <div className="w-20 bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
                  <span className="text-3xl">{trip.image}</span>
                </div>
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{trip.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(trip.status)}`}>
                      {trip.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} />
                      <span>{trip.destination}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} />
                      <span>{trip.dates}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users size={16} />
                      <span>{trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit size={16} className="mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-500 to-orange-500">
                      View Details
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
          <CardTitle className="text-lg">Quick Trip Templates</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-16 flex-col space-y-1 border-2 border-blue-200 hover:bg-blue-50">
            <span className="text-xl">🏖️</span>
            <span className="text-sm">Beach Vacation</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col space-y-1 border-2 border-green-200 hover:bg-green-50">
            <span className="text-xl">🏔️</span>
            <span className="text-sm">Mountain Trip</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col space-y-1 border-2 border-purple-200 hover:bg-purple-50">
            <span className="text-xl">🏛️</span>
            <span className="text-sm">City Break</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col space-y-1 border-2 border-orange-200 hover:bg-orange-50">
            <span className="text-xl">🎒</span>
            <span className="text-sm">Backpacking</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripsSection;
