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
      // Build query based on whether we have coordinates
      let countQuery = supabase
        .from("place_reviews")
        .select("*", { count: "exact", head: true });

      let dataQuery = supabase.from("place_reviews").select("*");

      // If we have coordinates, filter by exact location
      if (lat !== undefined && lng !== undefined) {
        const latDiff = 0.0001; // ~10 meters tolerance
        const lngDiff = 0.0001;

        countQuery = countQuery
          .gte("lat", lat - latDiff)
          .lte("lat", lat + latDiff)
          .gte("lng", lng - lngDiff)
          .lte("lng", lng + lngDiff)
          .eq("place_name", placeName);

        dataQuery = dataQuery
          .gte("lat", lat - latDiff)
          .lte("lat", lat + latDiff)
          .gte("lng", lng - lngDiff)
          .lte("lng", lng + lngDiff)
          .eq("place_name", placeName);
      } else {
        // Fallback to place_id for places without coordinates
        countQuery = countQuery.eq("place_id", placeId);
        dataQuery = dataQuery.eq("place_id", placeId);
      }

      // Get total count
      const { count } = await countQuery;
      setTotalReviews(count || 0);

      // Then fetch paginated reviews
      const from = (page - 1) * reviewsPerPage;
      const to = from + reviewsPerPage - 1;

      const { data: reviewsData, error: reviewsError } = await dataQuery
        .order("created_at", { ascending: false })
        .range(from, to);

      if (reviewsError) throw reviewsError;

      // Then fetch profiles for each review
      const reviewsWithUserInfo = await Promise.all(
        (reviewsData || []).map(async (review) => {
          let profileName = null;

          // Only fetch profile if not anonymous
          if (!review.anonymous) {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", review.user_id)
              .maybeSingle();

            profileName = profileData?.full_name;
          }

          return {
            ...review,
            user_name: review.anonymous
              ? "Anonymous User"
              : profileName || "Verified User",
            user_avatar: review.anonymous ? "👤" : "👤",
            profiles: review.anonymous ? null : { full_name: profileName },
          };
        })
      );

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
