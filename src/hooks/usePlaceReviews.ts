import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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

export const usePlaceReviews = (
  placeId: string,
  placeName: string,
  lat?: number,
  lng?: number
) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const reviewsPerPage = 5;

  // Fetch reviews for a specific place with pagination
  const fetchReviews = async (page = 1) => {
    if (!placeId) return;

    setLoading(true);
    try {
      // Compute filters and call secure RPCs instead of direct table reads
      const hasCoords = lat !== undefined && lng !== undefined;

      // Get total count via RPC
      const { data: countData, error: countError } = await supabase.rpc(
        "get_place_reviews_count",
        {
          p_place_id: placeId,
          p_place_name: placeName,
          p_lat: hasCoords ? lat : null,
          p_lng: hasCoords ? lng : null,
        }
      );
      if (countError) throw countError;
      setTotalReviews((countData as number) || 0);

      // Then fetch paginated reviews via RPC
      const from = (page - 1) * reviewsPerPage;
      const { data: reviewsData, error: reviewsError } = await supabase.rpc(
        "get_place_reviews_public",
        {
          p_place_id: placeId,
          p_place_name: placeName,
          p_lat: hasCoords ? lat : null,
          p_lng: hasCoords ? lng : null,
          p_offset: from,
          p_limit: reviewsPerPage,
        }
      );

      if (reviewsError) throw reviewsError;

      // Build a map of user_id -> safe profile fields
      const nonAnonymousIds = Array.from(
        new Set((reviewsData || []).filter((r: any) => !r.anonymous).map((r: any) => r.user_id))
      ) as string[];

      let profilesById = new Map<string, { id: string; full_name: string | null; avatar_url: string | null }>();
      if (nonAnonymousIds.length > 0 && user) {
        const { data: safeProfiles, error: profilesError } = await supabase
          .rpc("get_users_public_profile_min", { p_user_ids: nonAnonymousIds });

        if (profilesError) {
          console.error("Error fetching public profiles:", profilesError);
        } else {
          profilesById = new Map((safeProfiles || []).map((p: any) => [p.id, p]));
        }
      }

      // Enrich reviews with user info without exposing sensitive data
      const reviewsWithUserInfo = (reviewsData || []).map((review: any) => {
        const profile = review.anonymous ? null : profilesById.get(review.user_id as string);
        const profileName = profile?.full_name || null;

        return {
          ...review,
          user_name: review.anonymous ? "Anonymous User" : profileName || "Verified User",
          user_avatar: review.anonymous ? "👤" : "👤",
          profiles: review.anonymous ? null : { full_name: profileName },
        };
      });

      setReviews(reviewsWithUserInfo);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching reviews:", error);
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
  const submitReview = async (
    rating: number,
    comment: string,
    anonymous: boolean = false
  ) => {
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
      const { error } = await supabase.from("place_reviews").insert({
        user_id: user.id,
        place_id: placeId,
        place_name: placeName,
        rating,
        comment: comment.trim(),
        anonymous,
        lat: lat || null,
        lng: lng || null,
      });

      if (error) throw error;

      toast({
        title: "Review submitted!",
        description: "Thank you for sharing your experience.",
      });

      // Refresh reviews to show the new one
      await fetchReviews(1);
      return true;
    } catch (error) {
      console.error("Error submitting review:", error);
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

  // Navigation functions
  const goToPage = (page: number) => {
    fetchReviews(page);
  };

  const nextPage = () => {
    if (currentPage < Math.ceil(totalReviews / reviewsPerPage)) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, [placeId]);

  return {
    reviews,
    loading,
    submitting,
    currentPage,
    totalReviews,
    reviewsPerPage,
    totalPages: Math.ceil(totalReviews / reviewsPerPage),
    submitReview,
    refreshReviews: () => fetchReviews(currentPage),
    goToPage,
    nextPage,
    prevPage,
  };
};
