import { useState, useEffect } from "react";
import NotificationAlertsModal from "@/components/modals/NotificationAlertsModal";
import AddMemoryModal from "@/components/modals/AddMemoryModal";
import InstaTripModal from "@/components/modals/InstaTripModal";
import ProfilePublicationModal from "@/components/modals/ProfilePublicationModal";
import NewTripModal from "@/components/modals/NewTripModal";
import AddToTripModal from "@/components/modals/AddToTripModal";
import TripDetailModal from "@/components/modals/TripDetailModal";
import LocationWeatherWidget from "@/components/widgets/LocationWeatherWidget";
import HomeHeader from "@/components/home/HomeHeader";
import QuickStats from "@/components/home/QuickStats";
import CurrentTrip from "@/components/home/CurrentTrip";
import QuickActions from "@/components/home/QuickActions";
import ProfilePublication from "@/components/home/ProfilePublication";

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
  const [isTripDetailModalOpen, setIsTripDetailModalOpen] = useState(false);
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

  // Current trip data (mock data for the active trip)
  const currentTrip = {
    id: 1,
    name: "European Adventure",
    destination: "Paris → Rome → Barcelona",
    dates: "Dec 15 - Dec 25, 2024",
    status: "upcoming",
    travelers: 2,
    image: "🇪🇺",
    isGroupTrip: false,
    coordinates: [
      { name: "Paris", lat: 48.8566, lng: 2.3522 },
      { name: "Rome", lat: 41.9028, lng: 12.4964 },
      { name: "Barcelona", lat: 41.3851, lng: 2.1734 }
    ],
    description: "An amazing journey through three beautiful European cities with rich history, art, and culture.",
    budget: "$2,500 per person",
    accommodation: "Mix of boutique hotels and Airbnb",
    transportation: "Flights and high-speed trains"
  };

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

  const handleCreatePublicationFromAddMemory = () => {
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

  const handleViewCurrentTripDetail = () => {
    setIsTripDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen p-4 space-y-4">
      {/* Minimized Location, Date & Weather Widget */}
      <div className="pt-2">
        <LocationWeatherWidget />
      </div>

      {/* Header with Logo, InstanTrip button, and Notification Bell */}
      <HomeHeader
        notificationCount={notificationCount}
        instaTripImageCount={instaTripImages.length}
        onNotificationClick={handleNotificationClick}
        onInstaTripClick={handleInstaTripClick}
      />

      {/* Quick Stats */}
      <QuickStats />

      {/* Current Trip */}
      <CurrentTrip onViewDetail={handleViewCurrentTripDetail} />

      {/* Quick Actions */}
      <QuickActions onAddMemoryClick={handleAddMemoryClick} />

      {/* Profile Publication */}
      <ProfilePublication
        posts={profilePosts}
        onProfilePublicationClick={handleProfilePublicationClick}
        onAddToTrip={handleAddToTrip}
        formatTimeAgo={formatTimeAgo}
      />

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
        onCreatePublication={handleCreatePublicationFromAddMemory}
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

      {/* Trip Detail Modal */}
      <TripDetailModal
        isOpen={isTripDetailModalOpen}
        onClose={() => setIsTripDetailModalOpen(false)}
        trip={currentTrip}
      />
    </div>
  );
};

export default HomeSection;
