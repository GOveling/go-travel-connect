import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WorldCity {
  id: string;
  city_name: string;
  country_name: string;
  country_code: string;
  iata_code: string;
  airport_name: string;
  latitude?: number;
  longitude?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🌍 World Cities API - Processing request...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let action, query, limit;
    
    if (req.method === 'POST') {
      // Datos del body para POST
      const body = await req.json();
      action = body.action || 'search';
      query = body.query || '';
      limit = parseInt(body.limit || '10');
    } else {
      // Parámetros de URL para GET
      const url = new URL(req.url);
      action = url.searchParams.get('action') || 'search';
      query = url.searchParams.get('query') || '';
      limit = parseInt(url.searchParams.get('limit') || '10');
    }

    console.log(`📍 Action: ${action}, Query: "${query}", Limit: ${limit}`);

    switch (action) {
      case 'search':
        if (query.length < 2) {
          return new Response(
            JSON.stringify({ 
              error: 'Query must be at least 2 characters long',
              suggestions: []
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400
            }
          );
        }

        // Búsqueda avanzada con texto completo y similitud
        const { data: searchResults, error: searchError } = await supabase
          .from('world_cities')
          .select('*')
          .or(`city_name.ilike.%${query}%,country_name.ilike.%${query}%,airport_name.ilike.%${query}%,iata_code.ilike.%${query}%`)
          .order('city_name')
          .limit(limit);

        if (searchError) {
          console.error('❌ Search error:', searchError);
          return new Response(
            JSON.stringify({ error: 'Search failed', details: searchError.message }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            }
          );
        }

        // Agrupar por ciudad y país
        const groupedResults = searchResults?.reduce((acc, city) => {
          const key = `${city.city_name}-${city.country_name}`;
          if (!acc[key]) {
            acc[key] = {
              city: city.city_name,
              country: city.country_name,
              country_code: city.country_code,
              airports: []
            };
          }
          acc[key].airports.push({
            iata: city.iata_code,
            name: city.airport_name,
            latitude: city.latitude,
            longitude: city.longitude
          });
          return acc;
        }, {} as Record<string, any>) || {};

        const suggestions = Object.values(groupedResults).slice(0, limit);

        console.log(`✅ Found ${suggestions.length} city groups with ${searchResults?.length || 0} total airports`);

        return new Response(
          JSON.stringify({ 
            suggestions,
            total: suggestions.length,
            query: query
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'get-by-iata':
        const iataCode = query.toUpperCase();
        
        const { data: iataResult, error: iataError } = await supabase
          .from('world_cities')
          .select('*')
          .eq('iata_code', iataCode)
          .single();

        if (iataError) {
          console.error('❌ IATA lookup error:', iataError);
          return new Response(
            JSON.stringify({ error: 'IATA code not found', code: iataCode }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 404
            }
          );
        }

        return new Response(
          JSON.stringify({ 
            city: iataResult,
            found: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'populate':
        // Función para poblar la base de datos con datos de ejemplo
        const sampleCities = [
          // España
          { city_name: 'Madrid', country_name: 'España', country_code: 'ES', iata_code: 'MAD', airport_name: 'Adolfo Suárez Madrid-Barajas Airport', latitude: 40.4719, longitude: -3.5626 },
          { city_name: 'Barcelona', country_name: 'España', country_code: 'ES', iata_code: 'BCN', airport_name: 'Barcelona-El Prat Airport', latitude: 41.2971, longitude: 2.0785 },
          { city_name: 'Sevilla', country_name: 'España', country_code: 'ES', iata_code: 'SVQ', airport_name: 'Sevilla Airport', latitude: 37.4180, longitude: -5.8931 },
          
          // Francia
          { city_name: 'París', country_name: 'Francia', country_code: 'FR', iata_code: 'CDG', airport_name: 'Charles de Gaulle Airport', latitude: 49.0097, longitude: 2.5479 },
          { city_name: 'París', country_name: 'Francia', country_code: 'FR', iata_code: 'ORY', airport_name: 'Orly Airport', latitude: 48.7262, longitude: 2.3659 },
          { city_name: 'Lyon', country_name: 'Francia', country_code: 'FR', iata_code: 'LYS', airport_name: 'Lyon-Saint Exupéry Airport', latitude: 45.7256, longitude: 5.0811 },
          
          // Reino Unido
          { city_name: 'Londres', country_name: 'Reino Unido', country_code: 'GB', iata_code: 'LHR', airport_name: 'Heathrow Airport', latitude: 51.4700, longitude: -0.4543 },
          { city_name: 'Londres', country_name: 'Reino Unido', country_code: 'GB', iata_code: 'LGW', airport_name: 'Gatwick Airport', latitude: 51.1481, longitude: -0.1903 },
          { city_name: 'Londres', country_name: 'Reino Unido', country_code: 'GB', iata_code: 'STN', airport_name: 'Stansted Airport', latitude: 51.8860, longitude: 0.2389 },
          
          // Estados Unidos
          { city_name: 'Nueva York', country_name: 'Estados Unidos', country_code: 'US', iata_code: 'JFK', airport_name: 'John F. Kennedy International Airport', latitude: 40.6413, longitude: -73.7781 },
          { city_name: 'Nueva York', country_name: 'Estados Unidos', country_code: 'US', iata_code: 'LGA', airport_name: 'LaGuardia Airport', latitude: 40.7769, longitude: -73.8740 },
          { city_name: 'Nueva York', country_name: 'Estados Unidos', country_code: 'US', iata_code: 'EWR', airport_name: 'Newark Liberty International Airport', latitude: 40.6895, longitude: -74.1745 },
          { city_name: 'Los Angeles', country_name: 'Estados Unidos', country_code: 'US', iata_code: 'LAX', airport_name: 'Los Angeles International Airport', latitude: 33.9425, longitude: -118.4081 },
          
          // Chile
          { city_name: 'Santiago', country_name: 'Chile', country_code: 'CL', iata_code: 'SCL', airport_name: 'Arturo Merino Benítez International Airport', latitude: -33.3927, longitude: -70.7854 },
          { city_name: 'Antofagasta', country_name: 'Chile', country_code: 'CL', iata_code: 'ANF', airport_name: 'Andrés Sabella Gálvez International Airport', latitude: -23.4445, longitude: -70.4451 },
          
          // Argentina  
          { city_name: 'Buenos Aires', country_name: 'Argentina', country_code: 'AR', iata_code: 'EZE', airport_name: 'Ezeiza International Airport', latitude: -34.8222, longitude: -58.5358 },
          { city_name: 'Buenos Aires', country_name: 'Argentina', country_code: 'AR', iata_code: 'AEP', airport_name: 'Jorge Newbery Airfield', latitude: -34.5592, longitude: -58.4156 },
          
          // México
          { city_name: 'Ciudad de México', country_name: 'México', country_code: 'MX', iata_code: 'MEX', airport_name: 'Mexico City International Airport', latitude: 19.4363, longitude: -99.0721 },
          { city_name: 'Cancún', country_name: 'México', country_code: 'MX', iata_code: 'CUN', airport_name: 'Cancún International Airport', latitude: 21.0365, longitude: -86.8771 },
          
          // Brasil
          { city_name: 'São Paulo', country_name: 'Brasil', country_code: 'BR', iata_code: 'GRU', airport_name: 'São Paulo-Guarulhos International Airport', latitude: -23.4356, longitude: -46.4731 },
          { city_name: 'Río de Janeiro', country_name: 'Brasil', country_code: 'BR', iata_code: 'GIG', airport_name: 'Rio de Janeiro-Galeão International Airport', latitude: -22.8099, longitude: -43.2505 }
        ];

        const { data: insertData, error: insertError } = await supabase
          .from('world_cities')
          .insert(sampleCities);

        if (insertError) {
          console.error('❌ Population error:', insertError);
          return new Response(
            JSON.stringify({ error: 'Failed to populate database', details: insertError.message }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            }
          );
        }

        console.log(`✅ Successfully populated database with ${sampleCities.length} cities`);

        return new Response(
          JSON.stringify({ 
            success: true,
            populated: sampleCities.length,
            message: 'Database populated successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: search, get-by-iata, or populate' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        );
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        stack: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});