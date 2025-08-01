import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export const useWelcomeFlow = () => {
  const { user } = useAuth();
  const [isNewUser, setIsNewUser] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkIfNewUser = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Check if user has completed onboarding
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, onboarding_completed, created_at')
          .eq('id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking user profile:', error);
          setLoading(false);
          return;
        }

        // If no profile exists or onboarding not completed, treat as new user
        const userIsNew = !profile || !(profile as any).onboarding_completed;
        
        // Also check if user was created recently (within last 5 minutes)
        const recentlyCreated = (profile as any)?.created_at 
          ? (Date.now() - new Date((profile as any).created_at).getTime()) < 5 * 60 * 1000
          : false;

        const shouldShowWelcome = userIsNew || recentlyCreated;

        setIsNewUser(shouldShowWelcome);
        setShowWelcome(shouldShowWelcome);
        setLoading(false);
      } catch (error) {
        console.error('Error in welcome flow check:', error);
        setLoading(false);
      }
    };

    checkIfNewUser();
  }, [user]);

  const completeWelcome = () => {
    setShowWelcome(false);
    setShowPersonalInfo(true);
  };

  const completeOnboarding = async () => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true } as any)
        .eq('id', user.id);

      setShowPersonalInfo(false);
      setIsNewUser(false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  return {
    isNewUser,
    showWelcome,
    showPersonalInfo,
    loading,
    completeWelcome,
    completeOnboarding,
  };
};