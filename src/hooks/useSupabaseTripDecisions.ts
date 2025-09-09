import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface TripDecisionVote {
  id: string;
  decision_id: string;
  user_id: string;
  option_index: number;
  created_at: string;
}

export interface TripDecision {
  id: string;
  trip_id: string;
  title: string;
  description?: string;
  options: string[];
  end_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  selected_participants: string[];
  votes?: TripDecisionVote[];
}

export function useSupabaseTripDecisions(tripId: string) {
  const [decisions, setDecisions] = useState<TripDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDecisions = async () => {
    if (!tripId) return;

    setLoading(true);
    try {
      const { data: decisionsData, error: decisionsError } = await supabase
        .from("trip_decisions")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: false });

      if (decisionsError) throw decisionsError;

      // Fetch votes for all decisions
      const decisionIds = decisionsData?.map((d) => d.id) || [];
      let votesData: TripDecisionVote[] = [];

      if (decisionIds.length > 0) {
        const { data: votes, error: votesError } = await supabase
          .from("trip_decision_votes")
          .select("*")
          .in("decision_id", decisionIds);

        if (votesError) throw votesError;
        votesData = votes || [];
      }

      // Combine decisions with their votes and transform data
      const decisionsWithVotes =
        decisionsData?.map((decision) => ({
          ...decision,
          options: Array.isArray(decision.options)
            ? (decision.options as string[])
            : [],
          selected_participants: Array.isArray(decision.selected_participants)
            ? (decision.selected_participants as string[])
            : [],
          description: decision.description || "",
          end_date: decision.end_date || "",
          votes: votesData.filter((vote) => vote.decision_id === decision.id),
        })) || [];

      setDecisions(decisionsWithVotes);
    } catch (error) {
      console.error("Error fetching decisions:", error);
      toast.error("Error loading decisions");
    } finally {
      setLoading(false);
    }
  };

  const createDecision = async (
    decisionData: Omit<
      TripDecision,
      "id" | "created_at" | "updated_at" | "created_by" | "votes"
    >
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("trip_decisions")
        .insert({
          ...decisionData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData = {
        ...data,
        options: Array.isArray(data.options) ? (data.options as string[]) : [],
        selected_participants: Array.isArray(data.selected_participants)
          ? (data.selected_participants as string[])
          : [],
        description: data.description || "",
        end_date: data.end_date || "",
        votes: [],
      };

      setDecisions((prev) => [transformedData, ...prev]);
      toast.success("Decision created successfully");
      return transformedData;
    } catch (error) {
      console.error("Error creating decision:", error);
      toast.error("Error creating decision");
      throw error;
    }
  };

  const updateDecision = async (
    id: string,
    decisionData: Partial<TripDecision>
  ) => {
    try {
      const { data, error } = await supabase
        .from("trip_decisions")
        .update(decisionData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData = {
        ...data,
        options: Array.isArray(data.options) ? (data.options as string[]) : [],
        selected_participants: Array.isArray(data.selected_participants)
          ? (data.selected_participants as string[])
          : [],
        description: data.description || "",
        end_date: data.end_date || "",
      };

      setDecisions((prev) =>
        prev.map((decision) =>
          decision.id === id
            ? { ...transformedData, votes: decision.votes }
            : decision
        )
      );
      toast.success("Decision updated successfully");
      return data;
    } catch (error) {
      console.error("Error updating decision:", error);
      toast.error("Error updating decision");
      throw error;
    }
  };

  const deleteDecision = async (id: string) => {
    try {
      const { error } = await supabase
        .from("trip_decisions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setDecisions((prev) => prev.filter((decision) => decision.id !== id));
      toast.success("Decision deleted successfully");
    } catch (error) {
      console.error("Error deleting decision:", error);
      toast.error("Error deleting decision");
      throw error;
    }
  };

  const vote = async (decisionId: string, optionIndex: number) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("trip_decision_votes")
        .upsert({
          decision_id: decisionId,
          user_id: user.id,
          option_index: optionIndex,
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setDecisions((prev) =>
        prev.map((decision) => {
          if (decision.id === decisionId) {
            const updatedVotes =
              decision.votes?.filter((v) => v.user_id !== user.id) || [];
            updatedVotes.push(data);
            return { ...decision, votes: updatedVotes };
          }
          return decision;
        })
      );

      toast.success("Vote recorded successfully");
      return data;
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Error recording vote");
      throw error;
    }
  };

  useEffect(() => {
    fetchDecisions();
  }, [tripId]);

  // Subscribe to real-time changes
  useEffect(() => {
    if (!tripId) return;

    const decisionsChannel = supabase
      .channel(`trip_decisions_${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trip_decisions",
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          fetchDecisions();
        }
      )
      .subscribe();

    const votesChannel = supabase
      .channel(`trip_decision_votes_${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trip_decision_votes",
        },
        () => {
          fetchDecisions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(decisionsChannel);
      supabase.removeChannel(votesChannel);
    };
  }, [tripId]);

  return {
    decisions,
    loading,
    createDecision,
    updateDecision,
    deleteDecision,
    vote,
    refetch: fetchDecisions,
  };
}
