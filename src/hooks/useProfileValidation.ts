import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfileData } from '@/hooks/useProfileData';

interface ProfileValidationState {
  isValid: boolean;
  requiresOnboarding: boolean;
  loading: boolean;
  error: string | null;
}

export const useProfileValidation = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfileData();
  const [state, setState] = useState<ProfileValidationState>({
    isValid: false,
    requiresOnboarding: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!user) {
      setState({
        isValid: false,
        requiresOnboarding: false,
        loading: false,
        error: 'User not authenticated'
      });
      return;
    }

    if (profileLoading) {
      setState(prev => ({ ...prev, loading: true }));
      return;
    }

    if (!profile) {
      setState({
        isValid: false,
        requiresOnboarding: true,
        loading: false,
        error: 'Profile not found'
      });
      return;
    }

    // Check if profile is complete
    const isProfileComplete = Boolean(
      profile.full_name && 
      profile.email &&
      profile.onboarding_completed
    );

    setState({
      isValid: isProfileComplete,
      requiresOnboarding: !profile.onboarding_completed,
      loading: false,
      error: null
    });
  }, [user, profile, profileLoading]);

  const validateForInvitation = () => {
    if (!user) {
      return {
        canAccept: false,
        reason: 'User not authenticated',
        requiresOnboarding: false
      };
    }

    if (!profile) {
      return {
        canAccept: false,
        reason: 'Profile not found',
        requiresOnboarding: true
      };
    }

    if (!profile.onboarding_completed) {
      return {
        canAccept: false,
        reason: 'Profile onboarding not completed',
        requiresOnboarding: true
      };
    }

    if (!profile.full_name) {
      return {
        canAccept: false,
        reason: 'Profile incomplete - missing full name',
        requiresOnboarding: true
      };
    }

    return {
      canAccept: true,
      reason: null,
      requiresOnboarding: false
    };
  };

  return {
    ...state,
    validateForInvitation,
    profile
  };
};