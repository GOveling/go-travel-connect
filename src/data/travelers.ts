
export interface Trip {
  name: string;
  destinations: string;
  year: string;
  rating: number;
}

export interface Review {
  place: string;
  rating: number;
  text: string;
}

export interface Publication {
  id: string;
  images: string[];
  text: string;
  location?: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  progress: number;
  total: number;
  points: number;
  earnedDate?: string;
}

export interface TravelLevel {
  level: number;
  title: string;
  currentXP: number;
  nextLevelXP: number;
}

export interface Traveler {
  id: string;
  name: string;
  avatar: string;
  location: string;
  totalTrips: number;
  countries: number;
  followers: number;
  following: number;
  bio: string;
  pastTrips: Trip[];
  recentPhotos: string[];
  reviews: Review[];
  publications: Publication[];
  achievements: Achievement[];
  travelLevel: TravelLevel;
}

export const travelersData: Traveler[] = [
  {
    id: "1",
    name: "Emma Rodriguez",
    avatar: "ER",
    location: "Barcelona, Spain",
    totalTrips: 12,
    countries: 8,
    followers: 245,
    following: 189,
    bio: "Adventure seeker and culture enthusiast. Love exploring hidden gems!",
    pastTrips: [
      { name: "Japan Discovery", destinations: "Tokyo, Kyoto, Osaka", year: "2024", rating: 5 },
      { name: "European Circuit", destinations: "Paris, Rome, Amsterdam", year: "2023", rating: 4.8 },
      { name: "Bali Adventure", destinations: "Ubud, Canggu, Nusa Penida", year: "2023", rating: 4.9 }
    ],
    recentPhotos: ["🏯", "🗼", "🏝️", "🍜"],
    reviews: [
      { place: "Senso-ji Temple", rating: 5, text: "Absolutely magical at sunrise!" },
      { place: "Eiffel Tower", rating: 4.5, text: "Classic but still breathtaking" }
    ],
    publications: [
      {
        id: "1",
        images: ["/lovable-uploads/2e7d8d8c-8611-4e84-84a8-467fc6bcbdc7.png"],
        text: "Amazing sunset at the beach! Perfect end to a wonderful day exploring the coast.",
        location: "Barcelona, Spain",
        createdAt: "2 days ago"
      }
    ],
    achievements: [
      {
        id: "1",
        title: "City Explorer",
        description: "Visit 5 different cities",
        earned: true,
        progress: 5,
        total: 5,
        points: 100,
        earnedDate: "Dec 15, 2024"
      },
      {
        id: "2",
        title: "Culture Enthusiast",
        description: "Visit 10 museums or cultural sites",
        earned: true,
        progress: 12,
        total: 10,
        points: 150,
        earnedDate: "Nov 20, 2024"
      }
    ],
    travelLevel: {
      level: 5,
      title: "Explorer",
      currentXP: 1250,
      nextLevelXP: 2000
    }
  },
  {
    id: "2", 
    name: "Alex Chen",
    avatar: "AC",
    location: "San Francisco, USA",
    totalTrips: 18,
    countries: 15,
    followers: 432,
    following: 298,
    bio: "Digital nomad exploring the world one city at a time 🌍",
    pastTrips: [
      { name: "Southeast Asia Tour", destinations: "Thailand, Vietnam, Cambodia", year: "2024", rating: 4.7 },
      { name: "South America Trek", destinations: "Peru, Bolivia, Chile", year: "2023", rating: 5 },
      { name: "African Safari", destinations: "Kenya, Tanzania", year: "2022", rating: 4.9 }
    ],
    recentPhotos: ["🦁", "🏔️", "🛕", "🌅"],
    reviews: [
      { place: "Machu Picchu", rating: 5, text: "Life-changing experience!" },
      { place: "Angkor Wat", rating: 4.8, text: "Best visited at sunrise" }
    ],
    publications: [
      {
        id: "2",
        images: ["/lovable-uploads/3e9a8a6e-d543-437e-a44d-2f16fac6303f.png"],
        text: "Street food tour in Bangkok was incredible! So many flavors to discover.",
        location: "Bangkok, Thailand",
        createdAt: "1 week ago"
      }
    ],
    achievements: [
      {
        id: "1",
        title: "World Traveler",
        description: "Visit 15 different countries",
        earned: true,
        progress: 15,
        total: 15,
        points: 500,
        earnedDate: "Oct 10, 2024"
      },
      {
        id: "2",
        title: "Digital Nomad",
        description: "Work from 10 different countries",
        earned: false,
        progress: 8,
        total: 10,
        points: 300
      }
    ],
    travelLevel: {
      level: 7,
      title: "Wanderer",
      currentXP: 2100,
      nextLevelXP: 3000
    }
  },
  {
    id: "3",
    name: "Sofia Andersson", 
    avatar: "SA",
    location: "Stockholm, Sweden",
    totalTrips: 9,
    countries: 12,
    followers: 167,
    following: 143,
    bio: "Sustainable travel advocate. Capturing moments, not just photos.",
    pastTrips: [
      { name: "Nordic Adventure", destinations: "Iceland, Norway, Finland", year: "2024", rating: 4.6 },
      { name: "Mediterranean Escape", destinations: "Greece, Croatia, Italy", year: "2023", rating: 4.8 },
      { name: "Morocco Journey", destinations: "Marrakech, Fez, Casablanca", year: "2023", rating: 4.7 }
    ],
    recentPhotos: ["🏔️", "🌊", "🕌", "🐪"],
    reviews: [
      { place: "Santorini", rating: 4.9, text: "Perfect sunset views!" },
      { place: "Marrakech Medina", rating: 4.5, text: "Sensory overload in the best way" }
    ],
    publications: [
      {
        id: "3",
        images: ["/lovable-uploads/2e7d8d8c-8611-4e84-84a8-467fc6bcbdc7.png"],
        text: "Sustainable travel means leaving only footprints and taking only memories.",
        location: "Santorini, Greece",
        createdAt: "3 days ago"
      }
    ],
    achievements: [
      {
        id: "1",
        title: "Eco Warrior",
        description: "Choose sustainable travel options 10 times",
        earned: true,
        progress: 10,
        total: 10,
        points: 200,
        earnedDate: "Nov 30, 2024"
      },
      {
        id: "2",
        title: "Nordic Explorer",
        description: "Visit all Nordic countries",
        earned: false,
        progress: 3,
        total: 5,
        points: 400
      }
    ],
    travelLevel: {
      level: 4,
      title: "Adventurer",
      currentXP: 800,
      nextLevelXP: 1500
    }
  }
];
