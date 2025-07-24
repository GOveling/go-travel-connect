import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface MyReview {
  id: string;
  user_id: string;
  place_id: string;
  place_name: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  anonymous?: boolean;
}

export const useMyReviews = () => {
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's reviews
  const fetchMyReviews = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("place_reviews")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching my reviews:", error);
      toast({
        title: "Error loading reviews",
        description: "Could not load your reviews.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update a review
  const updateReview = async (
    reviewId: string,
    updates: { rating?: number; comment?: string; anonymous?: boolean }
  ) => {
    if (!user) return false;

    try {
      console.log("Updating review with:", updates);

      const { data, error } = await supabase
        .from("place_reviews")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reviewId)
        .eq("user_id", user.id)
        .select();

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      console.log("Review updated successfully:", data);

      toast({
        title: "Review updated!",
        description: "Your review has been successfully updated.",
      });

      // Refresh reviews
      await fetchMyReviews();
      return true;
    } catch (error) {
      console.error("Error updating review:", error);
      toast({
        title: "Error updating review",
        description: "Could not update your review. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete a review
  const deleteReview = async (reviewId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("place_reviews")
        .delete()
        .eq("id", reviewId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Review deleted!",
        description: "Your review has been successfully deleted.",
      });

      // Refresh reviews
      await fetchMyReviews();
      return true;
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({
        title: "Error deleting review",
        description: "Could not delete your review. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchMyReviews();
  }, [user]);

  return {
    reviews,
    loading,
    updateReview,
    deleteReview,
    refreshReviews: fetchMyReviews,
  };
};
