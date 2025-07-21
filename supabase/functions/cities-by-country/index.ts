
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
}

// Mapping from country ISO codes to country names for filtering
const COUNTRY_NAMES: { [key: string]: string[] } = {
  'US': ['United States', 'USA', 'US'],
  'CA': ['Canada', 'CA'],
  'MX': ['Mexico', 'MX'],
  'BR': ['Brazil', 'BR'],
  'AR': ['Argentina', 'AR'],
  'CL': ['Chile', 'CL'],
  'CO': ['Colombia', 'CO'],
  'PE': ['Peru', 'PE'],
  'VE': ['Venezuela', 'VE'],
  'EC': ['Ecuador', 'EC'],
  'UY': ['Uruguay', 'UY'],
  'PY': ['Paraguay', 'PY'],
  'BO': ['Bolivia', 'BO'],
  'GY': ['Guyana', 'GY'],
  'SR': ['Suriname', 'SR'],
  'GF': ['French Guiana', 'GF'],
  'ES': ['Spain', 'ES'],
  'FR': ['France', 'FR'],
  'DE': ['Germany', 'DE'],
  'IT': ['Italy', 'IT'],
  'PT': ['Portugal', 'PT'],
  'GB': ['United Kingdom', 'UK', 'GB'],
  'IE': ['Ireland', 'IE'],
  'NL': ['Netherlands', 'NL'],
  'BE': ['Belgium', 'BE'],
  'CH': ['Switzerland', 'CH'],
  'AT': ['Austria', 'AT'],
  'SE': ['Sweden', 'SE'],
  'NO': ['Norway', 'NO'],
  'DK': ['Denmark', 'DK'],
  'FI': ['Finland', 'FI'],
  'IS': ['Iceland', 'IS'],
  'PL': ['Poland', 'PL'],
  'CZ': ['Czech Republic', 'CZ'],
  'SK': ['Slovakia', 'SK'],
  'HU': ['Hungary', 'HU'],
  'RO': ['Romania', 'RO'],
  'BG': ['Bulgaria', 'BG'],
  'HR': ['Croatia', 'HR'],
  'SI': ['Slovenia', 'SI'],
  'RS': ['Serbia', 'RS'],
  'BA': ['Bosnia and Herzegovina', 'BA'],
  'ME': ['Montenegro', 'ME'],
  'MK': ['North Macedonia', 'MK'],
  'AL': ['Albania', 'AL'],
  'GR': ['Greece', 'GR'],
  'TR': ['Turkey', 'TR'],
  'RU': ['Russia', 'RU'],
  'UA': ['Ukraine', 'UA'],
  'BY': ['Belarus', 'BY'],
  'MD': ['Moldova', 'MD'],
  'LT': ['Lithuania', 'LT'],
  'LV': ['Latvia', 'LV'],
  'EE': ['Estonia', 'EE'],
  'JP': ['Japan', 'JP'],
  'CN': ['China', 'CN'],
  'KR': ['South Korea', 'KR'],
  'TH': ['Thailand', 'TH'],
  'VN': ['Vietnam', 'VN'],
  'PH': ['Philippines', 'PH'],
  'ID': ['Indonesia', 'ID'],
  'MY': ['Malaysia', 'MY'],
  'SG': ['Singapore', 'SG'],
  'IN': ['India', 'IN'],
  'PK': ['Pakistan', 'PK'],
  'BD': ['Bangladesh', 'BD'],
  'LK': ['Sri Lanka', 'LK'],
  'AU': ['Australia', 'AU'],
  'NZ': ['New Zealand', 'NZ'],
  'ZA': ['South Africa', 'ZA'],
  'EG': ['Egypt', 'EG'],
  'MA': ['Morocco', 'MA'],
  'TN': ['Tunisia', 'TN'],
  'DZ': ['Algeria', 'DZ'],
  'LY': ['Libya', 'LY'],
  'SD': ['Sudan', 'SD'],
  'ET': ['Ethiopia', 'ET'],
  'KE': ['Kenya', 'KE'],
  'TZ': ['Tanzania', 'TZ'],
  'UG': ['Uganda', 'UG'],
  'RW': ['Rwanda', 'RW'],
  'GH': ['Ghana', 'GH'],
  'NG': ['Nigeria', 'NG'],
  'SN': ['Senegal', 'SN'],
  'CI': ['Ivory Coast', 'CI'],
  'CM': ['Cameroon', 'CM'],
  'AO': ['Angola', 'AO'],
  'MZ': ['Mozambique', 'MZ'],
  'ZW': ['Zimbabwe', 'ZW'],
  'ZM': ['Zambia', 'ZM'],
  'BW': ['Botswana', 'BW'],
  'NA': ['Namibia', 'NA'],
  'SZ': ['Eswatini', 'SZ'],
  'LS': ['Lesotho', 'LS'],
  'MG': ['Madagascar', 'MG'],
  'MU': ['Mauritius', 'MU'],
  'RE': ['Réunion', 'RE'],
  'SC': ['Seychelles', 'SC']
};

async function searchCitiesByCountry(query: string, countryCode: string, googleApiKey: string): Promise<CityResult[]> {
  const results: CityResult[] = [];
  const countryNames = COUNTRY_NAMES[countryCode] || [countryCode];
  
  try {
    console.log(`Searching for cities in ${countryCode} with query: ${query}`);
    
    // Use Google Places New API for city search
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': googleApiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.addressComponents'
      },
      body: JSON.stringify({
        textQuery: `${query} ${countryNames[0]}`,
        includedType: 'locality',
        locationBias: {
          rectangle: {
            low: { latitude: -90, longitude: -180 },
            high: { latitude: 90, longitude: 180 }
          }
        },
        languageCode: 'en',
        maxResultCount: 10
      })
    });

    const data = await response.json();

    if (data.places && data.places.length > 0) {
      for (const place of data.places) {
        // Filter results to ensure they belong to the selected country
        const addressComponents = place.addressComponents || [];
        const countryComponent = addressComponents.find((comp: any) => 
          comp.types.includes('country')
        );
        
        const placeCountry = countryComponent?.shortText || countryComponent?.longText || '';
        const isInSelectedCountry = countryNames.some(name => 
          placeCountry.toLowerCase().includes(name.toLowerCase()) ||
          place.formattedAddress.toLowerCase().includes(name.toLowerCase())
        );

        if (isInSelectedCountry) {
          results.push({
            name: place.displayName?.text || 'Unknown City',
            full_address: place.formattedAddress || '',
            coordinates: {
              lat: place.location?.latitude || 0,
              lng: place.location?.longitude || 0
            },
            type: 'locality',
            country_code: countryCode
          });
        }
      }
    }

    // Also search for administrative areas (states/provinces)
    const stateResponse = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': googleApiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.addressComponents'
      },
      body: JSON.stringify({
        textQuery: `${query} ${countryNames[0]}`,
        includedType: 'administrative_area_level_1',
        locationBias: {
          rectangle: {
            low: { latitude: -90, longitude: -180 },
            high: { latitude: 90, longitude: 180 }
          }
        },
        languageCode: 'en',
        maxResultCount: 5
      })
    });

    const stateData = await stateResponse.json();

    if (stateData.places && stateData.places.length > 0) {
      for (const place of stateData.places) {
        const addressComponents = place.addressComponents || [];
        const countryComponent = addressComponents.find((comp: any) => 
          comp.types.includes('country')
        );
        
        const placeCountry = countryComponent?.shortText || countryComponent?.longText || '';
        const isInSelectedCountry = countryNames.some(name => 
          placeCountry.toLowerCase().includes(name.toLowerCase()) ||
          place.formattedAddress.toLowerCase().includes(name.toLowerCase())
        );

        if (isInSelectedCountry) {
          // Avoid duplicates
          const isDuplicate = results.some(r => r.name === place.displayName?.text);
          if (!isDuplicate) {
            results.push({
              name: place.displayName?.text || 'Unknown State',
              full_address: place.formattedAddress || '',
              coordinates: {
                lat: place.location?.latitude || 0,
                lng: place.location?.longitude || 0
              },
              type: 'administrative_area_level_1',
              country_code: countryCode
            });
          }
        }
      }
    }

    console.log(`Found ${results.length} cities/states for ${countryCode}`);
    return results;
    
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
    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    
    if (!googleApiKey) {
      console.error('Google Places API key not found');
      return new Response(
        JSON.stringify({ error: 'Google Places API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    const cities = await searchCitiesByCountry(query, countryCode, googleApiKey);

    return new Response(JSON.stringify({
      cities: cities.slice(0, 8), // Limit results
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
