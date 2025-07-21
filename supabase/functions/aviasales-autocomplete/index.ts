
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AviasalesCity {
  code: string;
  name: string;
  country_code: string;
  country_name: string;
  time_zone: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  name_translations: {
    en: string;
    es?: string;
    fr?: string;
    de?: string;
  };
  cases: {
    vi?: string;
    tv?: string;
    ro?: string;
    pr?: string;
    da?: string;
  };
}

interface AviasalesAirport {
  code: string;
  name: string;
  city_code: string;
  city_name: string;
  country_code: string;
  country_name: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  time_zone: string;
  name_translations: {
    en: string;
    es?: string;
    fr?: string;
    de?: string;
  };
  flightable: boolean;
}

interface AutocompleteResult {
  type: 'city' | 'airport';
  code: string;
  name: string;
  city_name?: string;
  country_name: string;
  country_code: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  display_name: string;
}

serve(async (req) => {
  console.log('🚀 Aviasales Autocomplete API started');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('query') || '';
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const locale = url.searchParams.get('locale') || 'en';

    console.log(`🔍 Searching for: "${query}" (limit: ${limit}, locale: ${locale})`);

    if (query.length < 2) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Query must be at least 2 characters',
          results: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get cities and airports data from Aviasales with proper error handling
    let cities: AviasalesCity[] = [];
    let airports: AviasalesAirport[] = [];

    try {
      console.log('📡 Fetching cities from Aviasales API...');
      const citiesResponse = await fetch(`https://api.travelpayouts.com/data/${locale}/cities.json`);
      if (citiesResponse.ok) {
        cities = await citiesResponse.json();
        console.log(`✅ Loaded ${cities.length} cities`);
      } else {
        console.error(`❌ Cities API error: ${citiesResponse.status}`);
      }
    } catch (error) {
      console.error('❌ Error fetching cities:', error);
    }

    try {
      console.log('📡 Fetching airports from Aviasales API...');
      const airportsResponse = await fetch(`https://api.travelpayouts.com/data/${locale}/airports.json`);
      if (airportsResponse.ok) {
        airports = await airportsResponse.json();
        console.log(`✅ Loaded ${airports.length} airports`);
      } else {
        console.error(`❌ Airports API error: ${airportsResponse.status}`);
      }
    } catch (error) {
      console.error('❌ Error fetching airports:', error);
    }

    // If both requests failed, return an error
    if (cities.length === 0 && airports.length === 0) {
      console.error('❌ Failed to fetch data from both APIs');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch data from Aviasales API',
          results: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const queryLower = query.toLowerCase();
    const results: AutocompleteResult[] = [];

    // Search in cities with null checks
    for (const city of cities) {
      if (!city || !city.name || !city.code) continue;
      
      const cityName = city.name.toLowerCase();
      const cityNameTranslated = city.name_translations?.[locale as keyof typeof city.name_translations]?.toLowerCase() || cityName;
      
      if (cityName.includes(queryLower) || cityNameTranslated.includes(queryLower) || city.code.toLowerCase().includes(queryLower)) {
        results.push({
          type: 'city',
          code: city.code,
          name: city.name_translations?.[locale as keyof typeof city.name_translations] || city.name,
          country_name: city.country_name || 'Unknown',
          country_code: city.country_code || '',
          coordinates: {
            lat: city.coordinates?.lat || 0,
            lon: city.coordinates?.lon || 0
          },
          display_name: `${city.name_translations?.[locale as keyof typeof city.name_translations] || city.name}, ${city.country_name || 'Unknown'}`
        });
      }
      
      if (results.length >= limit) break;
    }

    // Search in airports (only if we haven't reached the limit) with null checks
    if (results.length < limit) {
      for (const airport of airports) {
        if (!airport || !airport.name || !airport.code || !airport.flightable) continue;
        
        const airportName = airport.name.toLowerCase();
        const airportNameTranslated = airport.name_translations?.[locale as keyof typeof airport.name_translations]?.toLowerCase() || airportName;
        const cityName = airport.city_name?.toLowerCase() || '';
        
        if (airportName.includes(queryLower) || 
            airportNameTranslated.includes(queryLower) || 
            cityName.includes(queryLower) ||
            airport.code.toLowerCase().includes(queryLower)) {
          
          results.push({
            type: 'airport',
            code: airport.code,
            name: airport.name_translations?.[locale as keyof typeof airport.name_translations] || airport.name,
            city_name: airport.city_name || '',
            country_name: airport.country_name || 'Unknown',
            country_code: airport.country_code || '',
            coordinates: {
              lat: airport.coordinates?.lat || 0,
              lon: airport.coordinates?.lon || 0
            },
            display_name: `${airport.city_name || airport.name}, ${airport.country_name || 'Unknown'} (${airport.code})`
          });
        }
        
        if (results.length >= limit) break;
      }
    }

    // Sort results: exact matches first, then by relevance
    results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === queryLower || a.code.toLowerCase() === queryLower;
      const bExact = b.name.toLowerCase() === queryLower || b.code.toLowerCase() === queryLower;
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Prioritize airports over cities for specific searches
      if (a.type === 'airport' && b.type === 'city') return -1;
      if (a.type === 'city' && b.type === 'airport') return 1;
      
      return a.name.localeCompare(b.name);
    });

    console.log(`✅ Found ${results.length} results`);

    return new Response(
      JSON.stringify({
        success: true,
        results: results.slice(0, limit),
        total: results.length,
        query: query
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Autocomplete error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        results: [],
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
