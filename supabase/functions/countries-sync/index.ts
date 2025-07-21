import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RestCountry {
  cca2: string;
  name: {
    common: string;
  };
  idd?: {
    root?: string;
    suffixes?: string[];
  };
  region?: string;
  subregion?: string;
  flags?: {
    png?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch countries from REST Countries API
    const response = await fetch('https://restcountries.com/v3.1/all?fields=cca2,name,idd,region,subregion,flags');
    
    if (!response.ok) {
      throw new Error(`REST Countries API error: ${response.status}`);
    }

    const countries: RestCountry[] = await response.json();

    // Transform data for our database
    const countryData = countries.map(country => {
      // Build phone code from idd
      let phoneCode = '';
      if (country.idd?.root) {
        phoneCode = country.idd.root;
        if (country.idd.suffixes && country.idd.suffixes.length > 0) {
          // Take the first suffix if multiple exist
          phoneCode += country.idd.suffixes[0];
        }
      }

      return {
        iso_code: country.cca2,
        name: country.name.common,
        phone_code: phoneCode,
        region: country.region || null,
        subregion: country.subregion || null,
        flag_url: country.flags?.png || null,
      };
    }).filter(country => country.phone_code); // Only include countries with phone codes

    // Clear existing data and insert new data
    const { error: deleteError } = await supabaseClient
      .from('countries')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (deleteError) {
      console.error('Error clearing countries:', deleteError);
      throw deleteError;
    }

    // Insert new data
    const { error: insertError } = await supabaseClient
      .from('countries')
      .insert(countryData);

    if (insertError) {
      console.error('Error inserting countries:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully synced ${countryData.length} countries`,
        count: countryData.length 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in countries-sync:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})