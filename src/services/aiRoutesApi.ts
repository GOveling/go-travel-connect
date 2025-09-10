import axios from 'axios';
import type { SavedPlace } from '@/types';

const API_URL = import.meta.env.VITE_AI_ROUTES_API_URL;
const API_KEY = import.meta.env.VITE_AI_ROUTES_API_KEY;

const aiRoutesApi = axios.create({
  baseURL: 'https://goveling-ml.onrender.com',
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` }),
  },
  timeout: 30000, // 30 seconds timeout
});

interface GenerateHybridItineraryParams {
  places: Array<{
    name: string;
    lat: number;
    lon: number;
    type: string;
    priority: number;
  }>;
  start_date: string;
  end_date: string;
  transport_mode: 'walk' | 'drive' | 'transit' | 'bicycle';
}

interface RecommendHotelsParams {
  places: Array<{
    name: string;
    lat: number;
    lon: number;
    type: string;
  }>;
  max_recommendations: number;
}

const validateAndFormatDate = (date: string | Date): string => {
  if (!date) throw new Error('Date is required');
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) throw new Error('Invalid date format');
  return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
};

const validatePlace = (place: any) => {
  if (!place.name || !place.lat || !place.lon) {
    throw new Error(`Invalid place data: ${JSON.stringify(place)}`);
  }
  if (typeof place.lat !== 'number' || typeof place.lon !== 'number') {
    throw new Error(`Coordinates must be numbers: lat=${place.lat}, lon=${place.lon}`);
  }
  if (place.lat < -90 || place.lat > 90 || place.lon < -180 || place.lon > 180) {
    throw new Error(`Invalid coordinates: lat=${place.lat}, lon=${place.lon}`);
  }
};

export const aiRoutesService = {
  generateHybridItinerary: async (params: GenerateHybridItineraryParams) => {
    try {
      // Validate required dates
      if (!params.start_date || !params.end_date) {
        throw new Error("Start date and end date are required");
      }

      // Validate places array
      if (!params.places || params.places.length === 0) {
        throw new Error("At least one place is required");
      }

      // Validate and format request data
      const validatedParams = {
        ...params,
        start_date: validateAndFormatDate(params.start_date),
        end_date: validateAndFormatDate(params.end_date),
        places: params.places.map(place => {
          validatePlace(place);
          return {
            ...place,
            priority: Math.max(1, Math.min(10, place.priority)), // Ensure priority is 1-10
            type: place.type.replace(/\s+/g, '_') // Ensure no spaces in type
          };
        })
      };

      console.log('📤 Making ML API request to: /api/v2/itinerary/generate-hybrid');
      console.log('📤 Request payload:', JSON.stringify(validatedParams, null, 2));
      
      const response = await aiRoutesApi.post('/api/v2/itinerary/generate-hybrid', validatedParams);
      
      console.log('✅ ML API Response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error generating hybrid itinerary:');
      console.error('Status:', error?.response?.status);
      console.error('Status Text:', error?.response?.statusText);
      console.error('Response Data:', error?.response?.data);
      console.error('Request Config:', error?.config);
      
      if (error?.response?.status === 422) {
        console.error('🚨 Validation Error - Check request format:', error?.response?.data);
      }
      
      throw new Error(`ML API Error: ${error?.response?.data?.detail || error?.response?.statusText || error?.message}`);
    }
  },

  recommendHotels: async (params: RecommendHotelsParams) => {
    try {
      // Validate places
      params.places.forEach(validatePlace);
      
      console.log('📤 Making ML API request to: /api/v2/hotels/recommend');
      console.log('📤 Request payload:', JSON.stringify(params, null, 2));
      
      const response = await aiRoutesApi.post('/api/v2/hotels/recommend', params);
      
      console.log('✅ Hotels API Response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error recommending hotels:');
      console.error('Status:', error?.response?.status);
      console.error('Status Text:', error?.response?.statusText);
      console.error('Response Data:', error?.response?.data);
      console.error('Request Config:', error?.config);
      
      if (error?.response?.status === 422) {
        console.error('🚨 Validation Error - Check request format:', error?.response?.data);
      }
      
      throw new Error(`Hotels API Error: ${error?.response?.data?.detail || error?.response?.statusText || error?.message}`);
    }
  },

  formatPlacesForApi: (savedPlaces: SavedPlace[]) => {
    if (!savedPlaces || savedPlaces.length === 0) {
      console.warn('⚠️ No saved places provided to formatPlacesForApi');
      return [];
    }

    return savedPlaces
      .filter(place => place.lat && place.lng && place.name) // Filter out invalid places
      .map(place => {
        const formatted = {
          name: place.name.trim(),
          lat: Number(place.lat),
          lon: Number(place.lng), // Note: API expects 'lon', not 'lng'
          type: (place.category?.toLowerCase() || 'point_of_interest').replace(/\s+/g, '_'),
          priority: place.priority === 'high' ? 8 : place.priority === 'medium' ? 5 : 3
        };
        
        console.log(`📍 Formatted place: ${formatted.name} (${formatted.lat}, ${formatted.lon})`);
        return formatted;
      });
  }
};
