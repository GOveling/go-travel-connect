import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  calculateTripStatus,
  getStatusDisplayText,
} from "@/utils/tripStatusUtils";
import { format } from "date-fns";
import {
  Calendar,
  CreditCard,
  Hotel,
  MapPin,
  Plane,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Trip {
  id: string;
  name: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  type?: string;
  is_group_trip?: boolean;
  budget?: string;
  accommodation?: string;
  transportation?: string;
  description?: string;
}

export const TripOverview = ({
  trip,
  userRole,
  onUpdate,
}: {
  trip: Trip;
  userRole: string;
  onUpdate: (trip: Trip) => void;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const canEdit = userRole === "owner" || userRole === "editor";

  // Fetch member count for traveler calculation
  useEffect(() => {
    const fetchMemberCount = async () => {
      if (!trip.id) return;

      try {
        const { count } = await supabase
          .from("trip_collaborators")
          .select("id", { count: "exact", head: true })
          .eq("trip_id", trip.id);

        setMemberCount(count || 0);
      } catch (error) {
        console.error("Error fetching member count:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberCount();
  }, [trip.id]);

  // Get trip status using the trip status utility with proper date conversion
  const getTripStatus = () => {
    const tripData = {
      startDate: trip.start_date ? new Date(trip.start_date) : undefined,
      endDate: trip.end_date ? new Date(trip.end_date) : undefined,
    };

    console.log("Trip data for status calculation:", tripData);
    const status = calculateTripStatus(tripData);
    console.log("Calculated status:", status);

    return getStatusDisplayText(status);
  };

  // Get status color to match map view
  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace(" ", "");
    switch (normalizedStatus) {
      case "upcoming":
        return "bg-green-500";
      case "planning":
        return "bg-purple-600";
      case "traveling":
      case "tripcompleted": // Handle "Trip Completed" case
        return normalizedStatus === "traveling" ? "bg-blue-500" : "bg-gray-500";
      case "completed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace(" ", "");
    switch (normalizedStatus) {
      case "upcoming":
        return "default";
      case "planning":
        return "secondary";
      case "traveling":
        return "outline";
      case "completed":
      case "tripcompleted":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Get traveler count
  const getTravelerCount = () => {
    return trip.type === "solo" || !trip.is_group_trip ? 1 : memberCount + 1; // +1 for owner
  };

  // Get badge color based on role
  const getBadgeProps = () => {
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
    if (!trip.start_date) return "No dates set";

    const startDate = format(new Date(trip.start_date), "MMM d, yyyy");
    if (!trip.end_date) return startDate;

    const endDate = format(new Date(trip.end_date), "MMM d, yyyy");
    return `${startDate} - ${endDate}`;
  };

  const currentStatus = getTripStatus();

  return (
    <Card className="p-6">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{trip.name}</h2>
            <div className="flex items-center space-x-2">
              <Badge variant={getBadgeProps().variant}>
                {getBadgeProps().label}
              </Badge>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${getStatusColor(currentStatus)}`}
                ></div>
                <Badge variant={getStatusBadgeVariant(currentStatus)}>
                  {currentStatus}
                </Badge>
              </div>
            </div>
          </div>

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

            {trip.location && (
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {trip.location}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Travelers</p>
                <p className="text-sm text-muted-foreground">
                  {getTravelerCount()}{" "}
                  {getTravelerCount() === 1 ? "traveler" : "travelers"}
                </p>
              </div>
            </div>

            {trip.budget && (
              <div className="flex items-start space-x-3">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Budget</p>
                  <p className="text-sm text-muted-foreground">{trip.budget}</p>
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
        </>
      )}
    </Card>
  );
};
