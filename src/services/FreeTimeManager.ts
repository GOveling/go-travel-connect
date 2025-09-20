import { ApiDayItinerary, FreeBlock } from '@/types/aiSmartRouteApi';
import { NavigationService } from './NavigationService';

export interface EtaEtdBlock {
  type: 'eta_etd';
  start_time: string;
  end_time: string;
  duration_minutes: number;
  place_name: string;
  arrival_time?: string;
  departure_time?: string;
  travel_time_to_next?: number;
  travel_mode?: 'walking' | 'driving' | 'transit' | 'bicycling';
}

export interface TransferBlock {
  type: 'transfer';
  start_time: string;
  end_time: string;
  duration_minutes: number;
  from_place: string;
  to_place: string;
  travel_mode: 'walking' | 'driving' | 'transit' | 'bicycling';
  estimated_travel_time: number;
  buffer_time: number;
}

export interface EnhancedFreeBlock extends FreeBlock {
  dynamic_duration?: number;
  updated_suggestions?: any[];
  real_time_travel_data?: {
    prev_place_eta: string;
    next_place_etd: string;
    buffer_minutes: number;
  };
}

class FreeTimeManager {
  private static instance: FreeTimeManager;
  private navigationService = NavigationService.getInstance();

  private constructor() {}

  public static getInstance(): FreeTimeManager {
    if (!FreeTimeManager.instance) {
      FreeTimeManager.instance = new FreeTimeManager();
    }
    return FreeTimeManager.instance;
  }

  /**
   * Calculate dynamic ETA/ETD blocks based on real-time travel data
   */
  public async calculateEtaEtdBlocks(
    itinerary: ApiDayItinerary[],
    transportMode: 'walking' | 'driving' | 'transit' | 'bicycling' = 'walking'
  ): Promise<Map<string, EtaEtdBlock[]>> {
    const etaEtdMap = new Map<string, EtaEtdBlock[]>();

    for (const day of itinerary) {
      const blocks: EtaEtdBlock[] = [];
      
      for (let i = 0; i < day.places.length; i++) {
        const place = day.places[i];
        const nextPlace = day.places[i + 1];
        
        // Calculate arrival time for current place
        let arrivalTime = place.best_time || new Date().toISOString();
        if (i > 0) {
          const prevPlace = day.places[i - 1];
          try {
            const directions = await this.navigationService.getEnhancedDirections(
              { lat: prevPlace.lat, lng: prevPlace.lng },
              { lat: place.lat, lng: place.lng },
              transportMode
            );
            
            const travelTime = this.parseDuration(directions.duration);
            const prevDeparture = new Date(prevPlace.best_time || new Date().toISOString());
            arrivalTime = new Date(prevDeparture.getTime() + travelTime * 60000).toISOString();
          } catch (error) {
            console.error('Error calculating travel time:', error);
          }
        }

        // Calculate departure time and travel to next place
        let departureTime = place.best_time;
        let travelTimeToNext = 0;
        
        if (nextPlace) {
          try {
            const directions = await this.navigationService.getEnhancedDirections(
              { lat: place.lat, lng: place.lng },
              { lat: nextPlace.lat, lng: nextPlace.lng },
              transportMode
            );
            
            travelTimeToNext = this.parseDuration(directions.duration);
            
            if (!departureTime) {
              const visitDuration = this.estimateVisitDuration(place.category, place.category);
              const arrival = new Date(arrivalTime);
              departureTime = new Date(arrival.getTime() + visitDuration * 60000).toISOString();
            }
          } catch (error) {
            console.error('Error calculating travel time to next place:', error);
          }
        }

        const block: EtaEtdBlock = {
          type: 'eta_etd',
          start_time: arrivalTime,
          end_time: departureTime || arrivalTime,
          duration_minutes: departureTime 
            ? Math.round((new Date(departureTime).getTime() - new Date(arrivalTime).getTime()) / 60000)
            : this.estimateVisitDuration(place.category, place.category),
          place_name: place.name,
          arrival_time: arrivalTime,
          departure_time: departureTime,
          travel_time_to_next: travelTimeToNext,
          travel_mode: transportMode
        };

        blocks.push(block);
      }

      etaEtdMap.set(`day-${day.day}`, blocks);
    }

    return etaEtdMap;
  }

  /**
   * Generate transfer blocks for long travel segments
   */
  public async generateTransferBlocks(
    itinerary: ApiDayItinerary[],
    transportMode: 'walking' | 'driving' | 'transit' | 'bicycling' = 'walking',
    transferThresholdMinutes: number = 60
  ): Promise<TransferBlock[]> {
    const transferBlocks: TransferBlock[] = [];

    for (const day of itinerary) {
      for (let i = 0; i < day.places.length - 1; i++) {
        const currentPlace = day.places[i];
        const nextPlace = day.places[i + 1];

        try {
          const directions = await this.navigationService.getEnhancedDirections(
            { lat: currentPlace.lat, lng: currentPlace.lng },
            { lat: nextPlace.lat, lng: nextPlace.lng },
            transportMode
          );

          const travelTime = this.parseDuration(directions.duration);
          
          if (travelTime >= transferThresholdMinutes) {
            const bufferTime = Math.min(travelTime * 0.2, 30); // 20% buffer, max 30 minutes
            const totalTime = travelTime + bufferTime;

            const transferBlock: TransferBlock = {
              type: 'transfer',
              start_time: currentPlace.best_time || new Date().toISOString(),
              end_time: nextPlace.best_time || '',
              duration_minutes: totalTime,
              from_place: currentPlace.name,
              to_place: nextPlace.name,
              travel_mode: transportMode,
              estimated_travel_time: travelTime,
              buffer_time: bufferTime
            };

            transferBlocks.push(transferBlock);
          }
        } catch (error) {
          console.error('Error generating transfer block:', error);
        }
      }
    }

    return transferBlocks;
  }

  /**
   * Enhance free blocks with real-time data and dynamic suggestions
   */
  public async enhanceFreeBlocks(
    freeBlocks: FreeBlock[],
    currentLocation?: { lat: number; lng: number },
    transportMode: 'walking' | 'driving' | 'transit' | 'bicycling' = 'walking'
  ): Promise<EnhancedFreeBlock[]> {
    const enhanced: EnhancedFreeBlock[] = [];

    for (const block of freeBlocks) {
      const enhancedBlock: EnhancedFreeBlock = { ...block };

      // Calculate dynamic duration based on real-time travel
      if (currentLocation && block.suggestions && block.suggestions.length > 0) {
        try {
          const suggestions = block.suggestions.slice(0, 3); // Limit to top 3
          const updatedSuggestions: any[] = [];

          for (const suggestion of suggestions) {
            const directions = await this.navigationService.getEnhancedDirections(
              currentLocation,
              { lat: suggestion.lat, lng: suggestion.lon },
              transportMode
            );

            const travelTime = this.parseDuration(directions.duration);
            const visitTime = this.estimateVisitDuration(suggestion.type);
            const returnTime = travelTime; // Assume same time to return

            const totalTimeNeeded = travelTime + visitTime + returnTime;

            if (totalTimeNeeded <= block.duration_minutes + 15) { // 15min buffer
              updatedSuggestions.push({
                ...suggestion,
                travel_time_minutes: travelTime,
                estimated_visit_time: visitTime,
                total_time_needed: totalTimeNeeded
              });
            }
          }

          enhancedBlock.updated_suggestions = updatedSuggestions;
          enhancedBlock.dynamic_duration = Math.max(
            ...updatedSuggestions.map(s => s.total_time_needed || 0),
            block.duration_minutes
          );

        } catch (error) {
          console.error('Error enhancing free block:', error);
        }
      }

      enhanced.push(enhancedBlock);
    }

    return enhanced;
  }

  /**
   * Recalculate free time based on route delays or early arrivals
   */
  public recalculateFreeTime(
    originalItinerary: ApiDayItinerary[],
    actualArrivalTimes: Map<string, string>,
    currentTime: Date
  ): ApiDayItinerary[] {
    const updated = originalItinerary.map(day => ({
      ...day,
      places: day.places.map(place => {
        const actualArrival = actualArrivalTimes.get(place.id);
        if (actualArrival) {
          return {
            ...place,
            best_time: actualArrival,
            // Recalculate departure based on actual arrival + visit duration
            estimated_time: new Date(
              new Date(actualArrival).getTime() + 
              this.estimateVisitDuration(place.category, place.category) * 60000
            ).toISOString()
          };
        }
        return place;
      }),
      free_blocks: day.free_blocks ? day.free_blocks.map(block => {
        // Recalculate free block durations based on new timings
        return this.recalculateFreeBlockDuration(block, day.places, actualArrivalTimes);
      }) : []
    }));

    return updated;
  }

  private recalculateFreeBlockDuration(
    block: FreeBlock,
    places: any[],
    actualTimes: Map<string, string>
  ): FreeBlock {
    // Find places before and after this free block
    const startTime = new Date(block.start_time);
    const endTime = new Date(block.end_time);
    
    // Adjust based on actual arrival/departure times
    // This is a simplified implementation - could be more sophisticated
    const newDuration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
    
    return {
      ...block,
      duration_minutes: Math.max(15, newDuration) // Minimum 15 minutes
    };
  }

  private estimateVisitDuration(category?: string, type?: string): number {
    // Default visit durations in minutes based on place category
    const durations: Record<string, number> = {
      restaurant: 90,
      cafe: 45,
      museum: 120,
      park: 60,
      shopping: 90,
      attraction: 90,
      hotel: 15, // Just check-in/out time
      hospital: 30,
      church: 30,
      beach: 120,
      market: 60,
      default: 60
    };

    return durations[category?.toLowerCase() || type?.toLowerCase() || 'default'] || durations.default;
  }

  private parseDuration(durationString: string): number {
    // Parse duration strings like "1 hour 30 mins" or "45 mins"
    const hourMatch = durationString.match(/(\d+)\s*hour/);
    const minMatch = durationString.match(/(\d+)\s*min/);
    
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minMatch ? parseInt(minMatch[1]) : 0;
    
    return hours * 60 + minutes;
  }
}

export const freeTimeManager = FreeTimeManager.getInstance();