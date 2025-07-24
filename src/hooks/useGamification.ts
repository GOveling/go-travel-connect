import { useState, useEffect } from "react";
import {
  TravelerLevel,
  AchievementBadge,
  GamificationProgress,
} from "@/types/gamification";
import { TRAVELER_LEVELS, ACHIEVEMENT_BADGES } from "@/data/gamificationData";

export const useGamification = () => {
  const [currentLevel, setCurrentLevel] = useState<TravelerLevel>(
    TRAVELER_LEVELS[0]
  );
  const [achievements, setAchievements] =
    useState<AchievementBadge[]>(ACHIEVEMENT_BADGES);
  const [totalPoints, setTotalPoints] = useState(1250); // Mock current points

  // Calculate current level based on points
  useEffect(() => {
    const level = TRAVELER_LEVELS.reduce((prev, current) => {
      if (totalPoints >= current.requiredXP) {
        return current;
      }
      return prev;
    });

    const currentXP = totalPoints - level.requiredXP;
    const nextLevel = TRAVELER_LEVELS[level.level] || level;
    const nextLevelXP = nextLevel.requiredXP - level.requiredXP;

    setCurrentLevel({
      ...level,
      currentXP,
      nextLevelXP,
    });
  }, [totalPoints]);

  // Mock some earned achievements based on current level
  useEffect(() => {
    const earnedAchievements = achievements.map((achievement) => {
      // Mock earning some achievements based on level
      if (currentLevel.level >= 2 && achievement.id === "first-country") {
        return {
          ...achievement,
          earned: true,
          progress: 1,
          earnedDate: "Dec 15, 2024",
        };
      }
      if (currentLevel.level >= 3 && achievement.id === "city-explorer") {
        return {
          ...achievement,
          earned: true,
          progress: 5,
          earnedDate: "Nov 20, 2024",
        };
      }
      if (currentLevel.level >= 4 && achievement.id === "foodie") {
        return {
          ...achievement,
          earned: true,
          progress: 20,
          earnedDate: "Oct 30, 2024",
        };
      }
      return achievement;
    });

    setAchievements(earnedAchievements);
  }, [currentLevel.level]);

  const earnedAchievements = achievements.filter((a) => a.earned);
  const completionPercentage =
    (earnedAchievements.length / achievements.length) * 100;

  const nextMilestone =
    achievements
      .filter((a) => !a.earned)
      .sort((a, b) => a.progress / a.total - b.progress / b.total)[0] || null;

  const gamificationProgress: GamificationProgress = {
    level: currentLevel,
    achievements,
    totalPoints,
    completionPercentage,
    nextMilestone,
  };

  const getCategoryAchievements = (category: string) => {
    return achievements.filter((a) => a.category === category);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-600";
      case "rare":
        return "text-blue-600";
      case "epic":
        return "text-purple-600";
      case "legendary":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "border-gray-200";
      case "rare":
        return "border-blue-200";
      case "epic":
        return "border-purple-200";
      case "legendary":
        return "border-yellow-200";
      default:
        return "border-gray-200";
    }
  };

  return {
    gamificationProgress,
    getCategoryAchievements,
    getRarityColor,
    getRarityBorder,
    currentLevel,
    achievements,
    totalPoints,
    earnedAchievements,
  };
};
