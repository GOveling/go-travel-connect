
import { useState, useEffect } from "react";
import { calculateTripStatus } from "@/utils/tripStatusUtils";
import { Trip } from "@/types/aiSmartRoute";

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
      travelers: 2,
      image: "🇪🇺",
      isGroupTrip: false,
      coordinates: [
        { name: "Paris", lat: 48.8566, lng: 2.3522 },
        { name: "Rome", lat: 41.9028, lng: 12.4964 },
        { name: "Barcelona", lat: 41.3851, lng: 2.1734 }
      ]
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
      ]
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

  // Calculate dynamic trip statuses and find current/upcoming trip
  const tripsWithDynamicStatus = trips.map(trip => ({
    ...trip,
    status: calculateTripStatus(trip.dates)
  }));

  const travelingTrip = tripsWithDynamicStatus.find(trip => trip.status === 'traveling');
  const upcomingTrips = tripsWithDynamicStatus
    .filter(trip => trip.status === 'upcoming')
    .sort((a, b) => {
      // Sort by start date (earliest first)
      const getStartDate = (dates: string) => {
        try {
          const startDateStr = dates.split(' - ')[0];
          const year = dates.split(', ')[1] || new Date().getFullYear().toString();
          const month = startDateStr.split(' ')[0];
          const day = parseInt(startDateStr.split(' ')[1]);
          
          const monthMap: { [key: string]: number } = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
          };
          
          return new Date(parseInt(year), monthMap[month], day);
        } catch {
          return new Date();
        }
      };
      
      return getStartDate(a.dates).getTime() - getStartDate(b.dates).getTime();
    });

  // Find the nearest upcoming trip within 40 days
  const nearestUpcomingTrip = upcomingTrips.find(trip => {
    try {
      const startDateStr = trip.dates.split(' - ')[0];
      const year = trip.dates.split(', ')[1] || new Date().getFullYear().toString();
      const month = startDateStr.split(' ')[0];
      const day = parseInt(startDateStr.split(' ')[1]);
      
      const monthMap: { [key: string]: number } = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      
      const startDate = new Date(parseInt(year), monthMap[month], day);
      const currentDate = new Date();
      const daysDifference = Math.ceil((startDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return daysDifference <= 40 && daysDifference > 0;
    } catch {
      return false;
    }
  });

  // Current trip data based on status priority - with complete Trip interface
  const currentTrip: Trip = travelingTrip || nearestUpcomingTrip || {
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
    currentTrip,
    travelingTrip,
    nearestUpcomingTrip,
    tripsWithDynamicStatus
  };
};
