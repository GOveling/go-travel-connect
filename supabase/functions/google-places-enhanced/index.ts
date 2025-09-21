import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Mapping from our filter categories to Google Place Types
const CATEGORY_TO_GOOGLE_TYPES: { [key: string]: string[] } = {
  restaurant: ["restaurant", "meal_takeaway", "food"],
  hotel: ["lodging"],
  attraction: ["tourist_attraction", "museum", "amusement_park", "zoo"],
  shopping: ["shopping_mall", "store", "clothing_store", "electronics_store"],
  entertainment: ["night_club", "movie_theater", "casino", "bowling_alley"],
  transport: ["transit_station", "airport", "bus_station", "subway_station"],
  health: ["hospital", "pharmacy", "doctor", "dentist"],
  education: ["school", "university", "library"],
  landmark: ["landmark", "point_of_interest"],
  museum: ["museum"],
  park: ["park"],
  beach: ["natural_feature"],
  lake: ["natural_feature"],
};

// New API Place Result interface
interface NewApiPlaceResult {
  id: string;
  displayName: { text: string; languageCode: string };
  formattedAddress: string;
  location: { latitude: number; longitude: number };
  rating?: number;
  priceLevel?: string;
  currentOpeningHours?: {
    openNow: boolean;
    weekdayDescriptions: string[];
  };
  photos?: Array<{ name: string; widthPx: number; heightPx: number }>;
  types: string[];
  businessStatus?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  editorialSummary?: { text: string; languageCode: string };
  userRatingCount?: number;
}

// Legacy interface for backward compatibility
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
  photos?: Array<{ photo_reference: string; width: number; height: number }>;
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
  googleApiKey: string,
  userLocation?: { lat: number; lng: number }
): Promise<EnhancedPlace[]> {
  const results: EnhancedPlace[] = [];
  const processedPlaceIds = new Set<string>();

  try {
    // If we have specific categories, search with those types using New API
    if (selectedCategories.length > 0) {
      for (const category of selectedCategories) {
        const googleTypes = CATEGORY_TO_GOOGLE_TYPES[category] || [];

        if (googleTypes.length > 0) {
          try {
            console.log(
              `Searching for category: ${category} with query: ${query}`
            );

            const response = await fetch(
              "https://places.googleapis.com/v1/places:searchText",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Goog-Api-Key": googleApiKey,
                  "X-Goog-FieldMask":
                    "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types,places.priceLevel,places.businessStatus,places.currentOpeningHours,places.photos,places.editorialSummary,places.websiteUri,places.nationalPhoneNumber",
                },
                body: JSON.stringify({
                  textQuery: `${query} ${category}`,
                  includedType: googleTypes[0], // Use primary type for category
                  languageCode: "en",
                  maxResultCount: 8, // Increased to get more results per category
                  ...(userLocation && {
                    locationBias: { // Back to locationBias for more flexibility
                      circle: {
                        center: {
                          latitude: userLocation.lat,
                          longitude: userLocation.lng,
                        },
                        radius: 5000, // Increased to 5km for initial search
                      },
                    },
                  }),
                }),
              }
            );

            const data = await response.json();

            if (data.places && data.places.length > 0) {
              console.log(
                `Found ${data.places.length} results for category: ${category}`
              );

              for (const place of data.places) {
                if (!processedPlaceIds.has(place.id)) {
                  processedPlaceIds.add(place.id);
                  const enhancedPlace = convertNewApiToEnhancedPlace(
                    place,
                    category
                  );
                  results.push(enhancedPlace);
                }
              }
            }

            // Rate limiting
            await new Promise((resolve) => setTimeout(resolve, 200));
          } catch (error) {
            console.error(`Error searching for category ${category}:`, error);
          }
        }
      }
    } else {
      // General text search using New API
      try {
        console.log(`General search for: ${query}`);

        const response = await fetch(
          "https://places.googleapis.com/v1/places:searchText",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": googleApiKey,
              "X-Goog-FieldMask":
                "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types,places.priceLevel,places.businessStatus,places.currentOpeningHours,places.photos,places.editorialSummary,places.websiteUri,places.nationalPhoneNumber",
            },
            body: JSON.stringify({
              textQuery: query,
              languageCode: "en",
              maxResultCount: 15, // Increased for general search
              ...(userLocation && {
                locationBias: { // Back to locationBias for more flexibility
                  circle: {
                    center: {
                      latitude: userLocation.lat,
                      longitude: userLocation.lng,
                    },
                    radius: 5000, // Increased to 5km for initial search
                  },
                },
              }),
            }),
          }
        );

        const data = await response.json();

        if (data.places && data.places.length > 0) {
          console.log(`Found ${data.places.length} general results`);

          for (const place of data.places) {
            if (!processedPlaceIds.has(place.id)) {
              processedPlaceIds.add(place.id);
              const category = inferCategoryFromTypes(place.types || []);
              const enhancedPlace = convertNewApiToEnhancedPlace(
                place,
                category
              );
              results.push(enhancedPlace);
            }
          }
        }
      } catch (error) {
        console.error(`Error in general search:`, error);
      }
    }

    console.log(`Found ${results.length} places with Google Places API (New)`);
    return results;
  } catch (error) {
    console.error("Error searching with Google Places:", error);
    throw error;
  }
}

function convertNewApiToEnhancedPlace(
  place: NewApiPlaceResult,
  category: string
): EnhancedPlace {
  // Convert price level from string to number
  const priceLevelMap: { [key: string]: number } = {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  };

  return {
    id: place.id,
    name: place.displayName?.text || "Unknown Place",
    address: place.formattedAddress || "",
    coordinates: {
      lat: place.location?.latitude || 0,
      lng: place.location?.longitude || 0,
    },
    rating: place.rating,
    category: category,
    description:
      place.editorialSummary?.text ||
      `${place.displayName?.text} in ${place.formattedAddress}`,
    hours: place.currentOpeningHours?.openNow ? "Open now" : "Hours vary",
    phone: place.nationalPhoneNumber,
    website: place.websiteUri,
    priceLevel: place.priceLevel ? priceLevelMap[place.priceLevel] : undefined,
    confidence_score: 95, // Google Places has high confidence
    geocoded: true,
    business_status: place.businessStatus,
    photos: place.photos?.map(
      (photo) =>
        `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=400&key=${Deno.env.get("GOOGLE_PLACES_API_KEY")}`
    ),
    reviews_count: place.userRatingCount || 0,
    opening_hours: place.currentOpeningHours
      ? {
          open_now: place.currentOpeningHours.openNow,
          weekday_text: place.currentOpeningHours.weekdayDescriptions,
        }
      : undefined,
  };
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
      lng: fullDetails.geometry.location.lng,
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
    photos: fullDetails.photos?.map(
      (photo) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${Deno.env.get("GOOGLE_PLACES_API_KEY")}`
    ),
    reviews_count: fullDetails.reviews?.length || 0,
    opening_hours: fullDetails.opening_hours,
  };
}

function inferCategoryFromTypes(types: string[]): string {
  const typeMapping: { [key: string]: string } = {
    restaurant: "restaurant",
    food: "restaurant",
    meal_takeaway: "restaurant",
    lodging: "hotel",
    tourist_attraction: "attraction",
    museum: "attraction",
    shopping_mall: "shopping",
    store: "shopping",
    hospital: "health",
    school: "education",
    park: "attraction",
    transit_station: "transport",
    point_of_interest: "attraction",
  };

  for (const type of types) {
    if (typeMapping[type]) {
      return typeMapping[type];
    }
  }

  return "attraction"; // Default category
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Fallback to Gemini if Google Places fails or returns insufficient results
async function fallbackToGemini(
  query: string,
  selectedCategories: string[]
): Promise<EnhancedPlace[]> {
  try {
    const geminiResponse = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/gemini-places`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          input: query,
          selectedCategories,
        }),
      }
    );

    const geminiData = await geminiResponse.json();

    if (geminiData.predictions) {
      return geminiData.predictions.map((prediction: any) => ({
        id: prediction.place_id,
        name: prediction.structured_formatting.main_text,
        address: prediction.full_address,
        coordinates: prediction.coordinates,
        rating: prediction.confidence_score >= 90 ? 4.5 : 4.0,
        category: prediction.types[0]?.replace(/_/g, " ") || "attraction",
        description: prediction.place_description,
        hours: "Hours vary",
        phone: prediction.phone,
        priceLevel: 2,
        confidence_score: prediction.confidence_score,
        geocoded: prediction.geocoded,
      }));
    }

    return [];
  } catch (error) {
    console.error("Fallback to Gemini failed:", error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input, selectedCategories = [], userLocation } = await req.json();
    const googleApiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");

    if (!input || input.trim().length < 2) {
      return new Response(
        JSON.stringify({
          predictions: [],
          status: "OK",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(
      "Enhanced search for:",
      input,
      "Categories:",
      selectedCategories,
      "User location:",
      userLocation
    );

    let results: EnhancedPlace[] = [];

    // Try Google Places API first
    if (googleApiKey) {
      try {
        results = await searchPlacesWithGoogle(
          input,
          selectedCategories,
          googleApiKey,
          userLocation
        );
        console.log(`Google Places returned ${results.length} results`);
      } catch (error) {
        console.error("Google Places API error:", error);
      }
    }

    // If Google Places didn't return enough results, fallback to Gemini
    if (results.length < 5) { // Lowered threshold to allow more Google results
      console.log("Using Gemini fallback for additional results");
      const geminiResults = await fallbackToGemini(input, selectedCategories);

      // Merge results, avoiding duplicates
      for (const geminiResult of geminiResults) {
        if (!results.some((r) => r.id === geminiResult.id)) {
          results.push(geminiResult);
        }
      }
    }

    // Apply distance filter only when user explicitly wants nearby results
    // and only if we have enough results to filter from
    if (userLocation && results.length > 3) {
      const nearbyResults = results.filter(place => {
        if (!place.coordinates) return false;
        
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          place.coordinates.lat,
          place.coordinates.lng
        );
        
        return distance <= 1.0; // 1km radius for nearby results
      });
      
      // Only use filtered results if we have at least some nearby results
      // Otherwise, keep all results to ensure user gets something
      if (nearbyResults.length > 0) {
        console.log(`Filtered to ${nearbyResults.length} nearby results within 1km`);
        results = nearbyResults;
      } else {
        console.log(`No results within 1km, keeping all ${results.length} results`);
      }
    }

    // Sort by distance when user location is available, otherwise by rating
    results.sort((a, b) => {
      if (userLocation && a.coordinates && b.coordinates) {
        const distA = calculateDistance(userLocation.lat, userLocation.lng, a.coordinates.lat, a.coordinates.lng);
        const distB = calculateDistance(userLocation.lat, userLocation.lng, b.coordinates.lat, b.coordinates.lng);
        return distA - distB; // Sort by distance (closest first)
      }
      
      const scoreA = (a.confidence_score || 0) + (a.rating || 0) * 10;
      const scoreB = (b.confidence_score || 0) + (b.rating || 0) * 10;
      return scoreB - scoreA;
    });

    return new Response(
      JSON.stringify({
        predictions: results.slice(0, 10), // Return up to 10 results as requested
        status: "OK",
        source: googleApiKey ? "google_places_enhanced" : "gemini_fallback",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in enhanced places search:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        predictions: [],
        status: "ERROR",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
