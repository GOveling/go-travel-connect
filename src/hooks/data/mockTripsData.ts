
import { Trip } from "@/types";

export const initialTripsData: Trip[] = [
  {
    id: "1",
    name: "European Adventure",
    destination: "Paris → Rome → Barcelona",
    dates: "Dec 15 - Dec 25, 2024",
    status: "upcoming",
    travelers: 2,
    image: "🇪🇺",
    isGroupTrip: true,
    coordinates: [
      { name: "Paris", lat: 48.8566, lng: 2.3522 },
      { name: "Rome", lat: 41.9028, lng: 12.4964 },
      { name: "Barcelona", lat: 41.3851, lng: 2.1734 }
    ],
    savedPlaces: [],
    collaborators: [
      {
        id: "1",
        name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        avatar: "S",
        role: "owner"
      },
      {
        id: "2", 
        name: "Mike Chen",
        email: "mike.chen@example.com",
        avatar: "M",
        role: "editor"
      },
      {
        id: "3",
        name: "Emma Rodriguez",
        email: "emma.rodriguez@example.com", 
        avatar: "E",
        role: "viewer"
      },
      {
        id: "4",
        name: "David Kim",
        email: "david.kim@example.com",
        avatar: "D", 
        role: "editor"
      }
    ]
  },
  {
    id: "2",
    name: "Tokyo Discovery",
    destination: "Tokyo, Japan",
    dates: "Jan 8 - Jan 15, 2025",
    status: "planning",
    travelers: 1,
    image: "🇯🇵",
    isGroupTrip: false,
    coordinates: [
      { name: "Tokyo", lat: 35.6762, lng: 139.6503 }
    ],
    savedPlaces: []
  }
];
