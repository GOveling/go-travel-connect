import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  user_id: string;
  place_id: string;
  place_name: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  anonymous?: boolean;
  user_name?: string;
  user_avatar?: string;
  profiles?: {
    full_name: string | null;
  } | null;
}

export const usePlaceReviews = (placeId: string, placeName: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch reviews for a specific place
  const fetchReviews = async () => {
    if (!placeId) return;
    
    setLoading(true);
    try {
      // First fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('place_reviews')
        .select('*')
        .eq('place_id', placeId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Then fetch profiles for each review
      const reviewsWithUserInfo = await Promise.all(
        (reviewsData || []).map(async (review) => {
          let profileName = null;
          
          // Only fetch profile if not anonymous
          if (!review.anonymous) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', review.user_id)
              .maybeSingle();
            
            profileName = profileData?.full_name;
          }

          return {
            ...review,
            user_name: review.anonymous ? 'Anonymous User' : (profileName || 'Verified User'),
            user_avatar: review.anonymous ? '👤' : '👤',
            profiles: review.anonymous ? null : { full_name: profileName }
          };
        })
      );

      setReviews(reviewsWithUserInfo);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error loading reviews",
        description: "Could not load reviews for this place.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit a new review
  const submitReview = async (rating: number, comment: string, anonymous: boolean = false) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to write a review.",
        variant: "destructive",
      });
      return false;
    }

    if (!rating || !comment.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a rating and comment.",
        variant: "destructive",
      });
      return false;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('place_reviews')
        .insert({
          user_id: user.id,
          place_id: placeId,
          place_name: placeName,
          rating,
          comment: comment.trim(),
          anonymous
        });

      if (error) throw error;

      toast({
        title: "Review submitted!",
        description: "Thank you for sharing your experience.",
      });

      // Refresh reviews to show the new one
      await fetchReviews();
      return true;
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error submitting review",
        description: "Could not save your review. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [placeId]);

  return {
    reviews,
    loading,
    submitting,
    submitReview,
    refreshReviews: fetchReviews
  };
};
