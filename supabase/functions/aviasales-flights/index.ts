
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FlightSearchRequest {
  method: string;
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
    console.log('🔍 Checking API token:', apiToken ? 'Token found' : 'Token NOT found');
    
    if (!apiToken) {
      console.error('❌ AVIASALES_API_TOKEN not found');
      return new Response(
        JSON.stringify({ error: 'API token not configured', success: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestBody: FlightSearchRequest = await req.json();
    console.log('📥 Request received:', JSON.stringify(requestBody, null, 2));

    const { method } = requestBody;

    switch (method) {
      case 'search':
        return await handleFlightSearch(requestBody, apiToken);
      case 'calendar':
        return await handleCalendarPrices(requestBody, apiToken);
      case 'popular-routes':
        return await handlePopularRoutes(requestBody, apiToken);
      default:
        console.error('❌ Invalid method:', method);
        return new Response(
          JSON.stringify({ error: 'Invalid method', success: false }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('❌ Aviasales API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', success: false, details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleFlightSearch(requestBody: FlightSearchRequest, apiToken: string): Promise<Response> {
  try {
    const { origin, destination, departure_date, return_date, currency = 'USD', limit = 30 } = requestBody;

    console.log(`🔍 Searching flights: ${origin} -> ${destination}, ${departure_date}`);
    console.log('📋 Search parameters:', { origin, destination, departure_date, return_date, currency, limit });

    // Use latest prices endpoint for most recent data with HTTPS
    const baseUrl = 'https://api.travelpayouts.com/v1/prices/latest';
    const params = new URLSearchParams({
      currency,
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      beginning_of_period: departure_date,
      period_type: 'year',
      one_way: return_date ? 'false' : 'true',
      page: '1',
      limit: limit.toString(),
      sorting: 'price',
      trip_class: '0', // Economy
      token: apiToken
    });

    const fullUrl = `${baseUrl}?${params}`;
    console.log('🌐 API URL:', fullUrl.replace(apiToken, 'TOKEN_HIDDEN'));

    const response = await fetch(fullUrl);
    console.log('📡 API Response status:', response.status);
    
    if (!response.ok) {
      console.error(`❌ Aviasales API error: ${response.status}`);
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📊 Raw API response:', JSON.stringify(data, null, 2));
    console.log(`✅ Found ${data.data?.length || 0} flights`);

    // Transform data to our format
    const transformedResults: FlightResult[] = (data.data || []).map((flight: any) => {
      console.log('🔄 Transforming flight:', flight);
      return {
        price: flight.value || flight.price || 0,
        airline: flight.airline || 'Unknown',
        departure_at: flight.departure_at,
        return_at: flight.return_at,
        duration: flight.duration,
        transfers: flight.number_of_changes || 0,
        link: flight.link || `https://www.aviasales.com/search/${origin}${destination}${departure_date.replace(/-/g, '')}${return_date ? return_date.replace(/-/g, '') : ''}1`,
        origin: flight.origin || origin,
        destination: flight.destination || destination,
        found_at: flight.found_at || new Date().toISOString()
      };
    });

    console.log('✅ Transformed results:', transformedResults.length, 'flights');

    const finalResponse = {
      success: true,
      data: transformedResults,
      currency: data.currency || currency,
      total: transformedResults.length
    };

    console.log('📤 Final response:', JSON.stringify(finalResponse, null, 2));

    return new Response(
      JSON.stringify(finalResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Flight search error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Flight search failed', 
        success: false,
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleCalendarPrices(requestBody: any, apiToken: string): Promise<Response> {
  try {
    const { origin, destination, currency = 'USD' } = requestBody;

    console.log(`📅 Getting calendar prices: ${origin} -> ${destination}`);

    const baseUrl = 'https://api.travelpayouts.com/v1/prices/calendar';
    const params = new URLSearchParams({
      currency,
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      token: apiToken
    });

    const response = await fetch(`${baseUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Calendar data retrieved`);

    return new Response(
      JSON.stringify({ success: true, ...data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Calendar prices error:', error);
    return new Response(
      JSON.stringify({ error: 'Calendar prices failed', success: false, details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handlePopularRoutes(requestBody: any, apiToken: string): Promise<Response> {
  try {
    const { origin = 'NYC', currency = 'USD' } = requestBody;

    console.log(`🌟 Getting popular routes from: ${origin}`);

    const baseUrl = 'https://api.travelpayouts.com/v1/city-directions';
    const params = new URLSearchParams({
      currency,
      origin: origin.toUpperCase(),
      token: apiToken
    });

    const response = await fetch(`${baseUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Popular routes retrieved`);

    return new Response(
      JSON.stringify({ success: true, ...data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Popular routes error:', error);
    return new Response(
      JSON.stringify({ error: 'Popular routes failed', success: false, details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
