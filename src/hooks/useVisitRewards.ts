import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface VisitReward {
  type: 'achievement' | 'points' | 'milestone';
  title: string;
  description: string;
  points?: number;
  achievementId?: string;
  icon: string;
}

interface CategoryStats {
  restaurants_visited: number;
  museums_visited: number;
  attractions_visited: number;
  hotels_visited: number;
  parks_visited: number;
  shops_visited: number;
  landmarks_visited: number;
  other_places_visited: number;
  places_visited: number;
  countries_visited: number;
  cities_explored: number;
}

export const useVisitRewards = () => {
  const [pendingRewards, setPendingRewards] = useState<VisitReward[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch current user stats
  const fetchUserStats = async () => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user stats:', error);
        return null;
      }

      setCategoryStats(data);
      return data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  };

  // Process rewards based on new visit
  const processVisitRewards = async (visitData: {
    placeName: string;
    category?: string;
    country?: string;
    city?: string;
  }) => {
    if (!user?.id) return;

    console.log('🏆 Processing visit rewards for:', visitData);
    
    const rewards: VisitReward[] = [];
    
    try {
      // Fetch updated stats after the visit
      const updatedStats = await fetchUserStats();
      if (!updatedStats) return;

      // Check for category-specific achievements
      if (visitData.category) {
        const categoryRewards = checkCategoryAchievements(visitData.category, updatedStats);
        rewards.push(...categoryRewards);
      }

      // Check for general milestones
      const milestoneRewards = checkGeneralMilestones(updatedStats);
      rewards.push(...milestoneRewards);

      // Check for geographic achievements
      const geoRewards = checkGeographicAchievements(updatedStats);
      rewards.push(...geoRewards);

      // Process each reward
      for (const reward of rewards) {
        if (reward.achievementId) {
          await processAchievement(reward.achievementId);
        }
        
        // Show reward notification
        toast({
          title: reward.title,
          description: reward.description,
        });
      }

      setPendingRewards(rewards);
      
    } catch (error) {
      console.error('Error processing visit rewards:', error);
    }
  };

  const checkCategoryAchievements = (category: string, stats: CategoryStats): VisitReward[] => {
    const rewards: VisitReward[] = [];
    
    switch (category.toLowerCase()) {
      case 'restaurant':
        if (stats.restaurants_visited === 1) {
          rewards.push({
            type: 'achievement',
            title: '🍽️ Primer Sabor',
            description: '¡Has visitado tu primer restaurante!',
            achievementId: 'first_restaurant',
            icon: '🍽️'
          });
        } else if (stats.restaurants_visited === 5) {
          rewards.push({
            type: 'achievement',
            title: '🍽️ Explorador Gastronómico',
            description: '¡Has visitado 5 restaurantes!',
            achievementId: 'foodie_explorer',
            icon: '🍽️'
          });
        }
        break;
        
      case 'museum':
        if (stats.museums_visited === 1) {
          rewards.push({
            type: 'achievement',
            title: '🏛️ Amante de la Cultura',
            description: '¡Has visitado tu primer museo!',
            achievementId: 'culture_lover',
            icon: '🏛️'
          });
        } else if (stats.museums_visited === 3) {
          rewards.push({
            type: 'achievement',
            title: '🏛️ Historiador Viajero',
            description: '¡Has visitado 3 museos!',
            achievementId: 'traveling_historian',
            icon: '🏛️'
          });
        }
        break;
        
      case 'tourist_attraction':
        if (stats.attractions_visited === 1) {
          rewards.push({
            type: 'achievement',
            title: '🎯 Primera Atracción',
            description: '¡Has visitado tu primera atracción turística!',
            achievementId: 'first_attraction',
            icon: '🎯'
          });
        }
        break;
        
      case 'park':
        if (stats.parks_visited === 1) {
          rewards.push({
            type: 'achievement',
            title: '🌳 Amante de la Naturaleza',
            description: '¡Has visitado tu primer parque!',
            achievementId: 'nature_lover',
            icon: '🌳'
          });
        }
        break;
    }
    
    return rewards;
  };

  const checkGeneralMilestones = (stats: CategoryStats): VisitReward[] => {
    const rewards: VisitReward[] = [];
    
    // Places visited milestones
    const placeMilestones = [1, 5, 10, 25, 50, 100];
    if (placeMilestones.includes(stats.places_visited)) {
      rewards.push({
        type: 'milestone',
        title: `🎯 ${stats.places_visited} Lugares Visitados`,
        description: `¡Has visitado ${stats.places_visited} lugares increíbles!`,
        points: stats.places_visited * 10,
        icon: '🎯'
      });
    }
    
    return rewards;
  };

  const checkGeographicAchievements = (stats: CategoryStats): VisitReward[] => {
    const rewards: VisitReward[] = [];
    
    // Countries visited achievements
    if (stats.countries_visited === 1) {
      rewards.push({
        type: 'achievement',
        title: '🌍 Primer País',
        description: '¡Has visitado tu primer país!',
        achievementId: 'first_country',
        icon: '🌍'
      });
    } else if (stats.countries_visited === 3) {
      rewards.push({
        type: 'achievement',
        title: '🌍 Explorador Internacional',
        description: '¡Has visitado 3 países!',
        achievementId: 'international_explorer',
        icon: '🌍'
      });
    }
    
    // Cities explored achievements
    if (stats.cities_explored === 1) {
      rewards.push({
        type: 'achievement',
        title: '🏙️ Primera Ciudad',
        description: '¡Has explorado tu primera ciudad!',
        achievementId: 'first_city',
        icon: '🏙️'
      });
    } else if (stats.cities_explored === 5) {
      rewards.push({
        type: 'achievement',
        title: '🏙️ Explorador Urbano',
        description: '¡Has explorado 5 ciudades!',
        achievementId: 'urban_explorer',
        icon: '🏙️'
      });
    }
    
    return rewards;
  };

  const processAchievement = async (achievementId: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase.rpc('update_achievement_progress', {
        p_user_id: user.id,
        p_achievement_id: achievementId,
        p_progress_increment: 1
      });
      
      if (error) {
        console.error('Error updating achievement:', error);
      } else {
        console.log('✅ Achievement updated:', achievementId);
      }
    } catch (error) {
      console.error('Error processing achievement:', error);
    }
  };

  // Initialize stats on mount
  useEffect(() => {
    if (user?.id) {
      fetchUserStats();
    }
  }, [user?.id]);

  return {
    processVisitRewards,
    fetchUserStats,
    categoryStats,
    pendingRewards,
    clearPendingRewards: () => setPendingRewards([]),
  };
};