
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ActivityItem } from "@/types/profile";

export const useRecentActivity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) throw error;
        setActivities(data || []);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user]);

  const addActivity = async (activityType: string, description: string, icon: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          description,
          icon
        })
        .select()
        .single();

      if (error) throw error;
      
      setActivities(prev => [data, ...prev.slice(0, 4)]);
    } catch (err) {
      console.error('Error adding activity:', err);
    }
  };

  return {
    activities,
    loading,
    error,
    addActivity
  };
};
