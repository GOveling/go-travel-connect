
import { useState, useEffect } from "react";

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

interface Trip {
  id: number;
  name: string;
  destination: string;
  dates: string;
  status: string;
  image: string;
  collaborators?: Array<{
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: "owner" | "editor" | "viewer";
  }>;
}

export const useHomeState = () => {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isAddMemoryModalOpen, setIsAddMemoryModalOpen] = useState(false);
  const [isInstaTripModalOpen, setIsInstaTripModalOpen] = useState(false);
  const [isProfilePublicationModalOpen, setIsProfilePublicationModalOpen] = useState(false);
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);
  const [isAddToTripModalOpen, setIsAddToTripModalOpen] = useState(false);
  const [isTripDetailModalOpen, setIsTripDetailModalOpen] = useState(false);
  const [isPhotobookModalOpen, setIsPhotobookModalOpen] = useState(false);
  const [selectedTripForPhotobook, setSelectedTripForPhotobook] = useState<Trip | null>(null);
  const [notificationCount, setNotificationCount] = useState(5);
  const [instaTripImages, setInstaTripImages] = useState<InstaTripImage[]>([]);
  const [profilePosts, setProfilePosts] = useState<ProfilePost[]>([]);
  const [trips, setTrips] = useState<Trip[]>([
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

  return {
    // Modal states
    isNotificationModalOpen,
    setIsNotificationModalOpen,
    isAddMemoryModalOpen,
    setIsAddMemoryModalOpen,
    isInstaTripModalOpen,
    setIsInstaTripModalOpen,
    isProfilePublicationModalOpen,
    setIsProfilePublicationModalOpen,
    isNewTripModalOpen,
    setIsNewTripModalOpen,
    isAddToTripModalOpen,
    setIsAddToTripModalOpen,
    isTripDetailModalOpen,
    setIsTripDetailModalOpen,
    isPhotobookModalOpen,
    setIsPhotobookModalOpen,
    
    // Data states
    selectedTripForPhotobook,
    setSelectedTripForPhotobook,
    notificationCount,
    setNotificationCount,
    instaTripImages,
    setInstaTripImages,
    profilePosts,
    setProfilePosts,
    trips,
    setTrips,
    selectedPostForTrip,
    setSelectedPostForTrip,
    currentTrip
  };
};
