import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AirportData {
  ident: string;
  type: string;
  name: string;
  elevation_ft: string;
  continent: string;
  iso_country: string;
  iso_region: string;
  municipality: string;
  scheduled_service: string;
  gps_code: string;
  iata_code: string;
  local_code: string;
  home_link: string;
  wikipedia_link: string;
  keywords: string;
}

interface WorldCity {
  city_name: string;
  country_name: string;
  country_code: string;
  iata_code: string;
  airport_name: string;
  latitude?: number;
  longitude?: number;
}

// Country code to country name mapping
const countryCodeToName: Record<string, string> = {
  'US': 'United States', 'CA': 'Canada', 'GB': 'United Kingdom', 'FR': 'France',
  'DE': 'Germany', 'IT': 'Italy', 'ES': 'Spain', 'JP': 'Japan', 'CN': 'China',
  'AU': 'Australia', 'BR': 'Brazil', 'MX': 'Mexico', 'IN': 'India', 'KR': 'South Korea',
  'RU': 'Russia', 'AR': 'Argentina', 'CL': 'Chile', 'PE': 'Peru', 'CO': 'Colombia',
  'VE': 'Venezuela', 'EC': 'Ecuador', 'UY': 'Uruguay', 'PY': 'Paraguay', 'BO': 'Bolivia',
  'GY': 'Guyana', 'SR': 'Suriname', 'GF': 'French Guiana', 'TR': 'Turkey', 'GR': 'Greece',
  'PT': 'Portugal', 'NL': 'Netherlands', 'BE': 'Belgium', 'CH': 'Switzerland', 'AT': 'Austria',
  'SE': 'Sweden', 'NO': 'Norway', 'DK': 'Denmark', 'FI': 'Finland', 'IS': 'Iceland',
  'IE': 'Ireland', 'PL': 'Poland', 'CZ': 'Czech Republic', 'SK': 'Slovakia', 'HU': 'Hungary',
  'RO': 'Romania', 'BG': 'Bulgaria', 'HR': 'Croatia', 'SI': 'Slovenia', 'RS': 'Serbia',
  'BA': 'Bosnia and Herzegovina', 'ME': 'Montenegro', 'MK': 'North Macedonia', 'AL': 'Albania',
  'XK': 'Kosovo', 'MD': 'Moldova', 'UA': 'Ukraine', 'BY': 'Belarus', 'LT': 'Lithuania',
  'LV': 'Latvia', 'EE': 'Estonia', 'MT': 'Malta', 'CY': 'Cyprus', 'LU': 'Luxembourg',
  'AD': 'Andorra', 'MC': 'Monaco', 'SM': 'San Marino', 'VA': 'Vatican City', 'LI': 'Liechtenstein'
};

function getCountryName(code: string): string {
  return countryCodeToName[code] || code;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🚀 Starting airport data import...');

    // Download CSV from DataHub
    const csvUrl = 'https://datahub.io/core/airport-codes/_r/-/data/airport-codes.csv';
    console.log('📥 Downloading CSV from:', csvUrl);
    
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to download CSV: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    
    console.log(`📊 Processing ${lines.length} lines...`);
    
    // Skip header and process data
    const header = lines[0];
    const dataLines = lines.slice(1);
    
    const worldCities: WorldCity[] = [];
    let processedCount = 0;
    
    for (const line of dataLines) {
      try {
        const fields = parseCSVLine(line);
        
        // Map fields according to the CSV structure
        const airport: Partial<AirportData> = {
          ident: fields[0]?.replace(/"/g, '') || '',
          type: fields[1]?.replace(/"/g, '') || '',
          name: fields[2]?.replace(/"/g, '') || '',
          elevation_ft: fields[3]?.replace(/"/g, '') || '',
          continent: fields[4]?.replace(/"/g, '') || '',
          iso_country: fields[5]?.replace(/"/g, '') || '',
          iso_region: fields[6]?.replace(/"/g, '') || '',
          municipality: fields[7]?.replace(/"/g, '') || '',
          scheduled_service: fields[8]?.replace(/"/g, '') || '',
          gps_code: fields[9]?.replace(/"/g, '') || '',
          iata_code: fields[10]?.replace(/"/g, '') || '',
          local_code: fields[11]?.replace(/"/g, '') || '',
        };
        
        // Only process airports with IATA codes and cities
        if (airport.iata_code && airport.iata_code.length === 3 && airport.municipality) {
          const worldCity: WorldCity = {
            city_name: airport.municipality.toLowerCase(),
            country_name: getCountryName(airport.iso_country || ''),
            country_code: airport.iso_country || '',
            iata_code: airport.iata_code,
            airport_name: airport.name || '',
          };
          
          worldCities.push(worldCity);
          processedCount++;
        }
      } catch (error) {
        console.warn('⚠️ Error processing line:', error);
        continue;
      }
    }
    
    console.log(`✅ Processed ${processedCount} airports with IATA codes`);
    
    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    const { error: deleteError } = await supabase
      .from('world_cities')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
    
    if (deleteError) {
      console.error('❌ Error clearing data:', deleteError);
    }
    
    // Insert in batches
    const batchSize = 1000;
    let insertedCount = 0;
    
    for (let i = 0; i < worldCities.length; i += batchSize) {
      const batch = worldCities.slice(i, i + batchSize);
      
      console.log(`📤 Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(worldCities.length / batchSize)}...`);
      
      const { error: insertError } = await supabase
        .from('world_cities')
        .insert(batch);
      
      if (insertError) {
        console.error('❌ Error inserting batch:', insertError);
        throw insertError;
      }
      
      insertedCount += batch.length;
    }
    
    console.log(`🎉 Successfully imported ${insertedCount} airports!`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully imported ${insertedCount} airports`,
        processed: processedCount,
        inserted: insertedCount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});