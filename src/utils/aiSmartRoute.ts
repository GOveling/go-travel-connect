
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

export { savedPlacesByDestination } from "./mockData";
