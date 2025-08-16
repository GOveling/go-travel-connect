import { useState, useEffect, useMemo } from "react";
import { EditTripModal } from "./EditTripModal";
import ClientOnly from "@/components/ui/ClientOnly";
import ModalErrorBoundary from "@/components/ui/ModalErrorBoundary";
import { Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  Globe,
  Phone,
  Edit3,
  Share2,
  UserPlus,
  X,
  Plane,
  Car,
  Building,
  Clock,
  ExternalLink,
  Star,
  Heart,
  Map,
  Trash2,
  CreditCard,
  Hotel,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format, isPast, isFuture } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SavedPlacesRouteMap from "./SavedPlacesRouteMap";
import InviteFriendsModal from "./InviteFriendsModal";

import PlaceDetailModal from "./PlaceDetailModal";
import FlightSearchModal from "./itinerary/FlightSearchModal";
import HotelSearchModal from "./itinerary/HotelSearchModal";
import ToursModal from "./itinerary/ToursModal";
import TransferModal from "./itinerary/TransferModal";
import { Trip, SavedPlace, Collaborator, TripCoordinate } from "@/types";

// Interface for PlaceDetailModal
interface PlaceForModal {
  name: string;
  location: string;
  rating: number;
  image: string;
  category: string;
  description?: string;
  hours?: string;
  website?: string;
  phone?: string;
  lat?: number;
  lng?: number;
}

interface TripDetailModalProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTrip?: (tripData: any) => void;
  onDeleteTrip?: (tripId: string) => void;
}

const TripDetailModal = ({
  trip,
  isOpen,
  onClose,
  onUpdateTrip,
  onDeleteTrip,
}: TripDetailModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Debug logging for modal state
  console.log("TripDetailModal render:", { isOpen, tripId: trip?.id });

  useEffect(() => {
    console.log("TripDetailModal isOpen changed:", isOpen);
  }, [isOpen]);
  const [activeTab, setActiveTab] = useState("overview");
  const [showRouteMap, setShowRouteMap] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [selectedPlaces, setSelectedPlaces] = useState<SavedPlace[]>([]);
  const [selectedDestinationIndex, setSelectedDestinationIndex] =
    useState<number>(0);
  const [showInviteFriendsModal, setShowInviteFriendsModal] = useState(false);
  const [showEditTripModal, setShowEditTripModal] = useState(false);
  const [showPlaceDetailModal, setShowPlaceDetailModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceForModal | null>(
    null
  );
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [placeToRemove, setPlaceToRemove] = useState<SavedPlace | null>(null);
  const [userRole, setUserRole] = useState<string>("viewer");
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  // New modal states
  const [showFlightSearchModal, setShowFlightSearchModal] = useState(false);
  const [showHotelSearchModal, setShowHotelSearchModal] = useState(false);
  const [showToursModal, setShowToursModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedLocationForModal, setSelectedLocationForModal] =
    useState<TripCoordinate | null>(null);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState<number>(0);
  const [transferType, setTransferType] = useState<
    "arrival" | "departure" | "between"
  >("arrival");

  // Fetch user role and member count
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!trip || !user || !isOpen) return;

      try {
        setLoading(true);

        // Determine user role
        let role = "viewer";
        if (trip.user_id === user.id) {
          role = "owner";
        } else {
          const { data: memberData } = await supabase
            .from("trip_collaborators")
            .select("role")
            .eq("trip_id", trip.id)
            .eq("user_id", user.id)
            .single();

          if (memberData) {
            role = memberData.role;
          }
        }
        setUserRole(role);

        // Get member count
        const { count } = await supabase
          .from("trip_collaborators")
          .select("id", { count: "exact", head: true })
          .eq("trip_id", trip.id);

        setMemberCount(count || 0);
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [trip, user, isOpen]);

  // Listen for trip invitation acceptance to refresh user role
  useEffect(() => {
    const handleTripInvitationAccepted = (event: CustomEvent) => {
      const { tripId } = event.detail;
      if (tripId === trip?.id && isOpen) {
        console.log(
          "Trip invitation accepted, refreshing user role for trip:",
          tripId
        );
        // Refetch user role after invitation acceptance
        if (trip && user) {
          const fetchUpdatedRole = async () => {
            try {
              let role = "viewer";
              if (trip.user_id === user.id) {
                role = "owner";
              } else {
                const { data: memberData } = await supabase
                  .from("trip_collaborators")
                  .select("role")
                  .eq("trip_id", trip.id)
                  .eq("user_id", user.id)
                  .single();

                if (memberData) {
                  role = memberData.role;
                }
              }
              setUserRole(role);
              console.log("Updated user role:", role);
            } catch (error) {
              console.error("Error refreshing user role:", error);
            }
          };
          fetchUpdatedRole();
        }
      }
    };

    window.addEventListener(
      "tripInvitationAccepted",
      handleTripInvitationAccepted as EventListener
    );

    return () => {
      window.removeEventListener(
        "tripInvitationAccepted",
        handleTripInvitationAccepted as EventListener
      );
    };
  }, [trip, user, isOpen]);

  // Function to navigate to explore section
  const handleNavigateToExplore = () => {
    onClose(); // Close the modal first
    const event = new CustomEvent("navigateToExplore", {
      detail: { sourceTrip: trip },
    });
    window.dispatchEvent(event);
  };

  // Function to handle opening the invite friends modal
  const handleInviteFriends = () => {
    setShowInviteFriendsModal(true);
  };

  // Function to handle opening the edit trip modal
  const handleEditTrip = () => {
    setShowEditTripModal(true);
  };

  // Function to handle viewing place details
  const handleViewPlaceDetails = (place: SavedPlace) => {
    // Convert SavedPlace to the format expected by PlaceDetailModal
    const placeForModal: PlaceForModal = {
      name: place.name,
      location: place.destinationName || "Location details",
      rating: place.rating || 0,
      image: place.image || "📍",
      category: place.category || "Place",
      description: place.description || "",
      hours: place.estimatedTime || "N/A",
      website: undefined,
      phone: undefined,
      lat: place.lat || undefined,
      lng: place.lng || undefined,
    };
    setSelectedPlace(placeForModal);
    setShowPlaceDetailModal(true);
  };

  // Group saved places by country from destination_name
  const savedPlacesByCountry = useMemo(() => {
    if (!trip?.savedPlaces) return {};

    return trip.savedPlaces.reduce(
      (acc, place) => {
        // Extract country from destination_name (assuming format like "City, Country")
        const destinationName = place.destinationName || "Other";
        const country = destinationName.includes(",")
          ? destinationName.split(",").pop()?.trim() || "Other"
          : destinationName;

        if (!acc[country]) {
          acc[country] = [];
        }
        acc[country].push(place);
        return acc;
      },
      {} as Record<string, SavedPlace[]>
    );
  }, [trip?.savedPlaces]);

  // Get countries from trip destination (now a JSON array)
  const uniqueCountries = useMemo(() => {
    if (!trip?.destination) return [];
    try {
      // Parse the JSON array of countries
      const countries = Array.isArray(trip.destination)
        ? trip.destination
        : JSON.parse(trip.destination as string);
      return countries.filter((country) => country && country !== "Unknown");
    } catch {
      return [];
    }
  }, [trip?.destination]);

  // Get total saved places count
  const totalSavedPlaces = useMemo(() => {
    return trip?.savedPlaces?.length || 0;
  }, [trip?.savedPlaces]);

  // Function to show remove confirmation
  const handleRemovePlace = (place: SavedPlace) => {
    setPlaceToRemove(place);
    setShowRemoveConfirmation(true);
  };

  // Function to confirm and delete the saved place
  const confirmRemovePlace = async () => {
    if (!trip || !placeToRemove) return;

    try {
      setIsRemoving(placeToRemove.id);

      // Delete from Supabase
      const { error } = await supabase
        .from("saved_places")
        .delete()
        .eq("id", placeToRemove.id);

      if (error) {
        console.error("Error deleting place:", error);
        toast({
          title: "Error",
          description: "Failed to remove place. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Update the trip state locally by filtering out the deleted place
      if (onUpdateTrip && trip.savedPlaces) {
        const updatedSavedPlaces = trip.savedPlaces.filter(
          (place) => place.id !== placeToRemove.id
        );
        const updatedTrip = {
          ...trip,
          savedPlaces: updatedSavedPlaces,
        };
        onUpdateTrip(updatedTrip);
      }

      toast({
        title: "Place removed",
        description: "The place has been successfully removed from your trip.",
      });

      // Close the confirmation modal
      setShowRemoveConfirmation(false);
      setPlaceToRemove(null);
    } catch (error) {
      console.error("Error removing place:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(null);
    }
  };

  // Function to render place image - handles both URLs and emoji/icons
  const renderPlaceImage = (imageUrl: string | null) => {
    if (!imageUrl) {
      return <span className="text-2xl">📍</span>;
    }

    // Check if it's a URL (contains http/https)
    if (imageUrl.includes("http://") || imageUrl.includes("https://")) {
      return (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <img
            src={imageUrl}
            alt="Place"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to default icon if image fails to load
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
          <div className="hidden w-full h-full flex items-center justify-center text-2xl">
            📍
          </div>
        </div>
      );
    }

    // It's an emoji or icon, render as text
    return <span className="text-2xl">{imageUrl}</span>;
  };

  // Function to cancel remove operation
  const cancelRemovePlace = () => {
    setShowRemoveConfirmation(false);
    setPlaceToRemove(null);
  };

  // Function to parse trip dates and calculate destination dates
  const getDestinationDates = (
    tripDates: string,
    destinationIndex: number,
    totalDestinations: number
  ) => {
    try {
      // Parse dates like "Dec 15 - Dec 25, 2024"
      const dateRange = tripDates.split(" - ");
      if (dateRange.length !== 2) return `Day ${destinationIndex + 1}`;

      const startDateStr = dateRange[0];
      const endDateStr = dateRange[1];

      // Extract year from end date
      const year =
        endDateStr.split(", ")[1] || new Date().getFullYear().toString();

      // Parse start date
      const startMonth = startDateStr.split(" ")[0];
      const startDay = parseInt(startDateStr.split(" ")[1]);

      // Parse end date
      const endMonth = endDateStr.split(" ")[0];
      const endDay = parseInt(endDateStr.split(" ")[1].split(",")[0]);

      // Convert month names to numbers
      const monthMap: { [key: string]: number } = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };

      const startDate = new Date(
        parseInt(year),
        monthMap[startMonth],
        startDay
      );
      const endDate = new Date(parseInt(year), monthMap[endMonth], endDay);

      // Fix: Calculate days correctly (inclusive of both start and end dates)
      const totalDays =
        Math.floor(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;
      const baseDaysPerDestination = Math.floor(totalDays / totalDestinations);
      const extraDays = totalDays % totalDestinations;

      // Calculate destination start and end dates
      const daysForThisDestination =
        baseDaysPerDestination + (destinationIndex < extraDays ? 1 : 0);
      const destStartDate = new Date(startDate);

      // Add days for previous destinations
      let dayOffset = 0;
      for (let i = 0; i < destinationIndex; i++) {
        dayOffset += baseDaysPerDestination + (i < extraDays ? 1 : 0);
      }
      destStartDate.setDate(startDate.getDate() + dayOffset);

      const destEndDate = new Date(destStartDate);
      destEndDate.setDate(destStartDate.getDate() + daysForThisDestination - 1);

      // Format dates
      const formatDate = (date: Date) => {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return `${months[date.getMonth()]} ${date.getDate()}`;
      };

      if (destStartDate.getTime() === destEndDate.getTime()) {
        return formatDate(destStartDate);
      } else {
        return `${formatDate(destStartDate)} - ${formatDate(destEndDate)}`;
      }
    } catch (error) {
      // Fallback to day format if parsing fails
      return `Day ${destinationIndex + 1}`;
    }
  };

  // Function to calculate total travelers for group trips
  const getTotalTravelers = () => {
    if (!trip) return 0;

    if (trip.isGroupTrip && trip.collaborators) {
      // For group trips, count collaborators + 1 (the user)
      return trip.collaborators.length + 1;
    }
    // For solo trips, use the original travelers count
    return trip.travelers;
  };

  // New handler functions for the modals
  const handleFlightSearch = (locationIndex: number) => {
    if (trip && trip.coordinates[locationIndex]) {
      setSelectedLocationForModal(trip.coordinates[locationIndex]);
      setSelectedLocationIndex(locationIndex);
      setShowFlightSearchModal(true);
    }
  };

  const handleHotelSearch = (locationIndex: number) => {
    if (trip && trip.coordinates[locationIndex]) {
      setSelectedLocationForModal(trip.coordinates[locationIndex]);
      setSelectedLocationIndex(locationIndex);
      setShowHotelSearchModal(true);
    }
  };

  const handleToursSearch = (locationIndex: number) => {
    if (trip && trip.coordinates[locationIndex]) {
      setSelectedLocationForModal(trip.coordinates[locationIndex]);
      setSelectedLocationIndex(locationIndex);
      setShowToursModal(true);
    }
  };

  const handleTransferSearch = (
    locationIndex: number,
    type: "arrival" | "departure" | "between"
  ) => {
    if (trip && trip.coordinates[locationIndex]) {
      setSelectedLocationForModal(trip.coordinates[locationIndex]);
      setSelectedLocationIndex(locationIndex);
      setTransferType(type);
      setShowTransferModal(true);
    }
  };

  if (!trip) return null;

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

  // Get trip status based on dates
  const getTripStatus = () => {
    if (!trip?.dates) return "Planning";

    try {
      // Parse the dates string like "Dec 15 - Dec 25, 2024"
      const dateRange = trip.dates.split(" - ");
      if (dateRange.length !== 2) return "Planning";

      const endDateStr = dateRange[1];
      const year =
        endDateStr.split(", ")[1] || new Date().getFullYear().toString();
      const endMonth = endDateStr.split(" ")[0];
      const endDay = parseInt(endDateStr.split(" ")[1].split(",")[0]);

      const monthMap: { [key: string]: number } = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };

      const endDate = new Date(parseInt(year), monthMap[endMonth], endDay);

      if (isPast(endDate)) return "Complete";
      return "Upcoming";
    } catch {
      return "Planning";
    }
  };

  // Get traveler count
  const getTravelerCount = () => {
    return trip?.isGroupTrip ? memberCount + 1 : 1; // +1 for owner
  };

  // Get badge color based on status
  const getStatusBadgeColor = () => {
    const status = getTripStatus();
    switch (status) {
      case "Complete":
        return "default";
      case "Upcoming":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Get user role badge props
  const getUserRoleBadgeProps = () => {
    switch (userRole) {
      case "owner":
        return { variant: "default" as const, label: "Owner" };
      case "editor":
        return { variant: "secondary" as const, label: "Editor" };
      default:
        return { variant: "outline" as const, label: "Viewer" };
    }
  };

  // Format date range
  const getDateRange = () => {
    if (!trip?.startDate && !trip?.endDate) {
      return "No dates set";
    }

    if (trip.startDate && trip.endDate) {
      const startFormatted = format(trip.startDate, "MMM d, yyyy");
      const endFormatted = format(trip.endDate, "MMM d, yyyy");
      return `${startFormatted} - ${endFormatted}`;
    } else if (trip.startDate) {
      return format(trip.startDate, "MMM d, yyyy");
    } else if (trip.endDate) {
      return `Until ${format(trip.endDate, "MMM d, yyyy")}`;
    }

    return "No dates set";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <ClientOnly fallback={<div>Loading...</div>}>
        <ModalErrorBoundary>
          <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[95vh] w-[95vw] mx-auto overflow-hidden flex flex-col rounded-[5px]">
              <DialogHeader className="flex-shrink-0 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <DialogTitle className="text-xl md:text-2xl font-bold text-gray-800 flex items-center space-x-2 md:space-x-3">
                    <span className="text-2xl md:text-3xl">{trip.image}</span>
                    <span className="truncate">{trip.name}</span>
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={getUserRoleBadgeProps().variant}>
                      {getUserRoleBadgeProps().label}
                    </Badge>
                    <Badge variant={getStatusBadgeColor()}>
                      {getTripStatus()}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-hidden flex flex-col space-y-4 md:space-y-6">
                {/* Trip Info Header */}
                <div className="flex-shrink-0 space-y-2 md:space-y-3">
                  {/* Countries badges */}
                  {uniqueCountries.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {uniqueCountries.map((country) => (
                        <Badge
                          key={country}
                          variant="secondary"
                          className="text-xs"
                        >
                          {country}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-gray-600 text-sm">
                    <Calendar size={14} />
                    <span className="truncate">{getDateRange()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600 text-sm">
                    <Users size={14} />
                    <span>
                      {getTravelerCount()} traveler
                      {getTravelerCount() > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Tab Navigation using shadcn Tabs */}
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <TabsList className="grid w-full grid-cols-3 h-auto p-1 mb-4 flex-shrink-0">
                    <TabsTrigger
                      value="overview"
                      className="text-xs md:text-sm px-2 py-2"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="itinerary"
                      className="text-xs md:text-sm px-2 py-2"
                    >
                      Itinerary
                    </TabsTrigger>
                    <TabsTrigger
                      value="collaborators"
                      className="text-xs md:text-sm px-2 py-2"
                    >
                      <span className="hidden md:inline">Collaborators</span>
                      <span className="md:hidden">Team</span>
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex-1 overflow-y-auto">
                    <TabsContent value="overview" className="space-y-4 mt-0">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Dates</p>
                            <p className="text-sm text-muted-foreground">
                              {getDateRange()}
                            </p>
                          </div>
                        </div>

                        {trip.destination && (
                          <div className="flex items-start space-x-3">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">Destination</p>
                              <p className="text-sm text-muted-foreground">
                                {Array.isArray(trip.destination)
                                  ? trip.destination.join(", ")
                                  : trip.destination}
                              </p>
                            </div>
                          </div>
                        )}

                        {trip.budget && (
                          <div className="flex items-start space-x-3">
                            <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">Budget</p>
                              <p className="text-sm text-muted-foreground">
                                {trip.budget}
                              </p>
                            </div>
                          </div>
                        )}

                        {trip.accommodation && (
                          <div className="flex items-start space-x-3">
                            <Hotel className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">Accommodation</p>
                              <p className="text-sm text-muted-foreground">
                                {trip.accommodation}
                              </p>
                            </div>
                          </div>
                        )}

                        {trip.transportation && (
                          <div className="flex items-start space-x-3">
                            <Plane className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">Transportation</p>
                              <p className="text-sm text-muted-foreground">
                                {trip.transportation}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Description section */}
                        {trip.description && (
                          <div className="mt-6 pt-4 border-t">
                            <h4 className="font-medium mb-2">Description</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                              {trip.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="itinerary" className="space-y-6 mt-0">
                      {/* Flight Booking Section */}
                      <Card className="border-purple-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Plane className="text-purple-600" size={20} />
                            <span>Flight Booking</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <h5 className="font-medium text-purple-800 mb-2">
                              Round-trip Flight
                            </h5>
                            <p className="text-sm text-purple-600 mb-3">
                              From your location to {trip.coordinates[0]?.name}
                            </p>
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                              <Button
                                className="bg-purple-600 hover:bg-purple-700 flex-1 sm:flex-none"
                                onClick={() => handleFlightSearch(0)}
                              >
                                Search Flights
                              </Button>
                              <Button
                                variant="outline"
                                className="border-purple-300 text-purple-600 flex-1 sm:flex-none"
                              >
                                Compare Prices
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Destinations and Booking Options */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
                          <MapPin size={18} />
                          <span>Destinations & Bookings</span>
                        </h4>

                        {trip.coordinates.map((location, index) => (
                          <Card
                            key={index}
                            className="border-l-4 border-l-orange-400"
                          >
                            <CardContent className="p-4">
                              <div className="space-y-4">
                                {/* Destination Info */}
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-800">
                                      {location.name}
                                    </h5>
                                    <p className="text-gray-600 text-sm">
                                      {getDestinationDates(
                                        trip.dates,
                                        index,
                                        trip.coordinates.length
                                      )}
                                    </p>
                                  </div>
                                  <div className="text-gray-400 text-xs hidden md:block">
                                    {location.lat.toFixed(4)},{" "}
                                    {location.lng.toFixed(4)}
                                  </div>
                                </div>

                                {/* Booking Options - Updated with modal handlers */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {/* Local Transport */}
                                  {index > 0 && (
                                    <div className="bg-orange-50 p-3 rounded-lg">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Car
                                          className="text-orange-600"
                                          size={16}
                                        />
                                        <h6 className="font-medium text-orange-800 text-sm">
                                          Transport to {location.name}
                                        </h6>
                                      </div>
                                      <p className="text-xs text-orange-600 mb-2">
                                        From {trip.coordinates[index - 1]?.name}
                                      </p>
                                      <Button
                                        size="sm"
                                        className="bg-orange-600 hover:bg-orange-700 text-xs w-full sm:w-auto"
                                        onClick={() =>
                                          handleTransferSearch(index, "between")
                                        }
                                      >
                                        Book Transport
                                      </Button>
                                    </div>
                                  )}

                                  {/* Hotel Booking */}
                                  <div className="bg-green-50 p-3 rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <Building
                                        className="text-green-600"
                                        size={16}
                                      />
                                      <h6 className="font-medium text-green-800 text-sm">
                                        Hotel Options
                                      </h6>
                                    </div>
                                    <p className="text-xs text-green-600 mb-2">
                                      Best rates in {location.name}
                                    </p>
                                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                      <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-xs flex-1"
                                        onClick={() => handleHotelSearch(index)}
                                      >
                                        Search Hotels
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-green-300 text-green-600 text-xs flex-1"
                                      >
                                        View Deals
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Activities */}
                                  <div className="bg-purple-50 p-3 rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <MapPin
                                        className="text-purple-600"
                                        size={16}
                                      />
                                      <h6 className="font-medium text-purple-800 text-sm">
                                        Activities & Tours
                                      </h6>
                                    </div>
                                    <p className="text-xs text-purple-600 mb-2">
                                      Explore {location.name}
                                    </p>
                                    <Button
                                      size="sm"
                                      className="bg-purple-600 hover:bg-purple-700 text-xs w-full sm:w-auto"
                                      onClick={() => handleToursSearch(index)}
                                    >
                                      Find Tours
                                    </Button>
                                  </div>

                                  {/* Airport Transfer */}
                                  {index === 0 && (
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Car
                                          className="text-blue-600"
                                          size={16}
                                        />
                                        <h6 className="font-medium text-blue-800 text-sm">
                                          Airport Transfer
                                        </h6>
                                      </div>
                                      <p className="text-xs text-blue-600 mb-2">
                                        From airport to accommodation
                                      </p>
                                      <Button
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700 text-xs w-full sm:w-auto"
                                        onClick={() =>
                                          handleTransferSearch(index, "arrival")
                                        }
                                      >
                                        Book Transfer
                                      </Button>
                                    </div>
                                  )}

                                  {/* Airport Transfer for last destination */}
                                  {index === trip.coordinates.length - 1 && (
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Car
                                          className="text-blue-600"
                                          size={16}
                                        />
                                        <h6 className="font-medium text-blue-800 text-sm">
                                          Airport Transfer
                                        </h6>
                                      </div>
                                      <p className="text-xs text-blue-600 mb-2">
                                        From accommodation to airport
                                      </p>
                                      <Button
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700 text-xs w-full sm:w-auto"
                                        onClick={() =>
                                          handleTransferSearch(
                                            index,
                                            "departure"
                                          )
                                        }
                                      >
                                        Book Transfer
                                      </Button>
                                    </div>
                                  )}
                                </div>

                                {/* Quick Info */}
                                <div className="border-t pt-3 mt-3">
                                  <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                                    <div className="flex items-center space-x-1">
                                      <Clock size={12} />
                                      <span>2-3 days</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Building size={12} />
                                      <span>Hotels available</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <ExternalLink size={12} />
                                      <span>Book online</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Package Deals */}
                      <Card className="bg-gradient-to-r from-purple-50 to-orange-50 border-0">
                        <CardHeader>
                          <CardTitle className="text-lg text-gray-800">
                            Package Deals
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="bg-white p-4 rounded-lg border">
                            <h5 className="font-medium text-gray-800 mb-2">
                              Complete Trip Package
                            </h5>
                            <p className="text-sm text-gray-600 mb-3">
                              Flights + Hotels + Transfers for the entire trip
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                              <span className="text-lg font-bold text-green-600">
                                Save up to 25%
                              </span>
                              <Button className="bg-gradient-to-r from-purple-600 to-orange-500 w-full sm:w-auto">
                                Book Package
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent
                      value="collaborators"
                      className="space-y-4 mt-0"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800">
                          Trip Collaborators
                        </h4>
                        {trip.isGroupTrip && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={handleInviteFriends}
                          >
                            <UserPlus size={14} className="mr-1" />
                            Invite or Edit
                          </Button>
                        )}
                      </div>

                      {trip.collaborators && trip.collaborators.length > 0 ? (
                        <div className="space-y-3">
                          {trip.collaborators.map((collaborator) => (
                            <Card key={collaborator.id}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 flex-1">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-orange-500 rounded-full flex items-center justify-center text-white font-medium">
                                      {collaborator.avatar}
                                    </div>
                                    <div className="flex-1">
                                      <h5 className="font-medium text-gray-800">
                                        {collaborator.name}
                                      </h5>
                                      <p className="text-gray-600 text-sm truncate">
                                        {collaborator.email}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge
                                    className={`text-xs px-2 py-1 rounded-full ${getRoleColor(collaborator.role)}`}
                                  >
                                    {collaborator.role}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Users
                            size={48}
                            className="mx-auto mb-3 text-gray-300"
                          />
                          <p>This is a solo trip</p>
                          <p className="text-sm">
                            Convert to group trip to add collaborators
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  </div>
                </Tabs>

                {/* Action Buttons - Conditional based on active tab */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t flex-shrink-0">
                  {activeTab === "collaborators" ? (
                    // Team management actions
                    <>
                      <Button
                        className="flex-1 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
                        onClick={handleInviteFriends}
                      >
                        <UserPlus size={16} className="mr-2" />
                        Manage Team
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Share2 size={16} className="mr-2" />
                        Share Trip
                      </Button>
                    </>
                  ) : (
                    // General trip actions
                    <>
                      {(userRole === "owner" || userRole === "editor") && (
                        <Button
                          className="flex-1 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
                          onClick={() => setShowEditModal(true)}
                        >
                          <Edit3 size={16} className="mr-2" />
                          Edit Trip
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </ModalErrorBoundary>
      </ClientOnly>

      {/* InviteFriendsModal */}
      <InviteFriendsModal
        trip={trip}
        isOpen={showInviteFriendsModal}
        onClose={() => setShowInviteFriendsModal(false)}
      />

      {/* PlaceDetailModal */}
      <PlaceDetailModal
        place={selectedPlace}
        isOpen={showPlaceDetailModal}
        onClose={() => {
          setShowPlaceDetailModal(false);
          setSelectedPlace(null);
        }}
        isFromSavedPlaces={true}
      />

      {/* New Itinerary Modals */}
      <FlightSearchModal
        isOpen={showFlightSearchModal}
        onClose={() => setShowFlightSearchModal(false)}
        fromDestination=""
        toDestination={selectedLocationForModal?.name || ""}
        tripDates={trip?.dates || ""}
        travelers={getTotalTravelers()}
      />

      <HotelSearchModal
        isOpen={showHotelSearchModal}
        onClose={() => setShowHotelSearchModal(false)}
        destination={selectedLocationForModal?.name || ""}
        dates={
          trip
            ? getDestinationDates(
                trip.dates,
                selectedLocationIndex,
                trip.coordinates.length
              )
            : ""
        }
        travelers={getTotalTravelers()}
      />

      <ToursModal
        isOpen={showToursModal}
        onClose={() => setShowToursModal(false)}
        destination={selectedLocationForModal?.name || ""}
        dates={
          trip
            ? getDestinationDates(
                trip.dates,
                selectedLocationIndex,
                trip.coordinates.length
              )
            : ""
        }
        travelers={getTotalTravelers()}
      />

      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        destination={selectedLocationForModal?.name || ""}
        transferType={transferType}
        fromLocation={
          transferType === "between" && selectedLocationIndex > 0
            ? trip?.coordinates[selectedLocationIndex - 1]?.name
            : undefined
        }
        toLocation={selectedLocationForModal?.name}
        travelers={getTotalTravelers()}
      />

      {/* Remove Confirmation Dialog */}
      <AlertDialog
        open={showRemoveConfirmation}
        onOpenChange={setShowRemoveConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Place</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{placeToRemove?.name}" from your
              trip? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelRemovePlace}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemovePlace}
              className="bg-red-600 hover:bg-red-700"
              disabled={isRemoving === placeToRemove?.id}
            >
              {isRemoving === placeToRemove?.id ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Edit Trip Modal */}
      {trip && (
        <EditTripModal
          trip={trip}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updatedTrip) => {
            // Update the trip data if onUpdateTrip callback is provided
            if (onUpdateTrip) {
              onUpdateTrip(updatedTrip);
            }
          }}
        />
      )}
    </>
  );
};

export default TripDetailModal;
