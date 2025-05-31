
import { useState } from "react";
import TravelerCard from "./TravelerCard";

const TravelersList = () => {
  const [followingStatus, setFollowingStatus] = useState<{ [key: string]: boolean }>({});

  const handleFollow = (userId: string) => {
    setFollowingStatus(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const travelers = [
    {
      id: "1",
      name: "Emma Rodriguez",
      avatar: "ER",
      location: "Barcelona, Spain",
      totalTrips: 12,
      countries: 8,
      followers: 1240,
      following: 89,
      bio: "Adventure seeker and cultural enthusiast. Always looking for the next hidden gem to explore.",
      pastTrips: [
        { name: "Mediterranean Adventure", destinations: "Greece, Italy, Spain", year: "2024", rating: 4.8 },
        { name: "Nordic Expedition", destinations: "Norway, Sweden, Finland", year: "2023", rating: 4.9 }
      ],
      recentPhotos: ["🏛️", "🍝", "🌅", "⛵"],
      reviews: [
        { place: "Santorini, Greece", rating: 5, text: "Absolutely breathtaking sunsets and amazing local cuisine!" }
      ],
      publications: [],
      achievements: [],
      travelLevel: {
        level: 1,
        title: "Explorer",
        currentXP: 100,
        nextLevelXP: 500
      }
    },
    {
      id: "2",
      name: "Marcus Chen",
      avatar: "MC",
      location: "Tokyo, Japan",
      totalTrips: 18,
      countries: 15,
      followers: 2100,
      following: 156,
      bio: "Food lover and photography enthusiast. Documenting flavors and moments from around the world.",
      pastTrips: [
        { name: "Southeast Asia Food Tour", destinations: "Thailand, Vietnam, Malaysia", year: "2024", rating: 4.7 },
        { name: "European City Break", destinations: "Paris, Berlin, Prague", year: "2023", rating: 4.6 }
      ],
      recentPhotos: ["🍜", "📸", "🌸", "🗼"],
      reviews: [
        { place: "Bangkok Street Food", rating: 5, text: "Incredible variety and authentic flavors at every corner!" }
      ],
      publications: [],
      achievements: [],
      travelLevel: {
        level: 2,
        title: "Wanderer",
        currentXP: 750,
        nextLevelXP: 1000
      }
    },
    {
      id: "3",
      name: "Sofia Andersson",
      avatar: "SA",
      location: "Stockholm, Sweden",
      totalTrips: 25,
      countries: 22,
      followers: 3500,
      following: 234,
      bio: "Nature photographer and sustainable travel advocate. Capturing the beauty of our planet responsibly.",
      pastTrips: [
        { name: "Patagonia Wilderness", destinations: "Argentina, Chile", year: "2024", rating: 5.0 },
        { name: "Arctic Circle Adventure", destinations: "Iceland, Greenland", year: "2023", rating: 4.9 }
      ],
      recentPhotos: ["🏔️", "🐧", "❄️", "🌌"],
      reviews: [
        { place: "Torres del Paine", rating: 5, text: "One of the most spectacular landscapes I've ever witnessed!" }
      ],
      publications: [],
      achievements: [],
      travelLevel: {
        level: 4,
        title: "Adventurer",
        currentXP: 2250,
        nextLevelXP: 3000
      }
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {travelers.map((traveler) => (
        <TravelerCard
          key={traveler.id}
          traveler={traveler}
          isFollowing={followingStatus[traveler.id] || false}
          onFollow={handleFollow}
        />
      ))}
    </div>
  );
};

export default TravelersList;
