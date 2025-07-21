
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

// Función para extraer código IATA del input del usuario
function extractIATACode(input: string): string | null {
  console.log('🔍 Extracting IATA code from:', input);
  
  // Si ya es un código IATA de 3 letras
  if (input.length === 3 && /^[A-Z]{3}$/.test(input.toUpperCase())) {
    console.log('✅ Already an IATA code:', input.toUpperCase());
    return input.toUpperCase();
  }
  
  // Buscar patrón (XXX) en el string
  const iataMatch = input.match(/\(([A-Z]{3})\)/);
  if (iataMatch) {
    console.log('✅ Found IATA code in parentheses:', iataMatch[1]);
    return iataMatch[1];
  }
  
  // Buscar código al final del string después de espacio
  const parts = input.trim().split(/\s+/);
  const lastPart = parts[parts.length - 1];
  if (lastPart.length === 3 && /^[A-Z]{3}$/.test(lastPart.toUpperCase())) {
    console.log('✅ Found IATA code at end:', lastPart.toUpperCase());
    return lastPart.toUpperCase();
  }
  
  console.log('❌ No IATA code found in:', input);
  return null;
}

// Función para buscar código IATA usando la API de autocompletado
async function findIATACodeFromAutocomplete(cityName: string): Promise<string | null> {
  try {
    console.log('🔍 Searching IATA code for:', cityName);
    
    const response = await fetch(`https://suhttfxcurgurshlkcpz.supabase.co/functions/v1/aviasales-autocomplete?query=${encodeURIComponent(cityName)}&limit=5`);
    
    if (!response.ok) {
      console.error('❌ Autocomplete API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.success || !data.results || data.results.length === 0) {
      console.log('❌ No results found in autocomplete');
      return null;
    }
    
    // Buscar el primer resultado que sea un aeropuerto o ciudad
    const result = data.results.find((r: any) => r.type === 'airport' || r.type === 'city');
    
    if (result) {
      console.log('✅ Found IATA code from autocomplete:', result.code);
      return result.code;
    }
    
    console.log('❌ No suitable result found in autocomplete');
    return null;
    
  } catch (error) {
    console.error('💥 Error calling autocomplete API:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  console.log('🚀 Edge function started - aviasales-flights');
  console.log('📧 Request method:', req.method);
  console.log('🌐 Request URL:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiToken = Deno.env.get('AVIASALES_API_TOKEN');
    console.log('🔍 API Token check:', apiToken ? 'Token found' : 'Token NOT found');
    
    if (!apiToken) {
      console.error('❌ AVIASALES_API_TOKEN not found in environment');
      return new Response(
        JSON.stringify({ error: 'API token not configured', success: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestBody: FlightSearchRequest = await req.json();
    console.log('📥 Request body received:', JSON.stringify(requestBody, null, 2));

    const { method, origin, destination } = requestBody;

    if (method !== 'search') {
      console.error('❌ Invalid method:', method);
      return new Response(
        JSON.stringify({ error: 'Invalid method', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convertir nombres de ciudades a códigos IATA
    let originCode = extractIATACode(origin);
    let destinationCode = extractIATACode(destination);
    
    // Si no se encontró el código directamente, usar la API de autocompletado
    if (!originCode) {
      originCode = await findIATACodeFromAutocomplete(origin);
    }
    
    if (!destinationCode) {
      destinationCode = await findIATACodeFromAutocomplete(destination);
    }
    
    console.log('🛫 Origin mapping:', `${origin} → ${originCode}`);
    console.log('🛬 Destination mapping:', `${destination} → ${destinationCode}`);

    if (!originCode || !destinationCode) {
      console.error('❌ Could not find airport codes for:', { origin, destination, originCode, destinationCode });
      return new Response(
        JSON.stringify({ 
          error: 'Unable to find airport codes for the specified cities',
          success: false,
          details: {
            origin: originCode ? 'Found' : 'Not found',
            destination: destinationCode ? 'Found' : 'Not found'
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return await handleFlightSearch({
      ...requestBody,
      origin: originCode,
      destination: destinationCode
    }, apiToken);

  } catch (error) {
    console.error('❌ Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        success: false, 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleFlightSearch(requestBody: FlightSearchRequest, apiToken: string): Promise<Response> {
  try {
    const { origin, destination, departure_date, return_date, currency = 'USD', limit = 30 } = requestBody;

    console.log(`🔍 Searching flights with IATA codes: ${origin} -> ${destination}, ${departure_date}`);

    const baseUrl = 'https://api.travelpayouts.com/v1/prices/latest';
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
      trip_class: '0',
      token: apiToken
    });

    const fullUrl = `${baseUrl}?${params}`;
    console.log('🌐 API URL (token hidden):', fullUrl.replace(apiToken, 'HIDDEN'));

    const response = await fetch(fullUrl);
    console.log('📡 API Response status:', response.status);
    
    if (!response.ok) {
      console.error(`❌ Aviasales API error: ${response.status}`);
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📊 API response data keys:', Object.keys(data));
    console.log(`✅ Found ${data.data?.length || 0} flights`);

    // Transform data to our format
    const transformedResults: FlightResult[] = (data.data || []).map((flight: any) => {
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

    console.log('✅ Successfully transformed', transformedResults.length, 'flights');

    const finalResponse = {
      success: true,
      data: transformedResults,
      currency: data.currency || currency,
      total: transformedResults.length
    };

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
