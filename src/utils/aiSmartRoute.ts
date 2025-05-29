
// Main exports from refactored utilities
export { 
  getDestinationDateRanges,
  getIndividualDayDates,
  extractDestinationDateFromItinerary,
  calculateDestinationDays,
  getDestinationDates
} from "./dateUtils";

export {
  getSavedPlacesByDestination,
  convertToOptimizedPlaces,
  distributePlacesAcrossDays,
  getPriorityColor
} from "./placeUtils";

export {
  generateOptimizedRoutes,
  getRouteConfigurations
} from "./routeGenerator";

export {
  getSuggestedPlaces,
  createSuggestedDayItinerary
} from "./placeSuggestions";

export { savedPlacesByDestination } from "./mockData";
