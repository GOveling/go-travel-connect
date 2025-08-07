// Supabase Edge Function: auth-user-deletion-cleanup
// Purpose: Cleanup all user-related data BEFORE a user is deleted (Auth Hook)
// This function validates a shared secret and deletes all dependent records
// so the auth user deletion can proceed without FK/RLS issues.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-auth-secret",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const AUTH_HOOK_SECRET = Deno.env.get("AUTH_HOOK_SECRET");

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing Supabase credentials" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Validate shared secret from Auth Hook
  const incomingSecret = req.headers.get("x-auth-secret") ?? req.headers.get("X-Auth-Secret");
  if (!AUTH_HOOK_SECRET || !incomingSecret || incomingSecret !== AUTH_HOOK_SECRET) {
    return new Response(
      JSON.stringify({ error: "Unauthorized - invalid secret" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Invalid JSON payload" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Supabase Auth Hook payload typically contains a `user` object
  const userId: string | undefined = payload?.user?.id ?? payload?.record?.id;
  const userEmail: string | undefined = payload?.user?.email ?? payload?.record?.email;

  if (!userId) {
    return new Response(
      JSON.stringify({ error: "Missing user id in hook payload" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      // Service role should bypass RLS; no session persistence required
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Helpers
  const chunk = <T,>(arr: T[], size = 1000): T[][] => {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  const deleteInBatches = async (
    table: string,
    col: string,
    values: (string | number)[],
  ) => {
    if (!values.length) return;
    for (const part of chunk(values, 1000)) {
      const { error } = await adminClient.from(table).delete().in(col, part);
      if (error) throw new Error(`${table} delete failed: ${error.message}`);
    }
  };

  try {
    console.log("[auth-user-deletion-cleanup] Starting cleanup for:", { userId, userEmail });

    // 1) Collect all user's trip ids
    const { data: trips, error: tripsErr } = await adminClient
      .from("trips")
      .select("id")
      .eq("user_id", userId);
    if (tripsErr) throw new Error(`trips query failed: ${tripsErr.message}`);
    const tripIds = (trips ?? []).map((t: { id: string }) => t.id);

    // 2) For those trips, find decision ids to clear votes first
    let decisionIds: string[] = [];
    if (tripIds.length) {
      const { data: decisions, error: decErr } = await adminClient
        .from("trip_decisions")
        .select("id")
        .in("trip_id", tripIds);
      if (decErr) throw new Error(`trip_decisions query failed: ${decErr.message}`);
      decisionIds = (decisions ?? []).map((d: { id: string }) => d.id);
    }

    // 3) Delete trip decision votes
    await deleteInBatches("trip_decision_votes", "decision_id", decisionIds);

    // 4) Delete trip decisions and expenses for user's trips
    if (tripIds.length) {
      const { error: delDecisionsErr } = await adminClient
        .from("trip_decisions")
        .delete()
        .in("trip_id", tripIds);
      if (delDecisionsErr) throw new Error(`trip_decisions delete failed: ${delDecisionsErr.message}`);

      const { error: delExpensesErr } = await adminClient
        .from("trip_expenses")
        .delete()
        .in("trip_id", tripIds);
      if (delExpensesErr) throw new Error(`trip_expenses delete failed: ${delExpensesErr.message}`);
    }

    // 5) Delete collaborators, members, access logs
    if (tripIds.length) {
      const { error: delCollabByTripErr } = await adminClient
        .from("trip_collaborators")
        .delete()
        .in("trip_id", tripIds);
      if (delCollabByTripErr) throw new Error(`trip_collaborators (by trip) delete failed: ${delCollabByTripErr.message}`);

      const { error: delMembersByTripErr } = await adminClient
        .from("trip_members")
        .delete()
        .in("trip_id", tripIds);
      if (delMembersByTripErr) throw new Error(`trip_members (by trip) delete failed: ${delMembersByTripErr.message}`);

      const { error: delAccessByTripErr } = await adminClient
        .from("trip_access_log")
        .delete()
        .in("trip_id", tripIds);
      if (delAccessByTripErr) throw new Error(`trip_access_log (by trip) delete failed: ${delAccessByTripErr.message}`);
    }

    // Also remove by user where relevant
    {
      const { error } = await adminClient.from("trip_collaborators").delete().eq("user_id", userId);
      if (error) throw new Error(`trip_collaborators (by user) delete failed: ${error.message}`);
    }
    {
      const { error } = await adminClient.from("trip_members").delete().eq("user_id", userId);
      if (error) throw new Error(`trip_members (by user) delete failed: ${error.message}`);
    }
    {
      const { error } = await adminClient.from("trip_access_log").delete().eq("user_id", userId);
      if (error) throw new Error(`trip_access_log (by user) delete failed: ${error.message}`);
    }

    // 6) Delete saved places and coordinates
    if (tripIds.length) {
      const { error: delPlacesErr } = await adminClient
        .from("saved_places")
        .delete()
        .in("trip_id", tripIds);
      if (delPlacesErr) throw new Error(`saved_places delete failed: ${delPlacesErr.message}`);

      const { error: delCoordsErr } = await adminClient
        .from("trip_coordinates")
        .delete()
        .in("trip_id", tripIds);
      if (delCoordsErr) throw new Error(`trip_coordinates delete failed: ${delCoordsErr.message}`);
    }

    // 7) Delete direct user data
    for (const tbl of [
      "ai_itineraries",
      "place_reviews",
      "user_achievement_progress",
      "user_achievements",
      "user_activities",
      "user_stats",
    ]) {
      const { error } = await adminClient.from(tbl).delete().eq("user_id", userId);
      if (error) throw new Error(`${tbl} delete failed: ${error.message}`);
    }

    // 8) Invitations sent by user or received via email
    if (userEmail) {
      const { error: delInvByEmailErr } = await adminClient
        .from("trip_invitations")
        .delete()
        .eq("email", userEmail);
      if (delInvByEmailErr) throw new Error(`trip_invitations (by email) delete failed: ${delInvByEmailErr.message}`);
    }
    {
      const { error: delInvByInviterErr } = await adminClient
        .from("trip_invitations")
        .delete()
        .eq("inviter_id", userId);
      if (delInvByInviterErr) throw new Error(`trip_invitations (by inviter) delete failed: ${delInvByInviterErr.message}`);
    }

    // 9) Delete user's trips
    if (tripIds.length) {
      const { error: delTripsErr } = await adminClient.from("trips").delete().in("id", tripIds);
      if (delTripsErr) throw new Error(`trips delete failed: ${delTripsErr.message}`);
    }

    // 10) Delete profile
    {
      const { error } = await adminClient.from("profiles").delete().eq("id", userId);
      if (error) throw new Error(`profiles delete failed: ${error.message}`);
    }

    console.log("[auth-user-deletion-cleanup] Cleanup completed for:", { userId });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[auth-user-deletion-cleanup] Cleanup error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
