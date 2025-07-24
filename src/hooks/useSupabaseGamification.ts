import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  TravelerLevel,
  AchievementBadge,
  GamificationProgress,
} from "@/types/gamification";
import { TRAVELER_LEVELS } from "@/data/gamificationData";

export const useSupabaseGamification = () => {
  const { user } = useAuth();
  const [currentLevel, setCurrentLevel] = useState<TravelerLevel>(
    TRAVELER_LEVELS[0]
  );
  const [achievements, setAchievements] = useState<AchievementBadge[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user achievements and progress from Supabase
  useEffect(() => {
    const fetchUserAchievements = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Get user stats for total points
        const { data: userStats, error: statsError } = await supabase
          .from("user_stats")
          .select("achievement_points")
          .eq("user_id", user.id)
          .maybeSingle();

        if (statsError) throw statsError;

        const points = userStats?.achievement_points || 0;
        setTotalPoints(points);

        // Get achievements with user progress using the database function
        const { data: achievementsData, error: achievementsError } =
          await supabase.rpc("get_user_achievements_with_progress", {
            p_user_id: user.id,
          });

        if (achievementsError) throw achievementsError;

        // Transform data to match our types
        const transformedAchievements: AchievementBadge[] =
          achievementsData?.map((item: any) => ({
            id: item.achievement_id,
            title: item.title,
            description: item.description,
            category: item.category as any,
            icon: item.icon,
            earned: item.is_completed,
            progress: item.current_progress,
            total: item.total_required,
            points: item.points,
            earnedDate: item.completed_at
              ? new Date(item.completed_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : undefined,
            rarity: item.rarity as "common" | "rare" | "epic" | "legendary",
            criteria: item.criteria,
          })) || [];

        setAchievements(transformedAchievements);
      } catch (err) {
        console.error("Error fetching achievements:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch achievements"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserAchievements();
  }, [user]);

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

  const earnedAchievements = achievements.filter((a) => a.earned);
  const completionPercentage =
    achievements.length > 0
      ? (earnedAchievements.length / achievements.length) * 100
      : 0;

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

  // Function to update achievement progress
  const updateAchievementProgress = async (
    achievementId: string,
    increment: number = 1
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc("update_achievement_progress", {
        p_user_id: user.id,
        p_achievement_id: achievementId,
        p_progress_increment: increment,
      });

      if (error) throw error;

      // Refetch achievements to get updated progress
      const { data: achievementsData, error: achievementsError } =
        await supabase.rpc("get_user_achievements_with_progress", {
          p_user_id: user.id,
        });

      if (achievementsError) throw achievementsError;

      // Update achievements state
      const transformedAchievements: AchievementBadge[] =
        achievementsData?.map((item: any) => ({
          id: item.achievement_id,
          title: item.title,
          description: item.description,
          category: item.category as any,
          icon: item.icon,
          earned: item.is_completed,
          progress: item.current_progress,
          total: item.total_required,
          points: item.points,
          earnedDate: item.completed_at
            ? new Date(item.completed_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : undefined,
          rarity: item.rarity as "common" | "rare" | "epic" | "legendary",
          criteria: item.criteria,
        })) || [];

      setAchievements(transformedAchievements);

      // Update total points
      const { data: userStats } = await supabase
        .from("user_stats")
        .select("achievement_points")
        .eq("user_id", user.id)
        .maybeSingle();

      if (userStats) {
        setTotalPoints(userStats.achievement_points || 0);
      }
    } catch (err) {
      console.error("Error updating achievement progress:", err);
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
    loading,
    error,
    updateAchievementProgress,
  };
};
