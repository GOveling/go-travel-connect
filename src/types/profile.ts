
export interface ProfileData {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TravelStats {
  countries_visited: number;
  cities_explored: number;
  places_visited: number;
  achievement_points: number;
  level: number;
}

export interface ActivityItem {
  id: string;
  activity_type: string;
  description: string;
  icon: string;
  created_at: string;
}

export interface MenuItemConfig {
  icon: any;
  title: string;
  subtitle: string;
  color: string;
  onClick: () => void;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  dates: string;
  status: string;
  travelers: number;
  user_id: string;
  created_at: string;
}
