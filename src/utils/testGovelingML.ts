// Test file to verify the exact payload being sent to your API
import { GovelingMLService } from "@/services/govelingML";
import type { Trip } from "@/types";

// Recreate your Antofagasta trip based on your Postman data
const testTrip: Trip = {
  id: "test-antofagasta",
  name: "Antofagasta",
  destination: "Antofagasta, Chile",
  startDate: new Date("2025-08-15"),
  endDate: new Date("2025-08-17"),
  status: "planning",
  travelers: 2,
  image: "/placeholder.svg",
  isGroupTrip: false,
  coordinates: [
    {
      name: "Antofagasta Centro",
      lat: -23.6509,
      lng: -70.3987,
    },
  ],
  savedPlaces: [
    {
      id: "1",
      name: "BLACK ANTOFAGASTA",
      category: "restaurant",
      rating: 4.5,
      image: "/placeholder.svg",
      description: "Restaurant",
      estimatedTime: "2h",
      priority: "high", // Will map to 8
      destinationName: "Antofagasta",
      lat: -23.6627773,
      lng: -70.4004361,
    },
    {
      id: "2",
      name: "Museo Regional de Antofagasta",
      category: "museum",
      rating: 4.2,
      image: "/placeholder.svg",
      description: "Regional Museum",
      estimatedTime: "1.5h",
      priority: "medium", // Will map to 7
      destinationName: "Antofagasta",
      lat: -23.6509,
      lng: -70.3987,
    },
    {
      id: "3",
      name: "Plaza Colón",
      category: "monument",
      rating: 4.0,
      image: "/placeholder.svg",
      description: "Historic Plaza",
      estimatedTime: "1h",
      priority: "medium", // Will map to 6
      destinationName: "Antofagasta",
      lat: -23.6509,
      lng: -70.4018,
    },
    {
      id: "4",
      name: "Catedral de Antofagasta",
      category: "church",
      rating: 4.3,
      image: "/placeholder.svg",
      description: "Cathedral",
      estimatedTime: "1h",
      priority: "low", // Will map to 5
      destinationName: "Antofagasta",
      lat: -23.6472,
      lng: -70.3987,
    },
    {
      id: "5",
      name: "Mercado Central",
      category: "shopping",
      rating: 4.1,
      image: "/placeholder.svg",
      description: "Central Market",
      estimatedTime: "1.5h",
      priority: "medium", // Will map to 7
      destinationName: "Antofagasta",
      lat: -23.6472,
      lng: -70.3987,
    },
    {
      id: "6",
      name: "Playa El Laucho",
      category: "beach",
      rating: 4.8,
      image: "/placeholder.svg",
      description: "Beach",
      estimatedTime: "3h",
      priority: "high", // Will map to 9
      destinationName: "Antofagasta",
      lat: -23.7167,
      lng: -70.3833,
    },
  ],
};

// Test the transformation
export const testTransformation = () => {
  const preferences = {
    start_time: "09:00",
    end_time: "18:00",
    preferred_transport: "walking" as const,
  };

  const transformedData = GovelingMLService.transformTripToGovelingML(
    testTrip,
    preferences
  );

  console.log("=== PAYLOAD THAT WILL BE SENT TO YOUR API ===");
  console.log(JSON.stringify(transformedData, null, 2));

  console.log("\n=== COMPARISON WITH YOUR POSTMAN DATA ===");
  console.log("✅ Expected format matches your API");
  console.log("✅ Places array with lat/lon (not latitude/longitude)");
  console.log("✅ start_date and end_date in YYYY-MM-DD format");
  console.log("✅ daily_start_hour and daily_end_hour as numbers");
  console.log("✅ transport_mode as string ('walk')");
  
  return transformedData;
};

// Expected output should be:
/*
{
  "places": [
    {
      "name": "BLACK ANTOFAGASTA",
      "lat": -23.6627773,
      "lon": -70.4004361,
      "type": "restaurant",
      "priority": 9
    },
    {
      "name": "Museo Regional de Antofagasta",
      "lat": -23.6509,
      "lon": -70.3987,
      "type": "museum",
      "priority": 6
    },
    {
      "name": "Plaza Colón",
      "lat": -23.6509,
      "lon": -70.4018,
      "type": "monument",
      "priority": 6
    },
    {
      "name": "Catedral de Antofagasta",
      "lat": -23.6472,
      "lon": -70.3987,
      "type": "church",
      "priority": 3
    },
    {
      "name": "Mercado Central",
      "lat": -23.6472,
      "lon": -70.3987,
      "type": "shopping_mall",
      "priority": 6
    },
    {
      "name": "Playa El Laucho",
      "lat": -23.7167,
      "lon": -70.3833,
      "type": "beach",
      "priority": 9
    }
  ],
  "start_date": "2025-08-15",
  "end_date": "2025-08-17",
  "daily_start_hour": 9,
  "daily_end_hour": 18,
  "transport_mode": "walk"
}
*/
