export interface ProfileData {
  id: string;
  email: string | null;
  full_name: string | null;
  description: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  birth_date: string | null;
  age: number | null;
  address: string | null;
  country: string | null;
  city_state: string | null;
  mobile_phone: string | null;
  country_code: string | null;
  gender: "male" | "female" | "prefer_not_to_say" | null;
  onboarding_completed: boolean | null;
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
