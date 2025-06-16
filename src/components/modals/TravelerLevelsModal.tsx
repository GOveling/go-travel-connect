
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Star, Crown } from "lucide-react";
import { TRAVELER_LEVELS } from "@/data/gamificationData";
import { TravelerLevel } from "@/types/gamification";

interface TravelerLevelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: TravelerLevel;
  totalPoints: number;
}

const TravelerLevelsModal = ({ isOpen, onClose, currentLevel, totalPoints }: TravelerLevelsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Trophy className="text-yellow-600" size={24} />
            <span>Traveler Levels</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Progress Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                    {currentLevel.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Current Level</h3>
                    <p className="text-sm text-gray-600">
                      Level {currentLevel.level} - {currentLevel.title}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  <Star size={14} className="mr-1" />
                  {totalPoints} XP
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* All Levels List */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 pr-4">
              {TRAVELER_LEVELS.map((level) => {
                const isCurrentLevel = level.level === currentLevel.level;
                const isUnlocked = totalPoints >= level.requiredXP;
                const isMaxLevel = level.level === 20;
                
                return (
                  <Card 
                    key={level.level} 
                    className={`transition-all ${
                      isCurrentLevel 
                        ? 'ring-2 ring-blue-500 shadow-md' 
                        : isUnlocked 
                          ? 'border-green-200 bg-green-50/30' 
                          : 'border-gray-200 bg-gray-50/30'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                          isCurrentLevel 
                            ? 'bg-blue-100 ring-2 ring-blue-300' 
                            : isUnlocked 
                              ? 'bg-green-100' 
                              : 'bg-gray-100'
                        }`}>
                          {level.icon}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className={`font-semibold ${
                              isCurrentLevel ? 'text-blue-700' : isUnlocked ? 'text-green-700' : 'text-gray-600'
                            }`}>
                              Level {level.level} - {level.title}
                            </h4>
                            {isCurrentLevel && (
                              <Badge variant="default" className="bg-blue-100 text-blue-700 text-xs">
                                Current
                              </Badge>
                            )}
                            {isMaxLevel && (
                              <Crown size={16} className="text-yellow-500" />
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className={`text-sm ${
                                isUnlocked ? 'text-gray-600' : 'text-gray-500'
                              }`}>
                                {isMaxLevel ? 'Maximum Level' : `${level.requiredXP.toLocaleString()} XP required`}
                              </p>
                              
                              {/* Unlocked Features Preview */}
                              <div className="flex flex-wrap gap-1">
                                {level.unlockedFeatures.slice(0, 2).map((feature, index) => (
                                  <Badge 
                                    key={index} 
                                    variant="outline" 
                                    className={`text-xs ${
                                      isUnlocked ? 'border-green-300 text-green-700' : 'border-gray-300 text-gray-500'
                                    }`}
                                  >
                                    {feature}
                                  </Badge>
                                ))}
                                {level.unlockedFeatures.length > 2 && (
                                  <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                                    +{level.unlockedFeatures.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              {!isMaxLevel && (
                                <p className={`text-xs ${
                                  isUnlocked ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                  {isUnlocked ? '✓ Unlocked' : `${(level.requiredXP - totalPoints).toLocaleString()} XP to go`}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>

          {/* Footer Info */}
          <div className="text-center text-sm text-gray-500 border-t pt-4">
            <p>Earn XP by visiting places, completing trips, and engaging with the community</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TravelerLevelsModal;
