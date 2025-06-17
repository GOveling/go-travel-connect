
import { useState } from "react";
import { Share, Settings, Award, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import SettingsModal from "../modals/SettingsModal";
import ShareProfileModal from "../modals/ShareProfileModal";
import { Trip } from "@/types";

interface ProfileSectionProps {
  trips: Trip[];
}

const ProfileSection = ({ trips }: ProfileSectionProps) => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Calculate stats from trips
  const completedTrips = trips.filter(trip => trip.status === 'completed');
  const totalTrips = completedTrips.length;
  const countriesVisited = [...new Set(completedTrips.map(trip => trip.destination.split(',')[0].trim()))].length;
  const upcomingTrips = trips.filter(trip => trip.status === 'upcoming' || trip.status === 'planning').length;

  return (
    <>
      <div className="space-y-6 pb-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-gradient-to-r from-purple-600 to-orange-500 text-white text-2xl font-bold">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800">John Doe</h2>
                <p className="text-gray-600">Travel Enthusiast</p>
                <div className="flex space-x-2 mt-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Explorer Level 5
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsShareModalOpen(true)}
                >
                  <Share size={16} className="mr-1" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSettingsModalOpen(true)}
                >
                  <Settings size={16} className="mr-1" />
                  Settings
                </Button>
              </div>
            </div>

            {/* Travel Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{totalTrips}</p>
                <p className="text-sm text-gray-600">Trips Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{countriesVisited}</p>
                <p className="text-sm text-gray-600">Countries Visited</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{upcomingTrips}</p>
                <p className="text-sm text-gray-600">Upcoming Trips</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Travel Achievements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Award className="text-yellow-500" size={20} />
              <span>Travel Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Award className="text-white" size={16} />
                </div>
                <div>
                  <h4 className="font-medium text-green-800">First Trip</h4>
                  <p className="text-sm text-green-600">Complete your first travel adventure</p>
                </div>
              </div>
              <Badge className="bg-green-500">Completed</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-white" size={16} />
                </div>
                <div>
                  <h4 className="font-medium text-blue-800">Travel Explorer</h4>
                  <p className="text-sm text-blue-600">Visit 5 different destinations</p>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-1">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((totalTrips / 5) * 100, 100)}%` }}></div>
                  </div>
                </div>
              </div>
              <span className="text-sm text-blue-600">{totalTrips}/5</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <MapPin className="text-white" size={16} />
                </div>
                <div>
                  <h4 className="font-medium text-purple-800">World Traveler</h4>
                  <p className="text-sm text-purple-600">Visit 10 different countries</p>
                  <div className="w-full bg-purple-200 rounded-full h-2 mt-1">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min((countriesVisited / 10) * 100, 100)}%` }}></div>
                  </div>
                </div>
              </div>
              <span className="text-sm text-purple-600">{countriesVisited}/10</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {totalTrips > 0 ? (
              <div className="space-y-3">
                {completedTrips.slice(0, 3).map((trip, index) => (
                  <div key={trip.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">{trip.image}</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{trip.name}</p>
                      <p className="text-sm text-gray-600">Completed trip to {trip.destination}</p>
                    </div>
                    <span className="text-xs text-gray-500">{trip.dates}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <TrendingUp size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No recent activity</p>
                <p className="text-xs text-gray-400">Complete your first trip to see activity here!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <ShareProfileModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </>
  );
};

export default ProfileSection;
