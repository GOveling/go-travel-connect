
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapping from our filter categories to Google Place Types
const CATEGORY_TO_GOOGLE_TYPES: { [key: string]: string[] } = {
  'restaurant': ['restaurant', 'meal_takeaway', 'food'],
  'hotel': ['lodging'],
  'attraction': ['tourist_attraction', 'museum', 'amusement_park', 'zoo'],
  'shopping': ['shopping_mall', 'store', 'clothing_store', 'electronics_store'],
  'entertainment': ['night_club', 'movie_theater', 'casino', 'bowling_alley'],
  'transport': ['transit_station', 'airport', 'bus_station', 'subway_station'],
  'health': ['hospital', 'pharmacy', 'doctor', 'dentist'],
  'education': ['school', 'university', 'library'],
  'landmark': ['landmark', 'point_of_interest'],
  'museum': ['museum'],
  'park': ['park'],
  'beach': ['natural_feature'],
  'lake': ['natural_feature']
};

interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  rating?: number;
  price_level?: number;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  photos?: Array<{ photo_reference: string; width: number; height: number; }>;
  types: string[];
  business_status?: string;
  formatted_phone_number?: string;
  website?: string;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }>;
}

interface EnhancedPlace {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  rating?: number;
  category: string;
  image?: string;
  description?: string;
  hours?: string;
  phone?: string;
  website?: string;
  priceLevel?: number;
  confidence_score: number;
  geocoded: boolean;
  business_status?: string;
  photos?: string[];
  reviews_count?: number;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
}

async function searchPlacesWithGoogle(
  query: string,
  selectedCategories: string[],
  googleApiKey: string
): Promise<EnhancedPlace[]> {
  const results: EnhancedPlace[] = [];
  
  try {
    // If we have specific categories, search with those types
    if (selectedCategories.length > 0) {
      for (const category of selectedCategories) {
        const googleTypes = CATEGORY_TO_GOOGLE_TYPES[category] || [];
        
        for (const type of googleTypes) {
          const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&type=${type}&key=${googleApiKey}`;
          
          const response = await fetch(searchUrl);
          const data = await response.json();
          
          if (data.status === 'OK' && data.results) {
            for (const place of data.results.slice(0, 3)) { // Limit per type
              // Get detailed information
              const details = await getPlaceDetails(place.place_id, googleApiKey);
              const enhancedPlace = convertToEnhancedPlace(place, details, category);
              
              // Avoid duplicates by place_id
              if (!results.some(r => r.id === enhancedPlace.id)) {
                results.push(enhancedPlace);
              }
            }
          }
          
          // Rate limiting - wait between requests
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } else {
      // General text search without specific types
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${googleApiKey}`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results) {
        for (const place of data.results.slice(0, 10)) {
          const details = await getPlaceDetails(place.place_id, googleApiKey);
          const category = inferCategoryFromTypes(place.types);
          const enhancedPlace = convertToEnhancedPlace(place, details, category);
          results.push(enhancedPlace);
        }
      }
    }
    
    console.log(`Found ${results.length} places with Google Places API`);
    return results;
    
  } catch (error) {
    console.error('Error searching with Google Places:', error);
    throw error;
  }
}

async function getPlaceDetails(placeId: string, googleApiKey: string): Promise<GooglePlaceResult | null> {
  try {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,rating,price_level,opening_hours,photos,types,business_status,formatted_phone_number,website,reviews&key=${googleApiKey}`;
    
    const response = await fetch(detailsUrl);
    const data = await response.json();
    
    if (data.status === 'OK' && data.result) {
      return data.result;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
}

function convertToEnhancedPlace(
  place: GooglePlaceResult,
  details: GooglePlaceResult | null,
  category: string
): EnhancedPlace {
  const fullDetails = details || place;
  
  return {
    id: place.place_id,
    name: fullDetails.name,
    address: fullDetails.formatted_address,
    coordinates: {
      lat: fullDetails.geometry.location.lat,
      lng: fullDetails.geometry.location.lng
    },
    rating: fullDetails.rating,
    category: category,
    description: `${fullDetails.name} in ${fullDetails.formatted_address}`,
    hours: fullDetails.opening_hours?.open_now ? "Open now" : "Hours vary",
    phone: fullDetails.formatted_phone_number,
    website: fullDetails.website,
    priceLevel: fullDetails.price_level,
    confidence_score: 95, // Google Places has high confidence
    geocoded: true,
    business_status: fullDetails.business_status,
    photos: fullDetails.photos?.map(photo => 
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${Deno.env.get('GOOGLE_PLACES_API_KEY')}`
    ),
    reviews_count: fullDetails.reviews?.length || 0,
    opening_hours: fullDetails.opening_hours
  };
}

function inferCategoryFromTypes(types: string[]): string {
  const typeMapping: { [key: string]: string } = {
    'restaurant': 'restaurant',
    'food': 'restaurant',
    'meal_takeaway': 'restaurant',
    'lodging': 'hotel',
    'tourist_attraction': 'attraction',
    'museum': 'attraction',
    'shopping_mall': 'shopping',
    'store': 'shopping',
    'hospital': 'health',
    'school': 'education',
    'park': 'attraction',
    'transit_station': 'transport',
    'point_of_interest': 'attraction'
  };
  
  for (const type of types) {
    if (typeMapping[type]) {
      return typeMapping[type];
    }
  }
  
  return 'attraction'; // Default category
}

// Fallback to Gemini if Google Places fails or returns insufficient results
async function fallbackToGemini(
  query: string,
  selectedCategories: string[]
): Promise<EnhancedPlace[]> {
  try {
    const geminiResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/gemini-places`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        input: query,
        selectedCategories
      })
    });
    
    const geminiData = await geminiResponse.json();
    
    if (geminiData.predictions) {
      return geminiData.predictions.map((prediction: any) => ({
        id: prediction.place_id,
        name: prediction.structured_formatting.main_text,
        address: prediction.full_address,
        coordinates: prediction.coordinates,
        rating: prediction.confidence_score >= 90 ? 4.5 : 4.0,
        category: prediction.types[0]?.replace(/_/g, ' ') || 'attraction',
        description: prediction.place_description,
        hours: "Hours vary",
        phone: prediction.phone,
        priceLevel: 2,
        confidence_score: prediction.confidence_score,
        geocoded: prediction.geocoded
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Fallback to Gemini failed:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input, selectedCategories = [] } = await req.json();
    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    
    if (!input || input.trim().length < 2) {
      return new Response(JSON.stringify({
        predictions: [],
        status: "OK"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Enhanced search for:', input, 'Categories:', selectedCategories);

    let results: EnhancedPlace[] = [];
    
    // Try Google Places API first
    if (googleApiKey) {
      try {
        results = await searchPlacesWithGoogle(input, selectedCategories, googleApiKey);
        console.log(`Google Places returned ${results.length} results`);
      } catch (error) {
        console.error('Google Places API error:', error);
      }
    }
    
    // If Google Places didn't return enough results, fallback to Gemini
    if (results.length < 3) {
      console.log('Using Gemini fallback for additional results');
      const geminiResults = await fallbackToGemini(input, selectedCategories);
      
      // Merge results, avoiding duplicates
      for (const geminiResult of geminiResults) {
        if (!results.some(r => r.id === geminiResult.id)) {
          results.push(geminiResult);
        }
      }
    }
    
    // Sort by confidence score and rating
    results.sort((a, b) => {
      const scoreA = (a.confidence_score || 0) + (a.rating || 0) * 10;
      const scoreB = (b.confidence_score || 0) + (b.rating || 0) * 10;
      return scoreB - scoreA;
    });

    return new Response(JSON.stringify({
      predictions: results.slice(0, 15), // Limit final results
      status: "OK",
      source: googleApiKey ? "google_places_enhanced" : "gemini_fallback"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhanced places search:', error);
    return new Response(JSON.stringify({
      error: error.message,
      predictions: [],
      status: "ERROR"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
