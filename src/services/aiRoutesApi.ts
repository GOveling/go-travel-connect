import axios from 'axios';
import type { SavedPlace } from '@/types';
import type { GenerateHybridItineraryParamsV2, ApiItineraryResponse } from '@/types/aiSmartRouteApi';

const API_URL = import.meta.env.VITE_AI_ROUTES_API_URL;
const API_KEY = import.meta.env.VITE_AI_ROUTES_API_KEY;

const aiRoutesApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` }),
  },
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

export const aiRoutesService = {
  generateHybridItinerary: async (params: GenerateHybridItineraryParams) => {
    try {
      const response = await aiRoutesApi.post('/itinerary/generate-hybrid', params);
      console.log('Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error generating hybrid itinerary:', error?.response?.data || error);
      throw error;
    }
  },

  generateHybridItineraryV2: async (params: GenerateHybridItineraryParamsV2): Promise<ApiItineraryResponse> => {
    try {
      const response = await aiRoutesApi.post('/itinerary/generate-hybrid', params);
      console.log('AI Routes API V2 Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error generating hybrid itinerary V2:', error?.response?.data || error);
      throw error;
    }
  },

  recommendHotels: async (params: RecommendHotelsParams) => {
    try {
      // Log the request for debugging
      console.log('Making request to:', `${API_URL}/hotels/recommend`);
      console.log('With params:', JSON.stringify(params, null, 2));
      
      const response = await aiRoutesApi.post('/hotels/recommend', params);
      console.log('Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error recommending hotels:', error?.response?.data || error);
      throw error;
    }
  },

  formatPlacesForApi: (savedPlaces: SavedPlace[]) => {
    return savedPlaces.map(place => ({
      name: place.name,
      lat: place.lat || 0,
      lon: place.lng || 0,
      type: place.category?.toLowerCase() || 'point_of_interest',
      priority: place.priority === 'high' ? 8 : place.priority === 'medium' ? 5 : 3
    }));
  }
};
