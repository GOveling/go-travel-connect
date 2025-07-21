
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CityResult {
  name: string;
  full_address: string;
  coordinates: { lat: number; lng: number };
  type: string;
  country_code: string;
  admin_name?: string;
}

async function searchCitiesByCountry(query: string, countryCode: string): Promise<CityResult[]> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log(`Searching for cities in ${countryCode} with query: ${query}`);
    
    // Query the all_cities table (note: it's actually named "all_citites" due to the typo)
    const { data, error } = await supabase
      .from('all_cities')
      .select('city, admin_name, country, iso2, lat, lng, population')
      .eq('iso2', countryCode)
      .or(`city.ilike.%${query}%,admin_name.ilike.%${query}%`)
      .order('population', { ascending: false, nullsFirst: false })
      .limit(10);

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} cities/states for ${countryCode}`);
    
    const results: CityResult[] = [];
    
    if (data) {
      for (const city of data) {
        // Add cities
        if (city.city) {
          results.push({
            name: city.city,
            full_address: `${city.city}${city.admin_name ? `, ${city.admin_name}` : ''}, ${city.country || countryCode}`,
            coordinates: {
              lat: city.lat || 0,
              lng: city.lng || 0
            },
            type: 'locality',
            country_code: countryCode,
            admin_name: city.admin_name || undefined
          });
        }
        
        // Add admin areas (states/provinces) if different from city and not already added
        if (city.admin_name && city.admin_name !== city.city) {
          const isDuplicate = results.some(r => r.name === city.admin_name);
          if (!isDuplicate) {
            results.push({
              name: city.admin_name,
              full_address: `${city.admin_name}, ${city.country || countryCode}`,
              coordinates: {
                lat: city.lat || 0,
                lng: city.lng || 0
              },
              type: 'administrative_area_level_1',
              country_code: countryCode,
              admin_name: city.admin_name
            });
          }
        }
      }
    }

    // Remove duplicates and limit to 8 results
    const uniqueResults = results.filter((result, index, self) => 
      index === self.findIndex(r => r.name === result.name)
    ).slice(0, 8);

    return uniqueResults;
    
  } catch (error) {
    console.error('Error searching cities:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, countryCode } = await req.json();
    
    if (!query || query.trim().length < 2) {
      return new Response(JSON.stringify({
        cities: [],
        status: "OK"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!countryCode) {
      return new Response(JSON.stringify({
        error: 'Country code is required',
        cities: [],
        status: "ERROR"
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Cities search for:', query, 'Country:', countryCode);

    const cities = await searchCitiesByCountry(query, countryCode);

    return new Response(JSON.stringify({
      cities,
      status: "OK"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in cities search:', error);
    return new Response(JSON.stringify({
      error: error.message,
      cities: [],
      status: "ERROR"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
