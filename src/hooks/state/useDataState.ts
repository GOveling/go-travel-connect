
import { useState, useEffect } from "react";
import { Trip } from "@/types/aiSmartRoute";
import { InstaTripImage, ProfilePost, FriendPublication } from "../types/homeStateTypes";
import { initialTripsData } from "../data/mockTripsData";

export const useDataState = () => {
  const [selectedTripForPhotobook, setSelectedTripForPhotobook] = useState<Trip | null>(null);
  const [notificationCount, setNotificationCount] = useState(5);
  const [instaTripImages, setInstaTripImages] = useState<InstaTripImage[]>([]);
  const [profilePosts, setProfilePosts] = useState<ProfilePost[]>([]);
  const [trips, setTrips] = useState<Trip[]>(initialTripsData);
  const [selectedPostForTrip, setSelectedPostForTrip] = useState<ProfilePost | null>(null);
  const [friendPublications, setFriendPublications] = useState<FriendPublication[]>([
    {
      id: "friend1-pub1",
      friendName: "Emma Johnson",
      friendAvatar: "https://i.pravatar.cc/150?img=1",
      images: [
        "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        "https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
      ],
      text: "Amazing sunset at the beach today! Perfect end to our vacation.",
      createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      location: "Malibu Beach, California",
      likes: 24,
      comments: 3,
      liked: false
    },
    {
      id: "friend2-pub1",
      friendName: "Alex Chen",
      friendAvatar: "https://i.pravatar.cc/150?img=11",
      images: [
        "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
      ],
      text: "Hiking through the Redwood Forest. These trees are incredible!",
      createdAt: Date.now() - 8 * 60 * 60 * 1000, // 8 hours ago
      location: "Redwood National Park",
      likes: 42,
      comments: 7,
      liked: true
    },
    {
      id: "friend3-pub1",
      friendName: "Sophia Martinez",
      friendAvatar: "https://i.pravatar.cc/150?img=5",
      images: [
        "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
      ],
      text: "Our first day in Rome! The Colosseum is even more impressive in person.",
      createdAt: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
      location: "Rome, Italy",
      likes: 63,
      comments: 12,
      liked: false
    }
  ]);

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
    friendPublications,
    setFriendPublications,
  };
};
