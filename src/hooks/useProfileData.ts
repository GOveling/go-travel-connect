
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/types/profile";

export const useProfileData = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Profile data fetched:', data);
      
      // Si no existe perfil, crear uno automáticamente
      if (!data) {
        console.log('No profile found, creating one...');
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || null,
            description: null,
            avatar_url: null
          })
          .select()
          .single();
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
          throw insertError;
        }
        
        console.log('Profile created:', newProfile);
        setProfile(newProfile as ProfileData);
      } else {
        setProfile(data as ProfileData);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const getInitials = () => {
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const refreshProfile = () => {
    console.log('Refreshing profile data...');
    fetchProfile();
  };

  return {
    profile,
    loading,
    error,
    getInitials,
    user,
    refreshProfile
  };
};
