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
        // Check if this is a new signup and welcome hasn't been shown this session
        const isNewSignup = sessionStorage.getItem(`new_signup_${user.id}`);
        const welcomeShown = localStorage.getItem(`welcome_shown_${user.id}`);
        const onboardingDismissed = sessionStorage.getItem(`onboarding_dismissed_${user.id}`);
        
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

        // Check if this is a new user by comparing creation times or if no profile exists
        let isNewUser = false;
        if (!profile) {
          // No profile means new user
          isNewUser = true;
        } else if ((profile as any).created_at) {
          const profileCreatedAt = new Date((profile as any).created_at);
          const userCreatedAt = new Date(user.created_at);
          const timeDiff = Math.abs(profileCreatedAt.getTime() - userCreatedAt.getTime());
          // If profile was created within 30 seconds of user creation, it's a new user
          isNewUser = timeDiff < 30000;
        }

        // For users with invitation token, ALWAYS show complete onboarding flow first
        const hasInvitationToken = localStorage.getItem('invitation_token');
        const onboardingCompleted = (profile as any)?.onboarding_completed;
        
        // Show welcome if:
        // 1. This is a new signup (session flag OR recently created user OR no profile)
        // 2. Welcome hasn't been shown before for this user (persisted)
        // 3. OR if there's an invitation token and onboarding isn't complete (force complete flow)
        const shouldShowWelcome = ((!!isNewSignup || isNewUser || !profile) && !welcomeShown) || 
                                  (hasInvitationToken && !onboardingCompleted && !welcomeShown);

        // Show personal info modal if onboarding not completed and not dismissed for this session
        const shouldShowPersonalInfo = (!profile || !onboardingCompleted) && !shouldShowWelcome && !onboardingDismissed;

        console.log('Welcome flow check:', {
          hasProfile: !!profile,
          isNewSignup: !!isNewSignup,
          isNewUser,
          hasInvitationToken: !!hasInvitationToken,
          onboardingCompleted: onboardingCompleted,
          welcomeShown: !!welcomeShown,
          onboardingDismissed: !!onboardingDismissed,
          shouldShowWelcome,
          shouldShowPersonalInfo
        });

        // Ensure onboarding happens BEFORE processing any invitations
        if (hasInvitationToken && !onboardingCompleted) {
          console.log('User has invitation but needs complete onboarding first - prioritizing welcome flow');
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
    if (user) {
      localStorage.setItem(`welcome_shown_${user.id}`, 'true');
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

  const skipOnboardingForNow = () => {
    if (user) {
      sessionStorage.setItem(`onboarding_dismissed_${user.id}`, 'true');
    }
    setShowPersonalInfo(false);
  };

  return {
    isNewUser,
    showWelcome,
    showPersonalInfo,
    loading,
    completeWelcome,
    completeOnboarding,
    skipOnboardingForNow,
  };
};