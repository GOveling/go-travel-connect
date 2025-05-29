
import { SavedPlace } from "@/types/aiSmartRoute";

// Mock saved places data that matches TripDetailModal structure
export const savedPlacesByDestination: { [key: string]: SavedPlace[] } = {
  "Paris": [
    {
      id: "1",
      name: "Eiffel Tower",
      category: "Landmark",
      rating: 4.8,
      image: "🗼",
      description: "Iconic iron tower and symbol of Paris",
      estimatedTime: "2-3 hours",
      priority: "high" as const,
      destinationName: "Paris"
    },
    {
      id: "2",
      name: "Louvre Museum",
      category: "Museum",
      rating: 4.7,
      image: "🎨",
      description: "World's largest art museum",
      estimatedTime: "4-6 hours",
      priority: "high" as const,
      destinationName: "Paris"
    },
    {
      id: "3",
      name: "Café de Flore",
      category: "Restaurant",
      rating: 4.3,
      image: "☕",
      description: "Historic café in Saint-Germain",
      estimatedTime: "1-2 hours",
      priority: "medium" as const,
      destinationName: "Paris"
    }
  ],
  "Rome": [
    {
      id: "4",
      name: "Colosseum",
      category: "Landmark",
      rating: 4.9,
      image: "🏛️",
      description: "Ancient Roman amphitheater",
      estimatedTime: "2-3 hours",
      priority: "high" as const,
      destinationName: "Rome"
    },
    {
      id: "5",
      name: "Vatican Museums",
      category: "Museum",
      rating: 4.8,
      image: "🎨",
      description: "Pope's art collection and Sistine Chapel",
      estimatedTime: "3-4 hours",
      priority: "high" as const,
      destinationName: "Rome"
    },
    {
      id: "6",
      name: "Trevi Fountain",
      category: "Landmark",
      rating: 4.6,
      image: "⛲",
      description: "Famous baroque fountain",
      estimatedTime: "30 minutes",
      priority: "medium" as const,
      destinationName: "Rome"
    }
  ],
  "Barcelona": [
    {
      id: "7",
      name: "Sagrada Familia",
      category: "Landmark",
      rating: 4.9,
      image: "⛪",
      description: "Gaudí's masterpiece basilica",
      estimatedTime: "2-3 hours",
      priority: "high" as const,
      destinationName: "Barcelona"
    },
    {
      id: "8",
      name: "Park Güell",
      category: "Park",
      rating: 4.7,
      image: "🌳",
      description: "Colorful mosaic park by Gaudí",
      estimatedTime: "2-3 hours",
      priority: "high" as const,
      destinationName: "Barcelona"
    },
    {
      id: "9",
      name: "La Boqueria Market",
      category: "Market",
      rating: 4.4,
      image: "🍅",
      description: "Famous food market on Las Ramblas",
      estimatedTime: "1-2 hours",
      priority: "medium" as const,
      destinationName: "Barcelona"
    }
  ],
  "Tokyo": [
    {
      id: "10",
      name: "Senso-ji Temple",
      category: "Temple",
      rating: 4.6,
      image: "⛩️",
      description: "Tokyo's oldest Buddhist temple",
      estimatedTime: "1-2 hours",
      priority: "high" as const,
      destinationName: "Tokyo"
    },
    {
      id: "11",
      name: "Shibuya Crossing",
      category: "Landmark",
      rating: 4.5,
      image: "🚦",
      description: "World's busiest pedestrian crossing",
      estimatedTime: "30 minutes",
      priority: "medium" as const,
      destinationName: "Tokyo"
    }
  ],
  "Bali": [
    {
      id: "12",
      name: "Tanah Lot Temple",
      category: "Temple",
      rating: 4.5,
      image: "🏛️",
      description: "Temple on a rock formation in the sea",
      estimatedTime: "2 hours",
      priority: "high" as const,
      destinationName: "Bali"
    },
    {
      id: "13",
      name: "Rice Terraces of Jatiluwih",
      category: "Nature",
      rating: 4.7,
      image: "🌾",
      description: "UNESCO World Heritage rice terraces",
      estimatedTime: "3-4 hours",
      priority: "high" as const,
      destinationName: "Bali"
    }
  ]
};
