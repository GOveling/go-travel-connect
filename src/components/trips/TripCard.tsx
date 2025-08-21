import {
  Calendar,
  MapPin,
  Users,
  UserPlus,
  Share2,
  Edit3,
  Route,
  Heart,
  MoreHorizontal,
  Eye,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getFormattedDateRange } from "@/utils/dateHelpers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import type { Trip, TripCardProps } from "@/types";

const TripCard = ({
  trip,
  onViewDetails,
  onEditTrip,
  onInviteFriends,
  onGroupOptions,
  onAISmartRoute,
  onViewSavedPlaces,
  onDeleteTrip,
}: TripCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-green-100 text-green-800";
      case "planning":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate total travelers for group trips
  const getTotalTravelers = () => {
    if (trip.isGroupTrip && trip.collaborators) {
      // For group trips, count collaborators + 1 (the user)
      return trip.collaborators.length + 1;
    }
    // For solo trips, use the original travelers count
    return trip.travelers;
  };

  const totalTravelers = getTotalTravelers();

  // Extract countries from destination (now a JSON array)
  const getCountriesFromDestination = (destination: string | string[]) => {
    try {
      if (Array.isArray(destination)) {
        return destination.filter(
          (country) => country && country !== "Unknown"
        );
      }
      if (typeof destination === "string") {
        // Try to parse as JSON first
        try {
          const parsed = JSON.parse(destination);
          if (Array.isArray(parsed)) {
            return parsed.filter((country) => country && country !== "Unknown");
          }
        } catch {
          // Fallback to old string format
          const parts = destination.split(",").map((part) => part.trim());
          return [parts[parts.length - 1]]; // Last part is usually the country
        }
      }
      return [];
    } catch {
      return [];
    }
  };

  // Get country flag emoji
  const getCountryFlag = (country: string) => {
    const countryFlags: { [key: string]: string } = {
      Spain: "🇪🇸",
      France: "🇫🇷",
      Italy: "🇮🇹",
      Germany: "🇩🇪",
      "United Kingdom": "🇬🇧",
      "United States": "🇺🇸",
      Japan: "🇯🇵",
      Brazil: "🇧🇷",
      Mexico: "🇲🇽",
      Canada: "🇨🇦",
      Australia: "🇦🇺",
      Argentina: "🇦🇷",
      Thailand: "🇹🇭",
      Greece: "🇬🇷",
      Portugal: "🇵🇹",
      Netherlands: "🇳🇱",
      Switzerland: "🇨🇭",
      Austria: "🇦🇹",
      Belgium: "🇧🇪",
      Norway: "🇳🇴",
      Sweden: "🇸🇪",
      Denmark: "🇩🇰",
      Finland: "🇫🇮",
      Poland: "🇵🇱",
      Turkey: "🇹🇷",
      Egypt: "🇪🇬",
      Morocco: "🇲🇦",
      "South Africa": "🇿🇦",
      India: "🇮🇳",
      China: "🇨🇳",
      "South Korea": "🇰🇷",
      Russia: "🇷🇺",
    };
    return countryFlags[country] || "🌍";
  };

  const [countryImage, setCountryImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const countries = getCountriesFromDestination(trip.destination);
  const firstCountry = countries[0] || "Unknown";
  const countryFlag = getCountryFlag(firstCountry);

  // Fetch country image from Supabase
  useEffect(() => {
    const fetchCountryImage = async () => {
      if (firstCountry && firstCountry !== "Unknown") {
        try {
          const { data, error } = await supabase
            .from('countries')
            .select('image_url')
            .eq('country_name', firstCountry)
            .single();

          if (data && data.image_url) {
            setCountryImage(data.image_url);
          }
        } catch (error) {
          console.log('Country image not found:', firstCountry);
        }
      }
      setLoading(false);
    };

    fetchCountryImage();
  }, [firstCountry]);

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Trip Image/Icon */}
          <div className="w-full md:w-32 h-32 md:h-auto relative overflow-hidden">
            {countryImage ? (
              <img 
                src={countryImage} 
                alt={`${firstCountry} destination`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center">
                <span className="text-4xl md:text-5xl">{trip.image}</span>
              </div>
            )}
          </div>

          {/* Trip Content */}
          <div className="flex-1 p-4 md:p-6">
            <div className="space-y-3 md:space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 truncate">
                      {trip.name}
                    </h3>
                    <Badge
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(trip.status)}`}
                    >
                      {trip.status}
                    </Badge>
                    {(trip.isGroupTrip || (trip.collaborators && trip.collaborators.length > 0)) && (
                      <Button
                        onClick={() => onGroupOptions(trip)}
                        className="flex items-center space-x-1 bg-purple-100 hover:bg-purple-200 px-2 py-1 rounded-full h-auto"
                        variant="ghost"
                      >
                        <Users size={12} className="text-purple-600" />
                        <span className="text-xs text-purple-600 font-medium">
                          Group
                        </span>
                      </Button>
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                      <MapPin size={14} />
                      {countries.length > 0 ? (
                        countries.map((country, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                          >
                            <span className="mr-1">
                              {getCountryFlag(country)}
                            </span>
                            {country}
                          </Badge>
                        ))
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                        >
                          <span className="mr-1">🌍</span>
                          No destinations
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} />
                      <span>{getFormattedDateRange(trip.startDate, trip.endDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users size={14} />
                      <span>
                        {totalTravelers} traveler{totalTravelers > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onViewDetails(trip)}>
                      <Eye size={14} className="mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditTrip(trip)}>
                      <Edit3 size={14} className="mr-2" />
                      Edit Trip
                    </DropdownMenuItem>
                    {trip.isGroupTrip ? (
                      <>
                        <DropdownMenuItem onClick={() => onGroupOptions(trip)}>
                          <Users size={14} className="mr-2" />
                          Group Options
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onInviteFriends(trip)}>
                          <UserPlus size={14} className="mr-2" />
                          Manage Team
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem onClick={() => onInviteFriends(trip)}>
                        <UserPlus size={14} className="mr-2" />
                        Add Collaborators
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <Share2 size={14} className="mr-2" />
                      Share Trip
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteTrip && onDeleteTrip(trip)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Delete Trip
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Collaborators Preview */}
              {trip.isGroupTrip &&
                trip.collaborators &&
                trip.collaborators.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Team:</span>
                    <div className="flex -space-x-1">
                      {trip.collaborators.slice(0, 3).map((collaborator) => (
                        <div
                          key={collaborator.id}
                          className="w-6 h-6 bg-gradient-to-br from-purple-500 to-orange-500 rounded-full flex items-center justify-center text-xs text-white font-medium border-2 border-white"
                          title={collaborator.name}
                        >
                          {collaborator.avatar}
                        </div>
                      ))}
                      {trip.collaborators.length > 3 && (
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600 border-2 border-white">
                          +{trip.collaborators.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Action Buttons - Now showing three buttons instead of four */}
              <div className="pt-2 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-sm"
                    onClick={() => onViewDetails(trip)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 text-sm"
                    onClick={() => onViewSavedPlaces(trip)}
                  >
                    <Heart size={14} className="mr-1" />
                    Saved Places
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 text-sm"
                    onClick={() => onAISmartRoute(trip)}
                  >
                    <Route size={14} className="mr-1" />
                    AI Smart Route
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripCard;
