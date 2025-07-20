import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FlightSearchRequest {
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  currency?: string;
  limit?: number;
}

interface AviasalesResponse {
  success: boolean;
  data: any;
  currency: string;
}

interface FlightResult {
  price: number;
  airline: string;
  departure_at: string;
  return_at?: string;
  duration?: number;
  transfers: number;
  link: string;
  origin: string;
  destination: string;
  found_at: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiToken = Deno.env.get('AVIASALES_API_TOKEN');
    if (!apiToken) {
      console.error('❌ AVIASALES_API_TOKEN not found');
      return new Response(
        JSON.stringify({ error: 'API token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    console.log(`🔍 Aviasales API request: ${path}`);

    switch (path) {
      case 'search':
        return await handleFlightSearch(req, apiToken);
      case 'calendar':
        return await handleCalendarPrices(req, apiToken);
      case 'popular-routes':
        return await handlePopularRoutes(req, apiToken);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid endpoint' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('❌ Aviasales API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleFlightSearch(req: Request, apiToken: string): Promise<Response> {
  try {
    const body: FlightSearchRequest = await req.json();
    const { origin, destination, departure_date, return_date, currency = 'USD', limit = 30 } = body;

    console.log(`🔍 Searching flights: ${origin} -> ${destination}, ${departure_date}`);

    // Use latest prices endpoint for most recent data
    const baseUrl = 'http://api.travelpayouts.com/v1/prices/latest';
    const params = new URLSearchParams({
      currency,
      origin,
      destination,
      beginning_of_period: departure_date,
      period_type: 'year',
      one_way: return_date ? 'false' : 'true',
      page: '1',
      limit: limit.toString(),
      sorting: 'price',
      trip_class: '0', // Economy
      token: apiToken
    });

    const response = await fetch(`${baseUrl}?${params}`);
    
    if (!response.ok) {
      console.error(`❌ Aviasales API error: ${response.status}`);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Found ${data.data?.length || 0} flights`);

    // Transform data to our format
    const transformedResults: FlightResult[] = (data.data || []).map((flight: any) => ({
      price: flight.value,
      airline: flight.airline || 'Unknown',
      departure_at: flight.departure_at,
      return_at: flight.return_at,
      duration: flight.duration,
      transfers: flight.number_of_changes || 0,
      link: flight.link || `https://www.aviasales.com/search/${origin}${destination}${departure_date.replace(/-/g, '')}${return_date ? return_date.replace(/-/g, '') : ''}1`,
      origin: flight.origin,
      destination: flight.destination,
      found_at: flight.found_at
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: transformedResults,
        currency: data.currency || currency,
        total: transformedResults.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Flight search error:', error);
    return new Response(
      JSON.stringify({ error: 'Flight search failed', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleCalendarPrices(req: Request, apiToken: string): Promise<Response> {
  try {
    const body = await req.json();
    const { origin, destination, currency = 'USD' } = body;

    console.log(`📅 Getting calendar prices: ${origin} -> ${destination}`);

    const baseUrl = 'http://api.travelpayouts.com/v1/prices/calendar';
    const params = new URLSearchParams({
      currency,
      origin,
      destination,
      token: apiToken
    });

    const response = await fetch(`${baseUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Calendar data retrieved`);

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Calendar prices error:', error);
    return new Response(
      JSON.stringify({ error: 'Calendar prices failed', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handlePopularRoutes(req: Request, apiToken: string): Promise<Response> {
  try {
    const url = new URL(req.url);
    const origin = url.searchParams.get('origin') || 'NYC';
    const currency = url.searchParams.get('currency') || 'USD';

    console.log(`🌟 Getting popular routes from: ${origin}`);

    const baseUrl = 'http://api.travelpayouts.com/v1/city-directions';
    const params = new URLSearchParams({
      currency,
      origin,
      token: apiToken
    });

    const response = await fetch(`${baseUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Popular routes retrieved`);

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Popular routes error:', error);
    return new Response(
      JSON.stringify({ error: 'Popular routes failed', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}