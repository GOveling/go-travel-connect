import { useHomeState } from "./useHomeState";

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

export const useHomeHandlers = (homeState: ReturnType<typeof useHomeState>) => {
  const {
    setIsNotificationModalOpen,
    setIsAddMemoryModalOpen,
    setIsInstaTripModalOpen,
    setIsProfilePublicationModalOpen,
    setIsNewTripModalOpen,
    setIsAddToTripModalOpen,
    setIsTripDetailModalOpen,
    setIsPhotobookModalOpen,
    setSelectedTripForPhotobook,
    setNotificationCount,
    setInstaTripImages,
    setProfilePosts,
    setTrips,
    setSelectedPostForTrip
  } = homeState;

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
    const { selectedPostForTrip } = homeState;
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

  const handleOpenTripPhotobook = (trip: Trip) => {
    setSelectedTripForPhotobook(trip);
    setIsPhotobookModalOpen(true);
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

  const handlePlanNewTrip = () => {
    setIsNewTripModalOpen(true);
  };

  const handleNavigateToTrips = () => {
    // Dispatch custom event to navigate to trips section
    window.dispatchEvent(new CustomEvent('navigateToTrips'));
  };

  return {
    handleNotificationClick,
    handleAddMemoryClick,
    handleInstaTripClick,
    handleProfilePublicationClick,
    handleCreatePublicationFromAddMemory,
    handleMarkAllNotificationsRead,
    handleAddInstaTripImage,
    handleRemoveInstaTripImage,
    handleAddProfilePost,
    handleCreateTrip,
    handleAddToTrip,
    handleAddToExistingTrip,
    handleCreateNewTripFromPost,
    handleOpenTripPhotobook,
    formatTimeAgo,
    handleViewCurrentTripDetail,
    handlePlanNewTrip,
    handleNavigateToTrips
  };
};
