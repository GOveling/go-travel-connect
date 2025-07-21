
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

interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

// Global IATA database (simplified version for edge function)
const airportDatabase: Record<string, Airport[]> = {
  "new york": [
    {"iata": "JFK", "name": "John F. Kennedy International Airport", "city": "New York", "country": "United States"},
    {"iata": "LGA", "name": "LaGuardia Airport", "city": "New York", "country": "United States"},
    {"iata": "EWR", "name": "Newark Liberty International Airport", "city": "Newark", "country": "United States"}
  ],
  "london": [
    {"iata": "LHR", "name": "Heathrow Airport", "city": "London", "country": "United Kingdom"},
    {"iata": "LGW", "name": "Gatwick Airport", "city": "London", "country": "United Kingdom"}
  ],
  "paris": [
    {"iata": "CDG", "name": "Charles de Gaulle Airport", "city": "Paris", "country": "France"},
    {"iata": "ORY", "name": "Orly Airport", "city": "Paris", "country": "France"}
  ],
  "madrid": [{"iata": "MAD", "name": "Adolfo Suárez Madrid–Barajas Airport", "city": "Madrid", "country": "Spain"}],
  "barcelona": [{"iata": "BCN", "name": "Barcelona-El Prat Airport", "city": "Barcelona", "country": "Spain"}],
  "rome": [
    {"iata": "FCO", "name": "Leonardo da Vinci International Airport", "city": "Rome", "country": "Italy"},
    {"iata": "CIA", "name": "Ciampino Airport", "city": "Rome", "country": "Italy"}
  ],
  "tokyo": [
    {"iata": "NRT", "name": "Narita International Airport", "city": "Tokyo", "country": "Japan"},
    {"iata": "HND", "name": "Haneda Airport", "city": "Tokyo", "country": "Japan"}
  ],
  "dubai": [{"iata": "DXB", "name": "Dubai International Airport", "city": "Dubai", "country": "United Arab Emirates"}],
  "singapore": [{"iata": "SIN", "name": "Singapore Changi Airport", "city": "Singapore", "country": "Singapore"}],
  "los angeles": [{"iata": "LAX", "name": "Los Angeles International Airport", "city": "Los Angeles", "country": "United States"}],
  "miami": [{"iata": "MIA", "name": "Miami International Airport", "city": "Miami", "country": "United States"}],
  "santiago": [{"iata": "SCL", "name": "Arturo Merino Benítez International Airport", "city": "Santiago", "country": "Chile"}],
  "lima": [{"iata": "LIM", "name": "Jorge Chávez International Airport", "city": "Lima", "country": "Peru"}],
  "buenos aires": [
    {"iata": "EZE", "name": "Ezeiza International Airport", "city": "Buenos Aires", "country": "Argentina"},
    {"iata": "AEP", "name": "Jorge Newbery Airfield", "city": "Buenos Aires", "country": "Argentina"}
  ],
  "antofagasta": [{"iata": "ANF", "name": "Andrés Sabella Gálvez International Airport", "city": "Antofagasta", "country": "Chile"}],
  "valparaiso": [{"iata": "KNA", "name": "Viña del Mar Airport", "city": "Valparaíso", "country": "Chile"}],
  "concepcion": [{"iata": "CCP", "name": "Carriel Sur Airport", "city": "Concepción", "country": "Chile"}]
};

function extractCityFromInput(input: string): string {
  // Remove common patterns and extract city name
  const cleanInput = input
    .toLowerCase()
    .replace(/,.*$/, '') // Remove everything after comma
    .replace(/\s+airport.*$/, '') // Remove "airport" and everything after
    .replace(/international.*$/, '') // Remove "international" and everything after
    .trim();
  
  return cleanInput;
}

function findAirportCode(cityInput: string): string | null {
  console.log('🔍 Finding airport code for:', cityInput);
  
  // First check if it's already an IATA code
  if (cityInput.length === 3 && /^[A-Z]{3}$/.test(cityInput.toUpperCase())) {
    console.log('✅ Already an IATA code:', cityInput.toUpperCase());
    return cityInput.toUpperCase();
  }
  
  const cityName = extractCityFromInput(cityInput);
  console.log('🏙️ Extracted city name:', cityName);
  
  // Direct match
  if (airportDatabase[cityName]) {
    const airport = airportDatabase[cityName][0]; // Use primary airport
    console.log('✅ Direct match found:', airport.iata);
    return airport.iata;
  }
  
  // Fuzzy search
  const threshold = 0.6;
  let bestMatch: { code: string; score: number } | null = null;
  
  for (const [dbCity, airports] of Object.entries(airportDatabase)) {
    const similarity = calculateSimilarity(cityName, dbCity);
    if (similarity > threshold && (!bestMatch || similarity > bestMatch.score)) {
      bestMatch = { code: airports[0].iata, score: similarity };
    }
  }
  
  if (bestMatch) {
    console.log('✅ Fuzzy match found:', bestMatch.code, 'with score:', bestMatch.score);
    return bestMatch.code;
  }
  
  console.log('❌ No airport code found for:', cityInput);
  return null;
}

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Simple Levenshtein distance
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
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

    // Convert city names to IATA codes
    const originCode = findAirportCode(origin);
    const destinationCode = findAirportCode(destination);
    
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
