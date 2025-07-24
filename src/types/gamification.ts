export interface TravelerLevel {
  level: number;
  title: string;
  requiredXP: number;
  currentXP: number;
  nextLevelXP: number;
  unlockedFeatures: string[];
  color: string;
  icon: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  earned: boolean;
  progress: number;
  total: number;
  points: number;
  earnedDate?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  totalUsersEarned?: number;
  criteria: string;
}

export type AchievementCategory =
  | "global-exploration"
  | "local-discoveries"
  | "food-nightlife"
  | "family-experience"
  | "contributions"
  | "special"
  | "publications"
  | "social";

export interface GamificationProgress {
  level: TravelerLevel;
  achievements: AchievementBadge[];
  totalPoints: number;
  completionPercentage: number;
  nextMilestone: AchievementBadge | null;
}
