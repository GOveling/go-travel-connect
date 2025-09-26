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
      console.log('🔧 [API V1] Generating itinerary with legacy V1 API');
      console.log('📊 [API V1] Request params:', {
        placesCount: params.places.length,
        dateRange: `${params.start_date} to ${params.end_date}`,
        transportMode: params.transport_mode
      });
      
      const response = await aiRoutesApi.post('/api/v1/itinerary/generate-hybrid', params);
      console.log('✅ [API V1] Successfully generated itinerary (legacy)');
      return response.data;
    } catch (error: any) {
      console.error('❌ [API V1] Error generating hybrid itinerary:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message
      });
      throw error;
    }
  },

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

  // Smart itinerary generation with V2/V1 fallback
  generateSmartItinerary: async (savedPlaces: SavedPlace[], params: {
    start_date: string;
    end_date: string;
    transport_mode: 'walk' | 'drive' | 'transit' | 'bike';
    daily_start_hour?: number;
    daily_end_hour?: number;
  }): Promise<ApiItineraryResponse> => {
    const formattedPlaces = aiRoutesService.formatPlacesForApi(savedPlaces);
    const canUseV2 = aiRoutesService.validatePlacesForV2(savedPlaces);
    const placesWithoutId = aiRoutesService.getPlacesMissingId(savedPlaces);
    
    console.log('🎯 [SMART API] Starting smart itinerary generation');
    console.log('🔍 [SMART API] Analysis:', {
      totalPlaces: savedPlaces.length,
      placesWithId: savedPlaces.length - placesWithoutId.length,
      placesWithoutId: placesWithoutId.length,
      canUseV2: canUseV2,
      placesNeedingId: placesWithoutId.map(p => ({ name: p.name, category: p.category }))
    });

    if (canUseV2) {
      console.log('✨ [SMART API] All places have place_id - using API V2');
      try {
        const v2Params: GenerateHybridItineraryParamsV2 = {
          places: formattedPlaces,
          ...params
        };
        return await aiRoutesService.generateHybridItineraryV2(v2Params);
      } catch (error: any) {
        console.warn('⚠️ [SMART API] V2 failed, falling back to V1:', {
          error: error?.message,
          status: error?.response?.status
        });
        
        // Fallback to V1
        const v1Params: GenerateHybridItineraryParams = {
          places: formattedPlaces.map(({ place_id, ...rest }) => rest), // Remove place_id for V1
          start_date: params.start_date,
          end_date: params.end_date,
          transport_mode: params.transport_mode === 'bike' ? 'bicycle' : params.transport_mode as 'walk' | 'drive' | 'transit' | 'bicycle'
        };
        console.log('🔄 [SMART API] Retrying with API V1 (fallback)');
        return await aiRoutesService.generateHybridItinerary(v1Params);
      }
    } else {
      console.log('📝 [SMART API] Some places missing place_id - using API V1 directly');
      const v1Params: GenerateHybridItineraryParams = {
        places: formattedPlaces.map(({ place_id, ...rest }) => rest), // Remove place_id for V1
        start_date: params.start_date,
        end_date: params.end_date,
        transport_mode: params.transport_mode === 'bike' ? 'bicycle' : params.transport_mode as 'walk' | 'drive' | 'transit' | 'bicycle'
      };
      return await aiRoutesService.generateHybridItinerary(v1Params);
    }
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

  // Utility to check if places are ready for API V2 (have place_id)
  validatePlacesForV2: (savedPlaces: SavedPlace[]): boolean => {
    return savedPlaces.every(place => place.placeReference && place.placeReference.trim() !== '');
  },

  // Get places missing place_id for logging/debugging
  getPlacesMissingId: (savedPlaces: SavedPlace[]): SavedPlace[] => {
    return savedPlaces.filter(place => !place.placeReference || place.placeReference.trim() === '');
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
  checkApiHealth: async (): Promise<{ v1: boolean; v2: boolean; details: Record<string, any> }> => {
    const results = { v1: false, v2: false, details: {} as Record<string, any> };
    
    console.log('🏥 [HEALTH CHECK] Testing API endpoints availability');
    
    // Test V1 endpoint
    try {
      await aiRoutesApi.get('/api/v1/health');
      results.v1 = true;
      console.log('✅ [HEALTH CHECK] API V1 is available');
    } catch (error: any) {
      console.warn('⚠️ [HEALTH CHECK] API V1 unavailable:', error?.message);
      results.details.v1Error = error?.message;
    }
    
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
