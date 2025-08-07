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

  // Dry-run support via header or query param
  const url = new URL(req.url);
  const dryRun = (
    (req.headers.get("x-dry-run") || "").toLowerCase() === "true" ||
    ["1", "true", "yes"].includes((url.searchParams.get("dryRun") || "").toLowerCase())
  );

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

  const start = Date.now();

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

  const countByTripIds = async (table: string, tripIds: string[], col = "trip_id") => {
    if (!tripIds.length) return 0;
    const { count, error } = await adminClient
      .from(table)
      .select("*", { count: "exact", head: true })
      .in(col, tripIds);
    if (error) throw new Error(`${table} count failed: ${error.message}`);
    return count || 0;
  };

  const countByUserId = async (table: string, userId: string, col = "user_id") => {
    const { count, error } = await adminClient
      .from(table)
      .select("*", { count: "exact", head: true })
      .eq(col, userId);
    if (error) throw new Error(`${table} count failed: ${error.message}`);
    return count || 0;
  };

  const extractAvatarPath = (avatarUrl?: string | null) => {
    if (!avatarUrl) return null;
    try {
      const u = new URL(avatarUrl);
      const parts = u.pathname.split("/avatars/");
      if (parts.length > 1) {
        return parts[1].replace(/^public\//, ""); // strip leading 'public/' if present
      }
      // fallback: if it's already a relative path
      return avatarUrl.includes("/") ? avatarUrl.split("avatars/").pop() || null : avatarUrl;
    } catch {
      // not a URL, assume it's a direct storage path
      return avatarUrl.includes("/") ? avatarUrl.split("avatars/").pop() || null : avatarUrl;
    }
  };

  try {
    console.log("[auth-user-deletion-cleanup] Starting cleanup for:", { userId, userEmail, dryRun });

    // Pre-fetch profile (for storage cleanup + existence check)
    const { data: profileRow } = await adminClient
      .from("profiles")
      .select("id, avatar_url")
      .eq("id", userId)
      .maybeSingle();

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

    // Build counts summary (pre-deletion)
    const preCounts = {
      trips: tripIds.length,
      trip_decisions: await countByTripIds("trip_decisions", tripIds),
      trip_decision_votes: decisionIds.length
        ? (await adminClient.from("trip_decision_votes").select("*", { count: "exact", head: true }).in("decision_id", decisionIds)).count || 0
        : 0,
      trip_expenses: await countByTripIds("trip_expenses", tripIds),
      trip_collaborators_by_trip: await countByTripIds("trip_collaborators", tripIds),
      trip_members_by_trip: await countByTripIds("trip_members", tripIds),
      trip_access_log_by_trip: await countByTripIds("trip_access_log", tripIds),
      trip_collaborators_by_user: await countByUserId("trip_collaborators", userId),
      trip_members_by_user: await countByUserId("trip_members", userId),
      trip_access_log_by_user: await countByUserId("trip_access_log", userId),
      saved_places: await countByTripIds("saved_places", tripIds),
      trip_coordinates: await countByTripIds("trip_coordinates", tripIds),
      ai_itineraries: await countByUserId("ai_itineraries", userId),
      place_reviews: await countByUserId("place_reviews", userId),
      user_achievement_progress: await countByUserId("user_achievement_progress", userId),
      user_achievements: await countByUserId("user_achievements", userId),
      user_activities: await countByUserId("user_activities", userId),
      user_stats: await countByUserId("user_stats", userId),
      trip_invitations_by_email: userEmail
        ? ((await adminClient.from("trip_invitations").select("*", { count: "exact", head: true }).eq("email", userEmail)).count || 0)
        : 0,
      trip_invitations_by_inviter: await countByUserId("trip_invitations", userId, "inviter_id"),
      profiles: profileRow ? 1 : 0,
    } as Record<string, number>;

    if (dryRun) {
      const durationMs = Date.now() - start;
      const summary = { userId, userEmail, dryRun: true, preCounts, durationMs };
      console.log("[auth-user-deletion-cleanup] Dry-run summary:", summary);
      return new Response(JSON.stringify({ ok: true, dryRun: true, preCounts, durationMs }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

    // 11) Optional storage cleanup for avatar
    let avatarsRemoved = 0;
    const avatarPath = extractAvatarPath(profileRow?.avatar_url || undefined);
    if (avatarPath) {
      const { data: removeRes, error: removeErr } = await adminClient.storage.from("avatars").remove([avatarPath]);
      if (removeErr) {
        // Log but don't fail the entire cleanup on storage errors
        console.warn("[auth-user-deletion-cleanup] Avatar removal warning:", removeErr.message);
      } else if (Array.isArray(removeRes) && removeRes.length > 0) {
        avatarsRemoved = removeRes.filter((r: any) => !r.error).length;
      }
    }

    const durationMs = Date.now() - start;
    const result = { ok: true, preCounts, avatarsRemoved, durationMs };
    console.log("[auth-user-deletion-cleanup] Cleanup completed:", { userId, durationMs, avatarsRemoved });

    return new Response(JSON.stringify(result), {
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
