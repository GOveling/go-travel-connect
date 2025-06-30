
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeminiPlace {
  place_id: string;
  main_text: string;
  secondary_text: string;
  full_address: string;
  types: string[];
  confidence_score: number;
  phone?: string;
  description?: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  importance: number;
}

// Rate limiting for Nominatim (max 1 request per second)
let lastNominatimCall = 0;
const NOMINATIM_DELAY = 1100; // 1.1 seconds to be safe

async function geocodeWithNominatim(address: string): Promise<{ lat: number; lng: number } | null> {
  const now = Date.now();
  const timeSinceLastCall = now - lastNominatimCall;
  
  if (timeSinceLastCall < NOMINATIM_DELAY) {
    await new Promise(resolve => setTimeout(resolve, NOMINATIM_DELAY - timeSinceLastCall));
  }
  
  lastNominatimCall = Date.now();
  
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'TravelConnect/1.0 (contact@travelconnect.com)'
        }
      }
    );
    
    if (!response.ok) {
      console.error('Nominatim API error:', response.status);
      return null;
    }
    
    const results: NominatimResult[] = await response.json();
    
    if (results.length > 0) {
      const result = results[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding with Nominatim:', error);
    return null;
  }
}

function buildGeminiPrompt(input: string, selectedCategories: string[]): string {
  const categoryContext = selectedCategories.length > 0 
    ? `\nFocus especially on places that match these categories: ${selectedCategories.join(', ')}.`
    : '';

  return `You are a travel places search assistant. Find real places based on this search query: "${input}"${categoryContext}

Return ONLY a valid JSON response with this exact structure:
{
  "predictions": [
    {
      "place_id": "unique_identifier",
      "main_text": "Main place name",
      "secondary_text": "City, Country or neighborhood context",
      "full_address": "Complete formatted address",
      "types": ["establishment", "restaurant", "point_of_interest"],
      "confidence_score": 95,
      "phone": "+1234567890",
      "description": "Brief description of the place"
    }
  ],
  "status": "OK"
}

IMPORTANT RULES:
1. Return maximum 5 relevant results
2. confidence_score should be 0-100 (use 90+ for well-known places)
3. full_address must be detailed enough for geocoding
4. types should match Google Places API types
5. Include phone when available
6. Only return real, existing places
7. NO explanatory text, ONLY the JSON response
8. If no places found, return empty predictions array with status "OK"`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input, selectedCategories = [], sessionToken } = await req.json();
    
    if (!input || input.trim().length < 2) {
      return new Response(JSON.stringify({
        predictions: [],
        status: "OK"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Searching places with Gemini for:', input, 'Categories:', selectedCategories);

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: buildGeminiPrompt(input, selectedCategories)
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        }),
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    
    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      throw new Error('No response from Gemini');
    }

    const geminiText = geminiData.candidates[0].content.parts[0].text;
    console.log('Gemini response:', geminiText);

    // Parse JSON response from Gemini
    let parsedResponse;
    try {
      // Clean the response in case there's extra text
      const jsonMatch = geminiText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : geminiText;
      parsedResponse = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Error parsing Gemini JSON:', parseError);
      throw new Error('Invalid JSON response from Gemini');
    }

    if (!parsedResponse.predictions || !Array.isArray(parsedResponse.predictions)) {
      throw new Error('Invalid response structure from Gemini');
    }

    // Geocode each place with Nominatim
    const geocodedPredictions = [];
    
    for (const place of parsedResponse.predictions) {
      try {
        const coordinates = await geocodeWithNominatim(place.full_address);
        
        geocodedPredictions.push({
          place_id: place.place_id || `gemini_${Date.now()}_${Math.random()}`,
          description: `${place.main_text}, ${place.secondary_text}`,
          structured_formatting: {
            main_text: place.main_text,
            secondary_text: place.secondary_text
          },
          types: place.types || ['establishment'],
          confidence_score: place.confidence_score || 85,
          full_address: place.full_address,
          phone: place.phone,
          place_description: place.description,
          coordinates: coordinates || { lat: 0, lng: 0 },
          geocoded: coordinates !== null
        });
      } catch (error) {
        console.error('Error processing place:', place.main_text, error);
        // Include place even if geocoding fails
        geocodedPredictions.push({
          place_id: place.place_id || `gemini_${Date.now()}_${Math.random()}`,
          description: `${place.main_text}, ${place.secondary_text}`,
          structured_formatting: {
            main_text: place.main_text,
            secondary_text: place.secondary_text
          },
          types: place.types || ['establishment'],
          confidence_score: place.confidence_score || 85,
          full_address: place.full_address,
          phone: place.phone,
          place_description: place.description,
          coordinates: { lat: 0, lng: 0 },
          geocoded: false
        });
      }
    }

    console.log(`Geocoded ${geocodedPredictions.length} places`);

    return new Response(JSON.stringify({
      predictions: geocodedPredictions,
      status: "OK"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gemini-places function:', error);
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
