import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface TripExpense {
  id: string;
  trip_id: string;
  description: string;
  amount: number;
  paid_by: string[];
  split_between: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

export function useSupabaseTripExpenses(tripId: string) {
  const [expenses, setExpenses] = useState<TripExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchExpenses = async () => {
    if (!tripId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("trip_expenses")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData = (data || []).map((item) => ({
        ...item,
        paid_by: Array.isArray(item.paid_by) ? (item.paid_by as string[]) : [],
        split_between: Array.isArray(item.split_between)
          ? (item.split_between as string[])
          : [],
      }));

      setExpenses(transformedData);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Error loading expenses");
    } finally {
      setLoading(false);
    }
  };

  const createExpense = async (
    expenseData: Omit<
      TripExpense,
      "id" | "created_at" | "updated_at" | "created_by"
    >
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("trip_expenses")
        .insert({
          ...expenseData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData = {
        ...data,
        paid_by: Array.isArray(data.paid_by) ? (data.paid_by as string[]) : [],
        split_between: Array.isArray(data.split_between)
          ? (data.split_between as string[])
          : [],
      };

      setExpenses((prev) => [transformedData, ...prev]);
      toast.success("Expense added successfully");
      return data;
    } catch (error) {
      console.error("Error creating expense:", error);
      toast.error("Error adding expense");
      throw error;
    }
  };

  const updateExpense = async (
    id: string,
    expenseData: Partial<TripExpense>
  ) => {
    try {
      const { data, error } = await supabase
        .from("trip_expenses")
        .update(expenseData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData = {
        ...data,
        paid_by: Array.isArray(data.paid_by) ? (data.paid_by as string[]) : [],
        split_between: Array.isArray(data.split_between)
          ? (data.split_between as string[])
          : [],
      };

      setExpenses((prev) =>
        prev.map((expense) => (expense.id === id ? transformedData : expense))
      );
      toast.success("Expense updated successfully");
      return data;
    } catch (error) {
      console.error("Error updating expense:", error);
      toast.error("Error updating expense");
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from("trip_expenses")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
      toast.success("Expense deleted successfully");
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Error deleting expense");
      throw error;
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [tripId]);

  // Subscribe to real-time changes
  useEffect(() => {
    if (!tripId) return;

    const channel = supabase
      .channel(`trip_expenses_${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trip_expenses",
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          fetchExpenses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId]);

  return {
    expenses,
    loading,
    createExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses,
  };
}
