import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory cache (production would use Redis/Supabase)
const routeCache = new Map<string, any>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Rate limiting: track last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1200; // 1.2 seconds between requests

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origin, destination, mode = 'walking' } = await req.json();

    if (!origin || !destination) {
      return new Response(
        JSON.stringify({ error: 'Missing origin or destination' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create cache key
    const cacheKey = `${origin.lat},${origin.lng}-${destination.lat},${destination.lng}-${mode}`;
    
    // Check cache
    const cachedRoute = routeCache.get(cacheKey);
    if (cachedRoute && (Date.now() - cachedRoute.timestamp) < CACHE_TTL) {
      console.log('✅ Cache hit:', cacheKey);
      return new Response(
        JSON.stringify({ ...cachedRoute.data, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting: ensure minimum interval between requests
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏱️ Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    lastRequestTime = Date.now();

    // Map mode to OSRM profile
    const profileMap: Record<string, string> = {
      'walking': 'foot',
      'driving': 'car',
      'bicycling': 'bike',
      'transit': 'foot'
    };
    const profile = profileMap[mode] || 'foot';

    const coordsString = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
    const url = `https://router.project-osrm.org/route/v1/${profile}/${coordsString}?overview=full&geometries=polyline&steps=true`;

    console.log('🗺️ OSRM Request:', { cacheKey, url });

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('❌ OSRM Error:', response.status);
      return new Response(
        JSON.stringify({ 
          error: 'OSRM API error',
          status: response.status,
          useFallback: true,
          origin,
          destination
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.warn('⚠️ No route found');
      return new Response(
        JSON.stringify({ 
          error: 'No route found',
          useFallback: true,
          origin,
          destination
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cache the successful result
    routeCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    console.log('✅ OSRM Success, cached:', cacheKey);

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        useFallback: true
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
