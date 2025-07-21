
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
      console.log('⚠️ Query too short, returning empty results');
      return new Response(
        JSON.stringify({ 
          success: true, 
          results: [],
          total: 0,
          query: query,
          message: 'Query must be at least 2 characters'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📡 Fetching data from Aviasales API...');
    
    // Get cities and airports data from Aviasales with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );

    const [citiesResponse, airportsResponse] = await Promise.race([
      Promise.all([
        fetch(`https://api.travelpayouts.com/data/${locale}/cities.json`),
        fetch(`https://api.travelpayouts.com/data/${locale}/airports.json`)
      ]),
      timeoutPromise
    ]) as [Response, Response];

    if (!citiesResponse.ok || !airportsResponse.ok) {
      console.error('❌ Failed to fetch data from Aviasales API');
      console.error('Cities response status:', citiesResponse.status);
      console.error('Airports response status:', airportsResponse.status);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch data from Aviasales API',
          results: [],
          total: 0,
          query: query
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cities: AviasalesCity[] = await citiesResponse.json();
    const airports: AviasalesAirport[] = await airportsResponse.json();

    console.log(`📊 Loaded ${cities.length} cities and ${airports.length} airports`);

    const queryLower = query.toLowerCase();
    const results: AutocompleteResult[] = [];

    // Search in cities first - prioritize exact matches
    for (const city of cities) {
      if (results.length >= limit) break;
      
      const cityName = city.name.toLowerCase();
      const cityNameTranslated = city.name_translations[locale as keyof typeof city.name_translations]?.toLowerCase() || cityName;
      const cityCode = city.code.toLowerCase();
      
      // Check for exact matches first
      if (cityCode === queryLower || cityName === queryLower || cityNameTranslated === queryLower) {
        results.unshift({
          type: 'city',
          code: city.code,
          name: city.name_translations[locale as keyof typeof city.name_translations] || city.name,
          country_name: city.country_name,
          country_code: city.country_code,
          coordinates: city.coordinates,
          display_name: `${city.name_translations[locale as keyof typeof city.name_translations] || city.name}, ${city.country_name}`
        });
      }
      // Then check for partial matches
      else if (cityName.includes(queryLower) || cityNameTranslated.includes(queryLower) || cityCode.includes(queryLower)) {
        results.push({
          type: 'city',
          code: city.code,
          name: city.name_translations[locale as keyof typeof city.name_translations] || city.name,
          country_name: city.country_name,
          country_code: city.country_code,
          coordinates: city.coordinates,
          display_name: `${city.name_translations[locale as keyof typeof city.name_translations] || city.name}, ${city.country_name}`
        });
      }
    }

    // Search in airports if we haven't reached the limit
    if (results.length < limit) {
      for (const airport of airports) {
        if (results.length >= limit) break;
        
        if (!airport.flightable) continue; // Skip non-flightable airports
        
        const airportName = airport.name.toLowerCase();
        const airportNameTranslated = airport.name_translations[locale as keyof typeof airport.name_translations]?.toLowerCase() || airportName;
        const cityName = airport.city_name.toLowerCase();
        const airportCode = airport.code.toLowerCase();
        
        // Check for exact matches first
        if (airportCode === queryLower || airportName === queryLower || airportNameTranslated === queryLower) {
          results.unshift({
            type: 'airport',
            code: airport.code,
            name: airport.name_translations[locale as keyof typeof airport.name_translations] || airport.name,
            city_name: airport.city_name,
            country_name: airport.country_name,
            country_code: airport.country_code,
            coordinates: airport.coordinates,
            display_name: `${airport.city_name}, ${airport.country_name} (${airport.code})`
          });
        }
        // Then check for partial matches
        else if (airportName.includes(queryLower) || 
                 airportNameTranslated.includes(queryLower) || 
                 cityName.includes(queryLower) ||
                 airportCode.includes(queryLower)) {
          
          results.push({
            type: 'airport',
            code: airport.code,
            name: airport.name_translations[locale as keyof typeof airport.name_translations] || airport.name,
            city_name: airport.city_name,
            country_name: airport.country_name,
            country_code: airport.country_code,
            coordinates: airport.coordinates,
            display_name: `${airport.city_name}, ${airport.country_name} (${airport.code})`
          });
        }
      }
    }

    // Sort results: exact matches first, then by type (cities first), then alphabetically
    results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === queryLower || a.code.toLowerCase() === queryLower;
      const bExact = b.name.toLowerCase() === queryLower || b.code.toLowerCase() === queryLower;
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Prioritize cities over airports for general searches
      if (a.type === 'city' && b.type === 'airport') return -1;
      if (a.type === 'airport' && b.type === 'city') return 1;
      
      return a.name.localeCompare(b.name);
    });

    const finalResults = results.slice(0, limit);
    
    console.log(`✅ Found ${finalResults.length} results for "${query}"`);
    console.log('📋 Sample results:', finalResults.slice(0, 3).map(r => `${r.display_name} (${r.type})`));

    return new Response(
      JSON.stringify({
        success: true,
        results: finalResults,
        total: finalResults.length,
        query: query,
        locale: locale
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Autocomplete error:', error);
    console.error('Error details:', error.message);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        results: [],
        total: 0,
        query: '',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
