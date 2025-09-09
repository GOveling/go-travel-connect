import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { logSecurityEvent, isValidUser } from "@/utils/securityUtils";

export interface SecureReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  anonymous: boolean;
  reviewer_display_name: string;
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: any; // Using any for JSONB compatibility
}

export const useSecureReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<SecureReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch reviews using the secure, rate-limited function
  const fetchPlaceReviews = async (
    placeId: string,
    placeName: string,
    lat?: number,
    lng?: number,
    offset = 0,
    limit = 5
  ) => {
    if (!user?.id || !isValidUser(user.id)) {
      setError("Authentication required");
      logSecurityEvent("Unauthenticated review access attempt", { placeId });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase.rpc(
        'get_place_reviews_secure',
        {
          p_place_id: placeId,
          p_place_name: placeName,
          p_lat: lat || null,
          p_lng: lng || null,
          p_offset: offset,
          p_limit: limit
        }
      );

      if (fetchError) {
        if (fetchError.message.includes('Rate limit exceeded')) {
          logSecurityEvent("Rate limit hit - review access", { 
            userId: user.id, 
            placeId 
          });
          setError("Too many requests. Please wait before trying again.");
        } else {
          throw fetchError;
        }
        return;
      }

      setReviews(data || []);
      
      logSecurityEvent("Reviews accessed securely", { 
        userId: user.id,
        placeId,
        count: data?.length || 0
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch reviews';
      setError(errorMessage);
      logSecurityEvent("Secure review fetch error", { 
        userId: user.id, 
        placeId,
        error: errorMessage 
      });
      console.error('Error fetching secure reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get review statistics without exposing individual reviews
  const getReviewStats = async (
    placeId: string,
    placeName: string,
    lat?: number,
    lng?: number
  ): Promise<ReviewStats | null> => {
    if (!user?.id || !isValidUser(user.id)) {
      logSecurityEvent("Unauthenticated stats access attempt", { placeId });
      return null;
    }

    try {
      const { data, error: statsError } = await supabase.rpc(
        'get_place_review_stats',
        {
          p_place_id: placeId,
          p_place_name: placeName,
          p_lat: lat || null,
          p_lng: lng || null
        }
      );

      if (statsError) {
        if (statsError.message.includes('Rate limit exceeded')) {
          logSecurityEvent("Rate limit hit - stats access", { 
            userId: user.id, 
            placeId 
          });
          return null;
        }
        throw statsError;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (err: any) {
      logSecurityEvent("Review stats error", { 
        userId: user.id, 
        placeId,
        error: err.message 
      });
      console.error('Error fetching review stats:', err);
      return null;
    }
  };

  // Get review count using the secure function
  const getReviewCount = async (
    placeId: string,
    placeName: string,
    lat?: number,
    lng?: number
  ): Promise<number> => {
    if (!user?.id || !isValidUser(user.id)) {
      logSecurityEvent("Unauthenticated count access attempt", { placeId });
      return 0;
    }

    try {
      const { data, error: countError } = await supabase.rpc(
        'get_place_reviews_count',
        {
          p_place_id: placeId,
          p_place_name: placeName,
          p_lat: lat || null,
          p_lng: lng || null
        }
      );

      if (countError) {
        if (countError.message.includes('Rate limit exceeded')) {
          logSecurityEvent("Rate limit hit - count access", { 
            userId: user.id, 
            placeId 
          });
          return 0;
        }
        throw countError;
      }

      return data || 0;
    } catch (err: any) {
      logSecurityEvent("Review count error", { 
        userId: user.id, 
        placeId,
        error: err.message 
      });
      console.error('Error fetching review count:', err);
      return 0;
    }
  };

  // Create a new review with security validation
  const createReview = async (reviewData: {
    place_id: string;
    place_name: string;
    rating: number;
    comment: string;
    anonymous?: boolean;
    lat?: number;
    lng?: number;
  }): Promise<boolean> => {
    if (!user?.id || !isValidUser(user.id)) {
      logSecurityEvent("Unauthenticated review creation attempt", { 
        placeId: reviewData.place_id 
      });
      return false;
    }

    // Input validation
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      setError("Rating must be between 1 and 5");
      return false;
    }

    if (reviewData.comment.length < 10 || reviewData.comment.length > 1000) {
      setError("Comment must be between 10 and 1000 characters");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: createError } = await supabase
        .from("place_reviews")
        .insert({
          user_id: user.id,
          place_id: reviewData.place_id,
          place_name: reviewData.place_name,
          rating: reviewData.rating,
          comment: reviewData.comment.trim(),
          anonymous: reviewData.anonymous || false,
          lat: reviewData.lat || null,
          lng: reviewData.lng || null,
        });

      if (createError) {
        throw createError;
      }

      logSecurityEvent("Review created securely", { 
        userId: user.id,
        placeId: reviewData.place_id,
        rating: reviewData.rating,
        anonymous: reviewData.anonymous
      });

      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create review';
      setError(errorMessage);
      logSecurityEvent("Review creation error", { 
        userId: user.id, 
        placeId: reviewData.place_id,
        error: errorMessage 
      });
      console.error('Error creating review:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Monitor for suspicious access patterns
  const checkAccessPatterns = async () => {
    if (!user?.id || !isValidUser(user.id)) {
      return;
    }

    try {
      await supabase.rpc('monitor_review_access_patterns');
    } catch (err: any) {
      console.warn('Error monitoring access patterns:', err);
    }
  };

  // Run access pattern monitoring periodically
  useEffect(() => {
    if (user?.id) {
      const interval = setInterval(checkAccessPatterns, 300000); // Every 5 minutes
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  return {
    reviews,
    loading,
    error,
    fetchPlaceReviews,
    getReviewStats,
    getReviewCount,
    createReview,
    checkAccessPatterns
  };
};