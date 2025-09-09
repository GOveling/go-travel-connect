import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LocationAccessLog {
  user_id: string;
  access_type: 'approximate' | 'exact';
  visit_id?: string;
  reason?: string;
  ip_address?: string;
  user_agent?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { access_type, visit_id, reason } = await req.json();

    // Log the location access request
    const accessLog: LocationAccessLog = {
      user_id: user.id,
      access_type,
      visit_id,
      reason,
      ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown'
    };

    console.log('Location access logged:', accessLog);

    // Store the access log in security audit table
    const { error: logError } = await supabase
      .from('security_audit_log')
      .insert({
        table_name: 'place_visits',
        user_id: user.id,
        action_type: `LOCATION_ACCESS_${access_type.toUpperCase()}`,
        details: {
          visit_id,
          reason,
          ip_address: accessLog.ip_address,
          user_agent: accessLog.user_agent,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });

    if (logError) {
      console.error('Error logging location access:', logError);
    }

    // Check for suspicious access patterns
    const suspiciousPatterns = await checkSuspiciousActivity(supabase, user.id);

    if (suspiciousPatterns.length > 0) {
      console.warn('Suspicious location access patterns detected:', suspiciousPatterns);
      
      // Alert about suspicious activity (in production, you might send alerts)
      await supabase
        .from('security_audit_log')
        .insert({
          table_name: 'place_visits',
          user_id: user.id,
          action_type: 'SUSPICIOUS_LOCATION_ACCESS',
          details: {
            patterns: suspiciousPatterns,
            timestamp: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        logged: true,
        suspicious_activity: suspiciousPatterns.length > 0 ? suspiciousPatterns : null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Location privacy monitor error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function checkSuspiciousActivity(supabase: any, userId: string): Promise<string[]> {
  const patterns: string[] = [];
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  try {
    // Check for excessive location access in the last hour
    const { data: recentAccess, error } = await supabase
      .from('security_audit_log')
      .select('*')
      .eq('user_id', userId)
      .eq('table_name', 'place_visits')
      .gte('timestamp', oneHourAgo.toISOString())
      .in('action_type', ['LOCATION_ACCESS_APPROXIMATE', 'LOCATION_ACCESS_EXACT', 'ACCESS_EXACT_LOCATION']);

    if (error) {
      console.error('Error checking suspicious activity:', error);
      return patterns;
    }

    // Pattern 1: Too many exact location requests
    const exactLocationRequests = recentAccess?.filter(log => 
      log.action_type === 'LOCATION_ACCESS_EXACT' || log.action_type === 'ACCESS_EXACT_LOCATION'
    ) || [];

    if (exactLocationRequests.length > 10) {
      patterns.push('excessive_exact_location_requests');
    }

    // Pattern 2: Rapid-fire location requests
    const totalRequests = recentAccess?.length || 0;
    if (totalRequests > 50) {
      patterns.push('rapid_fire_location_requests');
    }

    // Pattern 3: Unusual IP addresses (if different from recent patterns)
    const recentIPs = new Set(
      recentAccess?.map(log => log.details?.ip_address).filter(Boolean) || []
    );

    if (recentIPs.size > 5) {
      patterns.push('multiple_ip_addresses');
    }

  } catch (error) {
    console.error('Error in suspicious activity check:', error);
  }

  return patterns;
}