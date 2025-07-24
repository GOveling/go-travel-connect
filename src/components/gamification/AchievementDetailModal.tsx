import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AchievementBadge } from "@/types/gamification";
import { Calendar, Users, Trophy, Target, Star } from "lucide-react";

interface AchievementDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: AchievementBadge | null;
  rarityColor: string;
}

const AchievementDetailModal = ({
  isOpen,
  onClose,
  achievement,
  rarityColor,
}: AchievementDetailModalProps) => {
  if (!achievement) return null;

  const progressPercentage = (achievement.progress / achievement.total) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Achievement Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Achievement Icon and Title */}
          <div className="text-center space-y-4">
            <div
              className={`relative w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl ${
                achievement.earned
                  ? "bg-gradient-to-br from-yellow-100 to-orange-100 shadow-xl"
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

            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {achievement.title}
              </h3>
              <Badge variant="outline" className={`${rarityColor} capitalize`}>
                <Star size={12} className="mr-1" />
                {achievement.rarity}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <div className="text-center">
            <p className="text-gray-700 mb-2">{achievement.description}</p>
            <p className="text-sm text-gray-500">{achievement.criteria}</p>
          </div>

          {/* Progress or Completion Status */}
          {achievement.earned ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 rounded-lg p-4">
                <Trophy size={20} />
                <span className="font-semibold">Completed!</span>
                <span className="font-bold">+{achievement.points} XP</span>
              </div>

              {achievement.earnedDate && (
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <Calendar size={16} />
                  <span>Earned on {achievement.earnedDate}</span>
                </div>
              )}

              {achievement.totalUsersEarned && (
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <Users size={16} />
                  <span>
                    {achievement.totalUsersEarned.toLocaleString()} travelers
                    have earned this
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Target size={16} className="text-blue-600" />
                    <span className="font-medium text-gray-700">Progress</span>
                  </div>
                  <span className="font-semibold text-gray-800">
                    {achievement.progress}/{achievement.total}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3 mb-2" />
                <div className="text-sm text-gray-600">
                  {achievement.total - achievement.progress} more to complete
                </div>
              </div>

              <div className="text-center bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 text-purple-600">
                  <Trophy size={16} />
                  <span className="font-semibold">
                    Reward: {achievement.points} XP
                  </span>
                </div>
                <p className="text-xs text-purple-500 mt-1">
                  Complete this achievement to earn experience points
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AchievementDetailModal;
