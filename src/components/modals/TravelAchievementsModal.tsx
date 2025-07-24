import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSupabaseGamification } from "@/hooks/useSupabaseGamification";
import LevelProgressCard from "@/components/gamification/LevelProgressCard";
import CategoryTabs from "@/components/gamification/CategoryTabs";
import AchievementBadgeCard from "@/components/gamification/AchievementBadgeCard";
import AchievementDetailModal from "@/components/gamification/AchievementDetailModal";
import { AchievementBadge } from "@/types/gamification";
import { Award, Loader2 } from "lucide-react";

interface TravelAchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TravelAchievementsModal = ({
  isOpen,
  onClose,
}: TravelAchievementsModalProps) => {
  const {
    gamificationProgress,
    getCategoryAchievements,
    getRarityColor,
    getRarityBorder,
    currentLevel,
    totalPoints,
    loading,
    error,
  } = useSupabaseGamification();

  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedAchievement, setSelectedAchievement] =
    useState<AchievementBadge | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const filteredAchievements =
    activeCategory === "all"
      ? gamificationProgress.achievements
      : getCategoryAchievements(activeCategory);

  const handleAchievementClick = (achievement: AchievementBadge) => {
    setSelectedAchievement(achievement);
    setIsDetailModalOpen(true);
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedAchievement(null);
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin" size={32} />
            <span className="ml-2">Loading achievements...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-500">Error loading achievements: {error}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Award className="text-purple-600" size={24} />
              <span>Travel Achievements</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Level Progress */}
            <LevelProgressCard level={currentLevel} totalPoints={totalPoints} />

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {
                    gamificationProgress.achievements.filter((a) => a.earned)
                      .length
                  }
                </div>
                <div className="text-sm text-blue-600">Earned</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(gamificationProgress.completionPercentage)}%
                </div>
                <div className="text-sm text-purple-600">Complete</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {totalPoints}
                </div>
                <div className="text-sm text-orange-600">Total XP</div>
              </div>
            </div>

            {/* Category Filter */}
            <CategoryTabs
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />

            {/* Achievements Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAchievements.map((achievement) => (
                <AchievementBadgeCard
                  key={achievement.id}
                  achievement={achievement}
                  onClick={handleAchievementClick}
                  rarityColor={getRarityColor(achievement.rarity)}
                  rarityBorder={getRarityBorder(achievement.rarity)}
                />
              ))}
            </div>

            {filteredAchievements.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎯</div>
                <p className="text-gray-500">
                  No achievements in this category yet
                </p>
                <p className="text-sm text-gray-400">
                  Start exploring to unlock badges!
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Achievement Detail Modal */}
      <AchievementDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleDetailModalClose}
        achievement={selectedAchievement}
        rarityColor={
          selectedAchievement ? getRarityColor(selectedAchievement.rarity) : ""
        }
      />
    </>
  );
};

export default TravelAchievementsModal;
