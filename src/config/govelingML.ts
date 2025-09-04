// Environment configuration for Goveling ML API
export const govelingMLConfig = {
  // Default API URL (can be overridden by environment variables)
  baseUrl: "https://goveling-ml.onrender.com",
  
  // API version
  apiVersion: "v2",
  
  // Timeout in milliseconds (30 seconds for complex itineraries)
  timeout: 30000,
  
  // Debug mode
  debug: true,
  
  // Retry configuration
  retryAttempts: 2,
  retryDelay: 1000, // 1 second
  
  // Default preferences
  defaultPreferences: {
    start_time: "09:00",
    end_time: "18:00",
    max_daily_activities: 6,
    preferred_transport: "walking" as const,
  },
  
  // Health check endpoint
  healthEndpoint: "/health",
  
  // Main generation endpoint - Updated to match your actual API
  generateEndpoint: "/api/v2/itinerary/generate-hybrid",
  
  // Documentation URL
  docsUrl: "https://goveling-ml.onrender.com/docs",
};

// Utility to check if API is properly configured
export const isGovelingMLConfigured = (): boolean => {
  return !govelingMLConfig.baseUrl.includes("goveling-ml.onrender.com");
};

// Get full endpoint URL
export const getApiEndpointUrl = (endpoint: string): string => {
  return `${govelingMLConfig.baseUrl}${endpoint}`;
};

// Environment-aware configuration message
export const getConfigMessage = (): string => {
  if (isGovelingMLConfigured()) {
    return `Goveling ML API configured at: ${govelingMLConfig.baseUrl}`;
  } else {
    return "⚠️ Goveling ML API not configured. Please set VITE_GOVELING_ML_API_URL environment variable.";
  }
};

// Debug logging utility
export const debugLog = (message: string, data?: any): void => {
  if (govelingMLConfig.debug) {
    console.log(`[Goveling ML] ${message}`, data || "");
  }
};
