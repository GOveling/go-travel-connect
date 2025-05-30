
import { useState, useEffect } from "react";
import { Trip } from "@/types/aiSmartRoute";
import { InstaTripImage, ProfilePost } from "../types/homeStateTypes";
import { initialTripsData } from "../data/mockTripsData";

export const useDataState = () => {
  const [selectedTripForPhotobook, setSelectedTripForPhotobook] = useState<Trip | null>(null);
  const [notificationCount, setNotificationCount] = useState(5);
  const [instaTripImages, setInstaTripImages] = useState<InstaTripImage[]>([]);
  const [profilePosts, setProfilePosts] = useState<ProfilePost[]>([]);
  const [trips, setTrips] = useState<Trip[]>(initialTripsData);
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

  return {
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
  };
};
