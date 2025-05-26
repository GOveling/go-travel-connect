
import { Users, MapPin, Camera, MessageSquare, UserPlus, Heart, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

const TravelersSection = () => {
  const [followingUsers, setFollowingUsers] = useState<string[]>([]);

  const travelers = [
    {
      id: "1",
      name: "Emma Rodriguez",
      avatar: "ER",
      location: "Barcelona, Spain",
      totalTrips: 12,
      countries: 8,
      followers: 245,
      following: 189,
      bio: "Adventure seeker and culture enthusiast. Love exploring hidden gems!",
      pastTrips: [
        { name: "Japan Discovery", destinations: "Tokyo, Kyoto, Osaka", year: "2024", rating: 5 },
        { name: "European Circuit", destinations: "Paris, Rome, Amsterdam", year: "2023", rating: 4.8 },
        { name: "Bali Adventure", destinations: "Ubud, Canggu, Nusa Penida", year: "2023", rating: 4.9 }
      ],
      recentPhotos: ["🏯", "🗼", "🏝️", "🍜"],
      reviews: [
        { place: "Senso-ji Temple", rating: 5, text: "Absolutely magical at sunrise!" },
        { place: "Eiffel Tower", rating: 4.5, text: "Classic but still breathtaking" }
      ]
    },
    {
      id: "2", 
      name: "Alex Chen",
      avatar: "AC",
      location: "San Francisco, USA",
      totalTrips: 18,
      countries: 15,
      followers: 432,
      following: 298,
      bio: "Digital nomad exploring the world one city at a time 🌍",
      pastTrips: [
        { name: "Southeast Asia Tour", destinations: "Thailand, Vietnam, Cambodia", year: "2024", rating: 4.7 },
        { name: "South America Trek", destinations: "Peru, Bolivia, Chile", year: "2023", rating: 5 },
        { name: "African Safari", destinations: "Kenya, Tanzania", year: "2022", rating: 4.9 }
      ],
      recentPhotos: ["🦁", "🏔️", "🛕", "🌅"],
      reviews: [
        { place: "Machu Picchu", rating: 5, text: "Life-changing experience!" },
        { place: "Angkor Wat", rating: 4.8, text: "Best visited at sunrise" }
      ]
    },
    {
      id: "3",
      name: "Sofia Andersson", 
      avatar: "SA",
      location: "Stockholm, Sweden",
      totalTrips: 9,
      countries: 12,
      followers: 167,
      following: 143,
      bio: "Sustainable travel advocate. Capturing moments, not just photos.",
      pastTrips: [
        { name: "Nordic Adventure", destinations: "Iceland, Norway, Finland", year: "2024", rating: 4.6 },
        { name: "Mediterranean Escape", destinations: "Greece, Croatia, Italy", year: "2023", rating: 4.8 },
        { name: "Morocco Journey", destinations: "Marrakech, Fez, Casablanca", year: "2023", rating: 4.7 }
      ],
      recentPhotos: ["🏔️", "🌊", "🕌", "🐪"],
      reviews: [
        { place: "Santorini", rating: 4.9, text: "Perfect sunset views!" },
        { place: "Marrakech Medina", rating: 4.5, text: "Sensory overload in the best way" }
      ]
    }
  ];

  const handleFollow = (userId: string) => {
    setFollowingUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Travel Community</h3>
        <p className="text-gray-600">Connect with fellow travelers and discover new adventures</p>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-purple-600">2.5K</p>
            <p className="text-xs text-gray-600">Active Travelers</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-orange-600">8.7K</p>
            <p className="text-xs text-gray-600">Shared Trips</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">15K</p>
            <p className="text-xs text-gray-600">Reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Travelers List */}
      <div className="space-y-4">
        {travelers.map((traveler) => (
          <Card key={traveler.id} className="overflow-hidden border-0 shadow-lg">
            <CardContent className="p-0">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-purple-500 to-orange-500 p-4 text-white">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16 border-2 border-white">
                    <AvatarFallback className="bg-white text-purple-600 font-bold text-lg">
                      {traveler.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold">{traveler.name}</h4>
                    <div className="flex items-center space-x-1 text-sm opacity-90">
                      <MapPin size={14} />
                      <span>{traveler.location}</span>
                    </div>
                    <p className="text-sm opacity-90 mt-1">{traveler.bio}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={followingUsers.includes(traveler.id) ? "secondary" : "outline"}
                    className={followingUsers.includes(traveler.id) 
                      ? "bg-white text-purple-600" 
                      : "border-white text-white hover:bg-white hover:text-purple-600"
                    }
                    onClick={() => handleFollow(traveler.id)}
                  >
                    <UserPlus size={16} className="mr-1" />
                    {followingUsers.includes(traveler.id) ? "Following" : "Follow"}
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mt-4 text-center">
                  <div>
                    <p className="font-bold">{traveler.totalTrips}</p>
                    <p className="text-xs opacity-80">Trips</p>
                  </div>
                  <div>
                    <p className="font-bold">{traveler.countries}</p>
                    <p className="text-xs opacity-80">Countries</p>
                  </div>
                  <div>
                    <p className="font-bold">{traveler.followers}</p>
                    <p className="text-xs opacity-80">Followers</p>
                  </div>
                  <div>
                    <p className="font-bold">{traveler.following}</p>
                    <p className="text-xs opacity-80">Following</p>
                  </div>
                </div>
              </div>

              {/* Content Sections */}
              <div className="p-4 space-y-4">
                {/* Recent Photos */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Camera size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Recent Photos</span>
                  </div>
                  <div className="flex space-x-2">
                    {traveler.recentPhotos.map((photo, index) => (
                      <div key={index} className="w-12 h-12 bg-gradient-to-br from-purple-100 to-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">{photo}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Past Trips */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Past Adventures</span>
                  </div>
                  <div className="space-y-2">
                    {traveler.pastTrips.slice(0, 2).map((trip, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-sm">{trip.name}</h5>
                            <p className="text-xs text-gray-600">{trip.destinations} • {trip.year}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-medium">{trip.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Reviews */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageSquare size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Recent Reviews</span>
                  </div>
                  <div className="space-y-2">
                    {traveler.reviews.slice(0, 1).map((review, index) => (
                      <div key={index} className="bg-blue-50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="font-medium text-sm">{review.place}</h5>
                          <div className="flex items-center space-x-1">
                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-medium">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">"{review.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <MessageSquare size={16} className="mr-1" />
                    Message
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50">
          <Users size={16} className="mr-2" />
          Discover More Travelers
        </Button>
      </div>
    </div>
  );
};

export default TravelersSection;
