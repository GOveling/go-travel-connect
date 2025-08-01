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
    const checkWelcomeFlow = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Check if there's a pending invitation to prioritize onboarding flow
        const hasInvitationToken = localStorage.getItem('invitation_token');
        
        // Check if this is a new signup and welcome hasn't been shown this session
        const isNewSignup = sessionStorage.getItem(`new_signup_${user.id}`);
        const welcomeShownThisSession = sessionStorage.getItem(`welcome_shown_${user.id}`);
        
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

        // Check if this is a new user by comparing creation times
        let isNewUser = false;
        if (profile && (profile as any).created_at) {
          const profileCreatedAt = new Date((profile as any).created_at);
          const userCreatedAt = new Date(user.created_at);
          const timeDiff = Math.abs(profileCreatedAt.getTime() - userCreatedAt.getTime());
          // If profile was created within 30 seconds of user creation, it's a new user
          isNewUser = timeDiff < 30000;
        }

        // Show welcome if:
        // 1. This is a new signup (session flag OR recently created user)
        // 2. Welcome hasn't been shown this session
        const shouldShowWelcome = (!!isNewSignup || isNewUser) && !welcomeShownThisSession;

        // Show personal info modal if onboarding not completed
        const shouldShowPersonalInfo = !profile || !(profile as any).onboarding_completed;

        console.log('Welcome flow check:', {
          hasProfile: !!profile,
          isNewSignup: !!isNewSignup,
          isNewUser,
          hasInvitationToken: !!hasInvitationToken,
          onboardingCompleted: (profile as any)?.onboarding_completed,
          welcomeShownThisSession: !!welcomeShownThisSession,
          shouldShowWelcome,
          shouldShowPersonalInfo
        });

        // Ensure onboarding happens BEFORE processing any invitations
        if (hasInvitationToken && shouldShowPersonalInfo) {
          console.log('User has invitation but needs onboarding first - prioritizing welcome flow');
        }

        setIsNewUser(shouldShowWelcome);
        setShowWelcome(shouldShowWelcome);
        setShowPersonalInfo(shouldShowPersonalInfo && !shouldShowWelcome); // Don't show both at once
        setLoading(false);
      } catch (error) {
        console.error('Error in welcome flow check:', error);
        setLoading(false);
      }
    };

    checkWelcomeFlow();
  }, [user]);

  const completeWelcome = () => {
    // Mark welcome as shown for this session
    if (user) {
      sessionStorage.setItem(`welcome_shown_${user.id}`, 'true');
    }
    setShowWelcome(false);
    setShowPersonalInfo(true);
  };

  const completeOnboarding = async () => {
    if (!user) return;

    try {
      // Update or insert the profile with onboarding completed
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          email: user.email,
          onboarding_completed: true 
        } as any);

      if (upsertError) {
        console.error('Error completing onboarding:', upsertError);
        return;
      }

      setShowPersonalInfo(false);
      setIsNewUser(false);
      
      console.log('Onboarding completed successfully');
      
      // Check if there's a pending invitation to process after onboarding
      const invitationToken = localStorage.getItem('invitation_token');
      if (invitationToken) {
        console.log('Onboarding complete, invitation will now appear in notifications');
      }
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