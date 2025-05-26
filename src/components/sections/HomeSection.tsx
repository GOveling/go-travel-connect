import { MapPin, Calendar, Camera, Bell, Plus, Share } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import NotificationAlertsModal from "@/components/modals/NotificationAlertsModal";
import AddMemoryModal from "@/components/modals/AddMemoryModal";
import InstaTripModal from "@/components/modals/InstaTripModal";
import ProfilePublicationModal from "@/components/modals/ProfilePublicationModal";
import NewTripModal from "@/components/modals/NewTripModal";
import AddToTripModal from "@/components/modals/AddToTripModal";

interface InstaTripImage {
  id: string;
  src: string;
  addedAt: number;
  text?: string;
  location?: string;
  tripId?: number;
}

interface ProfilePost {
  id: string;
  images: string[];
  text: string;
  createdAt: number;
  location?: string;
  tripId?: number;
}

const HomeSection = () => {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isAddMemoryModalOpen, setIsAddMemoryModalOpen] = useState(false);
  const [isInstaTripModalOpen, setIsInstaTripModalOpen] = useState(false);
  const [isProfilePublicationModalOpen, setIsProfilePublicationModalOpen] = useState(false);
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);
  const [isAddToTripModalOpen, setIsAddToTripModalOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(5);
  const [instaTripImages, setInstaTripImages] = useState<InstaTripImage[]>([]);
  const [profilePosts, setProfilePosts] = useState<ProfilePost[]>([]);
  const [trips, setTrips] = useState<any[]>([
    {
      id: 1,
      name: "European Adventure",
      destination: "Paris → Rome → Barcelona",
      dates: "Dec 15 - Dec 25, 2024",
      status: "upcoming",
      image: "🇪🇺"
    },
    {
      id: 2,
      name: "Tokyo Discovery",
      destination: "Tokyo, Japan",
      dates: "Jan 8 - Jan 15, 2025",
      status: "planning",
      image: "🇯🇵"
    }
  ]);
  const [selectedPostForTrip, setSelectedPostForTrip] = useState<ProfilePost | null>(null);

  // Clean up expired images periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const twelveHoursAgo = now - (12 * 60 * 60 * 1000);
      
      setInstaTripImages(prev => 
        prev.filter(image => image.addedAt >= twelveHoursAgo)
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = () => {
    setIsNotificationModalOpen(true);
  };

  const handleAddMemoryClick = () => {
    setIsAddMemoryModalOpen(true);
  };

  const handleInstaTripClick = () => {
    console.log("InstanTrip button clicked");
    setIsInstaTripModalOpen(true);
  };

  const handleProfilePublicationClick = () => {
    setIsProfilePublicationModalOpen(true);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotificationCount(0);
  };

  const handleAddInstaTripImage = (imageSrc: string, text?: string, location?: string, tripId?: number) => {
    const newImage: InstaTripImage = {
      id: Date.now().toString(),
      src: imageSrc,
      addedAt: Date.now(),
      text: text,
      location: location,
      tripId: tripId
    };
    setInstaTripImages(prev => [...prev, newImage]);
  };

  const handleRemoveInstaTripImage = (id: string) => {
    setInstaTripImages(prev => prev.filter(image => image.id !== id));
  };

  const handleAddProfilePost = (images: string[], text: string, location?: string, tripId?: number) => {
    const newPost: ProfilePost = {
      id: Date.now().toString(),
      images,
      text,
      createdAt: Date.now(),
      location: location,
      tripId: tripId
    };
    setProfilePosts(prev => [newPost, ...prev]);
  };

  const handleCreateTrip = (tripData: any) => {
    setTrips(prev => [...prev, tripData]);
  };

  const handleAddToTrip = (post: ProfilePost) => {
    setSelectedPostForTrip(post);
    setIsAddToTripModalOpen(true);
  };

  const handleAddToExistingTrip = (tripId: number) => {
    if (selectedPostForTrip) {
      // Update the post to mark it as added to trip
      setProfilePosts(prev => 
        prev.map(post => 
          post.id === selectedPostForTrip.id 
            ? { ...post, tripId } 
            : post
        )
      );
    }
  };

  const handleCreateNewTripFromPost = () => {
    setIsAddToTripModalOpen(false);
    setIsNewTripModalOpen(true);
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header with Logo on left, InstanTrip button in center, and Notification Bell on right */}
      <div className="pt-8 pb-4">
        <div className="flex justify-between items-center mb-4">
          {/* Logo on the left */}
          <div className="flex-1 flex justify-start">
            <img 
              src="/lovable-uploads/3e9a8a6e-d543-437e-a44d-2f16fac6303f.png" 
              alt="GOveling Logo" 
              className="h-16 w-auto"
            />
          </div>
          
          {/* InstanTrip button in the center */}
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <Button
                onClick={handleInstaTripClick}
                className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white px-6 py-2 rounded-full shadow-lg"
              >
                <Plus size={20} className="mr-2" />
                InstanTrip
              </Button>
              {instaTripImages.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
                >
                  {instaTripImages.length > 9 ? '9+' : instaTripImages.length}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Notification bell on the right */}
          <div className="flex-1 flex justify-end">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNotificationClick}
                className="relative p-2 hover:bg-gray-100 rounded-full"
              >
                <Bell size={24} className="text-gray-600" />
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
        <p className="mt-2 text-center">
          <span className="text-purple-600 font-semibold">Travel Smart</span>
          <span className="text-gray-600">, </span>
          <span className="text-orange-500 font-semibold">Travel More</span>
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0">
          <CardContent className="p-4 text-center">
            <MapPin className="mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm opacity-90">Places Saved</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <Calendar className="mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold">3</p>
            <p className="text-sm opacity-90">Upcoming Trips</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Trip */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-purple-600 to-orange-500 p-4 text-white">
          <h3 className="font-semibold">Current Trip</h3>
          <p className="text-sm opacity-90">Paris, France</p>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-gray-600">Day 2 of 7</p>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div className="bg-gradient-to-r from-purple-600 to-orange-500 h-2 rounded-full w-2/7"></div>
          </div>
          <p className="text-sm text-gray-700 mb-3">Next: Visit Louvre Museum</p>
          <Button className="w-full bg-gradient-to-r from-purple-600 to-orange-500 border-0 hover:from-purple-700 hover:to-orange-600">
            View Itinerary
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="h-16 flex-col space-y-1 border-2 border-purple-200 hover:bg-purple-50 text-purple-700">
          <Bell size={20} />
          <span className="text-sm">Nearby Alerts</span>
        </Button>
        <Button 
          onClick={handleAddMemoryClick}
          variant="outline" 
          className="h-16 flex-col space-y-1 border-2 border-orange-200 hover:bg-orange-50 text-orange-700"
        >
          <Camera size={20} />
          <span className="text-sm">Add Memory</span>
        </Button>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <MapPin size={16} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Saved Eiffel Tower</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Calendar size={16} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Booked hotel in Rome</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Publication */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Profile Publications</CardTitle>
          <Button
            onClick={handleProfilePublicationClick}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
          >
            <Plus size={16} className="mr-1" />
            Add Post
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {profilePosts.length === 0 ? (
            <div className="text-center py-8">
              <Share size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No publications yet</p>
              <p className="text-xs text-gray-400">Share your travel memories with the world!</p>
            </div>
          ) : (
            profilePosts.slice(0, 3).map((post) => (
              <div key={post.id} className="border rounded-lg p-3 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {post.images.slice(0, 3).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Post image ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                  ))}
                  {post.images.length > 3 && (
                    <div className="relative">
                      <img
                        src={post.images[3]}
                        alt="More images"
                        className="w-full h-20 object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          +{post.images.length - 3}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-700">{post.text}</p>
                {post.location && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <MapPin size={12} />
                        <span>{post.location}</span>
                        {post.tripId && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                            Added to trip
                          </span>
                        )}
                      </div>
                      {!post.tripId && (
                        <Button
                          onClick={() => handleAddToTrip(post)}
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          <Plus size={12} className="mr-1" />
                          Add to Trip
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</p>
              </div>
            ))
          )}
          {profilePosts.length > 3 && (
            <Button variant="outline" className="w-full">
              View All Publications
            </Button>
          )}
        </CardContent>
      </Card>

      <NotificationAlertsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notificationCount={notificationCount}
        onMarkAllRead={handleMarkAllNotificationsRead}
      />

      <AddMemoryModal
        isOpen={isAddMemoryModalOpen}
        onClose={() => setIsAddMemoryModalOpen(false)}
        onAddInstaTripImage={handleAddInstaTripImage}
      />

      <InstaTripModal
        isOpen={isInstaTripModalOpen}
        onClose={() => setIsInstaTripModalOpen(false)}
        images={instaTripImages}
        onRemoveImage={handleRemoveInstaTripImage}
      />

      <ProfilePublicationModal
        isOpen={isProfilePublicationModalOpen}
        onClose={() => setIsProfilePublicationModalOpen(false)}
        onAddPublication={handleAddProfilePost}
      />

      <NewTripModal
        isOpen={isNewTripModalOpen}
        onClose={() => setIsNewTripModalOpen(false)}
        onCreateTrip={handleCreateTrip}
      />

      <AddToTripModal
        isOpen={isAddToTripModalOpen}
        onClose={() => {
          setIsAddToTripModalOpen(false);
          setSelectedPostForTrip(null);
        }}
        existingTrips={trips.filter(trip => trip.status !== 'completed')}
        onAddToExistingTrip={handleAddToExistingTrip}
        onCreateNewTrip={handleCreateNewTripFromPost}
        postLocation={selectedPostForTrip?.location}
      />
    </div>
  );
};

export default HomeSection;
