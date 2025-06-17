
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
  // We'll use placeholder values for user info since profiles table relation is not available
  user_name?: string;
  user_avatar?: string;
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
      const { data, error } = await supabase
        .from('place_reviews')
        .select('*')
        .eq('place_id', placeId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Add placeholder user info since we don't have profiles table relation
      const reviewsWithUserInfo = data?.map(review => ({
        ...review,
        user_name: 'Anonymous User',
        user_avatar: '👤'
      })) || [];

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
  const submitReview = async (rating: number, comment: string) => {
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
          comment: comment.trim()
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
