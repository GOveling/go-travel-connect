import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DirectionsRequest {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  mode: 'walking' | 'driving' | 'transit' | 'bicycling';
  language?: string;
}

interface DirectionsResponse {
  distance: string;
  duration: string;
  steps: Array<{
    instruction: string;
    distance: string;
    duration: string;
  }>;
  route_polyline: string;
  coordinates: Array<{ lat: number; lng: number }>;
}

function decodePolyline(encoded: string): Array<{ lat: number; lng: number }> {
  const coordinates: Array<{ lat: number; lng: number }> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const deltaLat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const deltaLng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += deltaLng;

    coordinates.push({
      lat: lat * 1e-5,
      lng: lng * 1e-5
    });
  }

  return coordinates;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      throw new Error('Google Places API key not configured');
    }

    const body: DirectionsRequest = await req.json();
    const { origin, destination, mode, language = 'es' } = body;

    console.log('Getting directions from', origin, 'to', destination, 'via', mode);

    const params = new URLSearchParams({
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      mode: mode,
      language: language,
      key: apiKey
    });

    const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?${params}`);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Directions API error:', data);
      throw new Error(data.error_message || `Directions API error: ${data.status}`);
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    const steps = leg.steps.map((step: any) => ({
      instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
      distance: step.distance.text,
      duration: step.duration.text
    }));

    const coordinates = decodePolyline(route.overview_polyline.points);

    const result: DirectionsResponse = {
      distance: leg.distance.text,
      duration: leg.duration.text,
      steps,
      route_polyline: route.overview_polyline.points,
      coordinates
    };

    console.log('Directions calculated successfully:', {
      distance: result.distance,
      duration: result.duration,
      steps: result.steps.length
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in google-directions function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to get directions from Google Maps API'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});