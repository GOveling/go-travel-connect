import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AchievementBadge } from "@/types/gamification";
import { Calendar, Users, Trophy } from "lucide-react";

interface AchievementBadgeCardProps {
  achievement: AchievementBadge;
  onClick: (achievement: AchievementBadge) => void;
  rarityColor: string;
  rarityBorder: string;
}

const AchievementBadgeCard = ({
  achievement,
  onClick,
  rarityColor,
  rarityBorder,
}: AchievementBadgeCardProps) => {
  const progressPercentage = (achievement.progress / achievement.total) * 100;

  return (
    <Card
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
        achievement.earned
          ? `${rarityBorder} bg-gradient-to-br from-green-50 to-emerald-50`
          : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={() => onClick(achievement)}
    >
      <CardContent className="p-4">
        <div className="text-center space-y-3">
          {/* Icon with glow effect for earned badges */}
          <div
            className={`relative w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl ${
              achievement.earned
                ? "bg-gradient-to-br from-yellow-100 to-orange-100 shadow-lg"
                : "bg-gray-100"
            }`}
          >
            {achievement.earned && (
              <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
            )}
            <span className={achievement.earned ? "animate-bounce" : ""}>
              {achievement.icon}
            </span>
          </div>

          {/* Title and rarity */}
          <div>
            <h4 className="font-semibold text-gray-800 text-sm mb-1">
              {achievement.title}
            </h4>
            <Badge
              variant="outline"
              className={`text-xs ${rarityColor} capitalize`}
            >
              {achievement.rarity}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-600 leading-relaxed">
            {achievement.description}
          </p>

          {/* Progress or completion info */}
          {achievement.earned ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <Trophy size={16} />
                <span className="text-sm font-medium">
                  +{achievement.points} XP
                </span>
              </div>
              {achievement.earnedDate && (
                <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                  <Calendar size={12} />
                  <span>{achievement.earnedDate}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Progress</span>
                <span>
                  {achievement.progress}/{achievement.total}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="text-xs text-purple-600 font-medium">
                {achievement.points} XP when completed
              </div>
            </div>
          )}

          {/* Total users earned (for earned badges) */}
          {achievement.earned && achievement.totalUsersEarned && (
            <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
              <Users size={12} />
              <span>
                {achievement.totalUsersEarned.toLocaleString()} travelers earned
                this
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementBadgeCard;
