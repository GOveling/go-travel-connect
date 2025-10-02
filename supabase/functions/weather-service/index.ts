import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  location: {
    city: string;
    country: string;
    region: string;
  };
}

interface CacheEntry {
  data: WeatherData;
  timestamp: number;
  coordinates: string;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const cache = new Map<string, CacheEntry>();

function getCacheKey(lat?: number, lng?: number, city?: string): string {
  if (lat && lng) {
    // Round coordinates to reduce cache fragmentation (5km radius approximately)
    const roundedLat = Math.round(lat * 100) / 100;
    const roundedLng = Math.round(lng * 100) / 100;
    return `coords_${roundedLat}_${roundedLng}`;
  }
  return `city_${city?.toLowerCase().replace(/\s+/g, '_')}`;
}

function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_DURATION;
}

async function fetchWeatherFromAPI(coordinates?: { lat: number; lng: number }, city?: string): Promise<WeatherData> {
  const weatherApiKey = Deno.env.get('WEATHER_API_KEY');
  if (!weatherApiKey) {
    throw new Error('Weather API key not configured');
  }

  let url: string;
  if (coordinates) {
    url = `http://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${coordinates.lat},${coordinates.lng}&aqi=no`;
  } else if (city) {
    url = `http://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${encodeURIComponent(city)}&aqi=no`;
  } else {
    throw new Error('Either coordinates or city must be provided');
  }

  console.log(`Fetching weather from API: ${coordinates ? `${coordinates.lat},${coordinates.lng}` : city}`);

  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Weather API error:', response.status, errorText);
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = await response.json();
  
  const weatherData: WeatherData = {
    temperature: data.current.temp_c,
    condition: data.current.condition.text,
    icon: data.current.condition.icon,
    humidity: data.current.humidity,
    windSpeed: data.current.wind_kph,
    location: {
      city: data.location.name,
      country: data.location.country,
      region: data.location.region,
    },
  };

  console.log(`Weather data fetched successfully for ${weatherData.location.city}`);
  return weatherData;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { coordinates, city } = await req.json();
    
    // Check cache first
    const cacheKey = getCacheKey(coordinates?.lat, coordinates?.lng, city);
    const cachedEntry = cache.get(cacheKey);
    
    if (cachedEntry && isCacheValid(cachedEntry)) {
      console.log(`Cache hit for ${cacheKey}`);
      return new Response(JSON.stringify(cachedEntry.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch fresh data
    const weatherData = await fetchWeatherFromAPI(coordinates, city);
    
    // Update cache
    cache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now(),
      coordinates: cacheKey,
    });

    // Clean old cache entries (basic cleanup)
    for (const [key, entry] of cache.entries()) {
      if (!isCacheValid(entry)) {
        cache.delete(key);
      }
    }

    return new Response(JSON.stringify(weatherData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Weather service error:', error);
    
    // Return a fallback response for better UX
    const fallbackData: WeatherData = {
      temperature: 22,
      condition: 'Partly Cloudy',
      icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
      humidity: 65,
      windSpeed: 10,
      location: {
        city: city || 'Unknown',
        country: 'Unknown',
        region: 'Unknown',
      },
    };

    return new Response(JSON.stringify(fallbackData), {
      status: 200, // Return 200 with fallback data for better UX
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});