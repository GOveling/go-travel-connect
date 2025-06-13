
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TravelerLevel } from "@/types/gamification";
import { Trophy, Star } from "lucide-react";

interface LevelProgressCardProps {
  level: TravelerLevel;
  totalPoints: number;
}

const LevelProgressCard = ({ level, totalPoints }: LevelProgressCardProps) => {
  const progressPercentage = (level.currentXP / level.nextLevelXP) * 100;
  const isMaxLevel = level.level === 20;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className={`bg-gradient-to-r ${level.color} p-6 text-white relative overflow-hidden`}>
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-4 text-6xl">{level.icon}</div>
            <div className="absolute bottom-4 left-4 text-4xl">🌟</div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm">
                  {level.icon}
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Trophy size={20} />
                    <span className="text-xl font-bold">Level {level.level}</span>
                  </div>
                  <h3 className="text-lg font-semibold">{level.title}</h3>
                </div>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Star size={14} className="mr-1" />
                {totalPoints} XP
              </Badge>
            </div>

            {!isMaxLevel && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm opacity-90">
                  <span>Progress to Next Level</span>
                  <span>{level.currentXP} / {level.nextLevelXP} XP</span>
                </div>
                <Progress 
                  value={progressPercentage} 
                  className="h-3 bg-white/20"
                />
                <div className="text-sm opacity-90">
                  {level.nextLevelXP - level.currentXP} XP needed for {level.level < 20 ? `Level ${level.level + 1}` : 'Max Level'}
                </div>
              </div>
            )}

            {isMaxLevel && (
              <div className="text-center">
                <div className="text-2xl mb-2">🏆</div>
                <div className="text-lg font-semibold">Maximum Level Reached!</div>
                <div className="text-sm opacity-90">You are a Legendary Traveler</div>
              </div>
            )}
          </div>
        </div>

        {/* Unlocked Features */}
        <div className="p-4">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Unlocked Features
          </h4>
          <div className="flex flex-wrap gap-2">
            {level.unlockedFeatures.map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LevelProgressCard;
