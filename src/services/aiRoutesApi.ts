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

  generateHybridItineraryV2: async (params: GenerateHybridItineraryParamsV2): Promise<ApiItineraryResponse> => {
    try {
      console.log('🚀 [API V2] Attempting to generate hybrid itinerary with V2 API');
      console.log('📊 [API V2] Request params:', {
        placesCount: params.places.length,
        placesWithId: params.places.filter(p => p.place_id).length,
        dateRange: `${params.start_date} to ${params.end_date}`,
        transportMode: params.transport_mode
      });
      
      const response = await aiRoutesApi.post('/api/v2/itinerary/generate-hybrid', params);
      console.log('✅ [API V2] Successfully generated itinerary');
      console.log('📈 [API V2] Response metrics:', {
        daysCount: response.data?.itinerary?.length || 0,
        totalSuggestions: response.data?.itinerary?.reduce((acc: number, day: any) => 
          acc + (day.freeBlocks?.reduce((blockAcc: number, block: any) => 
            blockAcc + (block.suggestions?.length || 0), 0) || 0), 0) || 0,
        hasRecommendations: response.data?.recommendations?.length > 0
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ [API V2] Error generating hybrid itinerary V2:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message
      });
      throw error;
    }
  },

  // Smart itinerary generation using only V2 API
  generateSmartItinerary: async (savedPlaces: SavedPlace[], params: {
    start_date: string;
    end_date: string;
    transport_mode: 'walk' | 'drive' | 'transit' | 'bike';
    daily_start_hour?: number;
    daily_end_hour?: number;
  }): Promise<ApiItineraryResponse> => {
    const formattedPlaces = aiRoutesService.formatPlacesForApi(savedPlaces);
    
    console.log('🎯 [SMART API] Starting itinerary generation with V2 API');
    console.log('🔍 [SMART API] Analysis:', {
      totalPlaces: savedPlaces.length,
      placesWithId: savedPlaces.filter(p => p.placeReference).length,
      placesWithoutId: savedPlaces.filter(p => !p.placeReference).length
    });

    const v2Params: GenerateHybridItineraryParamsV2 = {
      places: formattedPlaces,
      ...params
    };
    
    return await aiRoutesService.generateHybridItineraryV2(v2Params);
  },

  recommendHotels: async (params: RecommendHotelsParams) => {
    try {
      console.log('🏨 [HOTELS API] Requesting hotel recommendations');
      console.log('📍 [HOTELS API] Request details:', {
        placesCount: params.places.length,
        maxRecommendations: params.max_recommendations,
        url: `${API_URL}/api/v2/hotels/recommend`
      });
      
      const response = await aiRoutesApi.post('/api/v2/hotels/recommend', params);
      console.log('✅ [HOTELS API] Successfully retrieved recommendations:', {
        hotelsCount: response.data?.hotels?.length || 0
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ [HOTELS API] Error recommending hotels:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message
      });
      throw error;
    }
  },

  formatPlacesForApi: (savedPlaces: SavedPlace[]) => {
    return savedPlaces.map(place => ({
      ...(place.placeReference && { place_id: place.placeReference }), // Include place_id for API V2 when available
      name: place.name,
      lat: place.lat || 0,
      lon: place.lng || 0,
      type: place.category?.toLowerCase() || 'point_of_interest',
      priority: place.priority === 'high' ? 8 : place.priority === 'medium' ? 5 : 3
    }));
  },


  // New V2 API endpoint for nearby places search
  searchNearbyPlaces: async (params: {
    lat: number;
    lng: number;
    radius?: number;
    type?: string;
    keyword?: string;
  }) => {
    try {
      console.log('🔍 [PLACES API] Searching nearby places');
      console.log('📍 [PLACES API] Search params:', params);
      
      const response = await aiRoutesApi.post('/api/v2/places/search-nearby', params);
      console.log('✅ [PLACES API] Found places:', {
        placesCount: response.data?.places?.length || 0
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ [PLACES API] Error searching nearby places:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message
      });
      throw error;
    }
  },

  // API Health check utility
  checkApiHealth: async (): Promise<{ v2: boolean; details: Record<string, any> }> => {
    const results = { v2: false, details: {} as Record<string, any> };
    
    console.log('🏥 [HEALTH CHECK] Testing API V2 endpoint availability');
    
    // Test V2 endpoint
    try {
      await aiRoutesApi.get('/api/v2/health');
      results.v2 = true;
      console.log('✅ [HEALTH CHECK] API V2 is available');
    } catch (error: any) {
      console.warn('⚠️ [HEALTH CHECK] API V2 unavailable:', error?.message);
      results.details.v2Error = error?.message;
    }
    
    console.log('📊 [HEALTH CHECK] Final status:', results);
    return results;
  }
};
