
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
  console.log('🚀 Aviasales Autocomplete API iniciada');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('query') || '';
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const locale = url.searchParams.get('locale') || 'en';

    console.log(`🔍 Buscando: "${query}" (limit: ${limit}, locale: ${locale})`);

    if (query.length < 2) {
      console.log('❌ Query muy corto');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Query must be at least 2 characters',
          results: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch data from Aviasales API
    console.log('📡 Obteniendo datos de Aviasales...');
    const [citiesResponse, airportsResponse] = await Promise.all([
      fetch(`https://api.travelpayouts.com/data/${locale}/cities.json`),
      fetch(`https://api.travelpayouts.com/data/${locale}/airports.json`)
    ]);

    if (!citiesResponse.ok || !airportsResponse.ok) {
      console.error('❌ Error al obtener datos de Aviasales API');
      console.error('Cities response:', citiesResponse.status, citiesResponse.statusText);
      console.error('Airports response:', airportsResponse.status, airportsResponse.statusText);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch data from Aviasales API',
          results: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cities: AviasalesCity[] = await citiesResponse.json();
    const airports: AviasalesAirport[] = await airportsResponse.json();

    console.log(`📊 Cargadas ${cities.length} ciudades y ${airports.length} aeropuertos`);

    const queryLower = query.toLowerCase();
    const results: AutocompleteResult[] = [];

    // Buscar en ciudades
    for (const city of cities) {
      if (results.length >= limit) break;
      
      const cityName = city.name.toLowerCase();
      const cityNameTranslated = city.name_translations[locale as keyof typeof city.name_translations]?.toLowerCase() || cityName;
      
      if (cityName.includes(queryLower) || 
          cityNameTranslated.includes(queryLower) || 
          city.code.toLowerCase().includes(queryLower)) {
        
        results.push({
          type: 'city',
          code: city.code,
          name: city.name_translations[locale as keyof typeof city.name_translations] || city.name,
          country_name: city.country_name,
          country_code: city.country_code,
          coordinates: {
            lat: city.coordinates.lat,
            lon: city.coordinates.lon
          },
          display_name: `${city.name_translations[locale as keyof typeof city.name_translations] || city.name}, ${city.country_name}`
        });
      }
    }

    // Buscar en aeropuertos (solo si no hemos alcanzado el límite)
    if (results.length < limit) {
      for (const airport of airports) {
        if (results.length >= limit) break;
        if (!airport.flightable) continue; // Skip non-flightable airports
        
        const airportName = airport.name.toLowerCase();
        const airportNameTranslated = airport.name_translations[locale as keyof typeof airport.name_translations]?.toLowerCase() || airportName;
        const cityName = airport.city_name.toLowerCase();
        
        if (airportName.includes(queryLower) || 
            airportNameTranslated.includes(queryLower) || 
            cityName.includes(queryLower) ||
            airport.code.toLowerCase().includes(queryLower)) {
          
          results.push({
            type: 'airport',
            code: airport.code,
            name: airport.name_translations[locale as keyof typeof airport.name_translations] || airport.name,
            city_name: airport.city_name,
            country_name: airport.country_name,
            country_code: airport.country_code,
            coordinates: {
              lat: airport.coordinates.lat,
              lon: airport.coordinates.lon
            },
            display_name: `${airport.city_name}, ${airport.country_name} (${airport.code})`
          });
        }
      }
    }

    // Ordenar resultados: coincidencias exactas primero, luego por relevancia
    results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === queryLower || a.code.toLowerCase() === queryLower;
      const bExact = b.name.toLowerCase() === queryLower || b.code.toLowerCase() === queryLower;
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Priorizar aeropuertos sobre ciudades para búsquedas específicas
      if (a.type === 'airport' && b.type === 'city') return -1;
      if (a.type === 'city' && b.type === 'airport') return 1;
      
      return a.name.localeCompare(b.name);
    });

    console.log(`✅ Encontrados ${results.length} resultados`);

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
    console.error('💥 Error en autocomplete:', error);
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
