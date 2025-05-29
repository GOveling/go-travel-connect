
import { useState } from "react";
import { Award, MapPin, Calendar, Star, Trophy, Medal, Target } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TravelAchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TravelAchievementsModal = ({ isOpen, onClose }: TravelAchievementsModalProps) => {
  const achievements = [
    {
      id: 1,
      title: "City Explorer",
      description: "Visit 5 different cities",
      icon: MapPin,
      earned: true,
      progress: 5,
      total: 5,
      earnedDate: "Dec 15, 2024",
      points: 100
    },
    {
      id: 2,
      title: "Culture Enthusiast", 
      description: "Visit 10 museums or cultural sites",
      icon: Star,
      earned: true,
      progress: 12,
      total: 10,
      earnedDate: "Nov 20, 2024",
      points: 150
    },
    {
      id: 3,
      title: "World Traveler",
      description: "Visit 10 different countries",
      icon: Trophy,
      earned: false,
      progress: 8,
      total: 10,
      points: 500
    },
    {
      id: 4,
      title: "Adventure Seeker",
      description: "Complete 3 adventure activities",
      icon: Medal,
      earned: false,
      progress: 1,
      total: 3,
      points: 200
    }
  ];

  const totalPoints = achievements.filter(a => a.earned).reduce((sum, a) => sum + a.points, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Award className="text-purple-600" size={24} />
            <span>Travel Achievements</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Points Summary */}
          <Card className="bg-gradient-to-r from-purple-50 to-orange-50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Trophy className="text-yellow-500" size={20} />
                <span className="font-semibold text-lg">{totalPoints} Points</span>
              </div>
              <p className="text-sm text-gray-600">Total Achievement Points</p>
            </CardContent>
          </Card>

          {/* Achievements List */}
          <div className="space-y-3">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              const progressPercentage = (achievement.progress / achievement.total) * 100;
              
              return (
                <Card key={achievement.id} className={`${achievement.earned ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        achievement.earned ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Icon size={20} className={achievement.earned ? 'text-green-600' : 'text-gray-500'} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-800 truncate">{achievement.title}</h4>
                          {achievement.earned && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 shrink-0">
                              <Trophy size={12} className="mr-1" />
                              {achievement.points}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        
                        {achievement.earned ? (
                          <div className="flex items-center space-x-2 text-sm text-green-600">
                            <Calendar size={14} />
                            <span>Earned {achievement.earnedDate}</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">{achievement.progress}/{achievement.total}</span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Next Goals */}
          <Card className="border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Target className="text-purple-600" size={16} />
                <h4 className="font-medium text-gray-800">Next Goals</h4>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>2 more countries to unlock World Traveler</span>
                  <span className="text-purple-600 font-medium">500 pts</span>
                </div>
                <div className="flex justify-between">
                  <span>2 more adventures to unlock Adventure Seeker</span>
                  <span className="text-purple-600 font-medium">200 pts</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TravelAchievementsModal;
