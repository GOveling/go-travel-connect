export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          created_at: string
          criteria: string
          description: string
          icon: string
          id: string
          points: number
          rarity: string
          title: string
          total_required: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          criteria: string
          description: string
          icon: string
          id: string
          points?: number
          rarity?: string
          title: string
          total_required?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          criteria?: string
          description?: string
          icon?: string
          id?: string
          points?: number
          rarity?: string
          title?: string
          total_required?: number
          updated_at?: string
        }
        Relationships: []
      }
      ai_itineraries: {
        Row: {
          generated_at: string
          id: string
          itinerary_data: Json
          route_type: string
          trip_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          generated_at?: string
          id?: string
          itinerary_data: Json
          route_type: string
          trip_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          generated_at?: string
          id?: string
          itinerary_data?: Json
          route_type?: string
          trip_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      place_reviews: {
        Row: {
          anonymous: boolean | null
          comment: string
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          place_id: string
          place_name: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          anonymous?: boolean | null
          comment: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          place_id: string
          place_name: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          anonymous?: boolean | null
          comment?: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          place_id?: string
          place_name?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          age: number | null
          avatar_url: string | null
          birth_date: string | null
          city_state: string | null
          country: string | null
          country_code: string | null
          created_at: string | null
          description: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          mobile_phone: string | null
          onboarding_completed: boolean | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          avatar_url?: string | null
          birth_date?: string | null
          city_state?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          mobile_phone?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          age?: number | null
          avatar_url?: string | null
          birth_date?: string | null
          city_state?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          mobile_phone?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      saved_places: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          destination_name: string | null
          estimated_time: string | null
          id: string
          image: string | null
          lat: number | null
          lng: number | null
          name: string
          position_order: number | null
          priority: string | null
          rating: number | null
          trip_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          destination_name?: string | null
          estimated_time?: string | null
          id?: string
          image?: string | null
          lat?: number | null
          lng?: number | null
          name: string
          position_order?: number | null
          priority?: string | null
          rating?: number | null
          trip_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          destination_name?: string | null
          estimated_time?: string | null
          id?: string
          image?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          position_order?: number | null
          priority?: string | null
          rating?: number | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_places_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_access_log: {
        Row: {
          granted_at: string
          id: string
          trip_id: string
          user_id: string
        }
        Insert: {
          granted_at?: string
          id?: string
          trip_id: string
          user_id: string
        }
        Update: {
          granted_at?: string
          id?: string
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_access_log_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_collaborators: {
        Row: {
          avatar: string | null
          email: string | null
          id: string
          joined_at: string
          name: string | null
          role: string
          trip_id: string
          user_id: string
        }
        Insert: {
          avatar?: string | null
          email?: string | null
          id?: string
          joined_at?: string
          name?: string | null
          role?: string
          trip_id: string
          user_id: string
        }
        Update: {
          avatar?: string | null
          email?: string | null
          id?: string
          joined_at?: string
          name?: string | null
          role?: string
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_collaborators_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_coordinates: {
        Row: {
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          name: string
          order_index: number | null
          trip_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          order_index?: number | null
          trip_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          order_index?: number | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_coordinates_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          inviter_id: string
          role: string
          status: string
          token: string
          trip_id: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          inviter_id: string
          role?: string
          status?: string
          token: string
          trip_id: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          inviter_id?: string
          role?: string
          status?: string
          token?: string
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_trip_invitations_inviter_id"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trip_invitations_trip_id"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_invitations_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_invitations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_members: {
        Row: {
          created_at: string
          id: string
          role: string
          trip_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          trip_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          trip_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_members_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          accommodation: string | null
          budget: string | null
          collaborators_count: number | null
          created_at: string
          dates: string
          description: string | null
          destination: Json
          end_date: string | null
          id: string
          image: string | null
          is_group_trip: boolean | null
          location: string | null
          name: string
          start_date: string | null
          status: string
          transportation: string | null
          travelers: number | null
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accommodation?: string | null
          budget?: string | null
          collaborators_count?: number | null
          created_at?: string
          dates: string
          description?: string | null
          destination: Json
          end_date?: string | null
          id?: string
          image?: string | null
          is_group_trip?: boolean | null
          location?: string | null
          name: string
          start_date?: string | null
          status?: string
          transportation?: string | null
          travelers?: number | null
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accommodation?: string | null
          budget?: string | null
          collaborators_count?: number | null
          created_at?: string
          dates?: string
          description?: string | null
          destination?: Json
          end_date?: string | null
          id?: string
          image?: string | null
          is_group_trip?: boolean | null
          location?: string | null
          name?: string
          start_date?: string | null
          status?: string
          transportation?: string | null
          travelers?: number | null
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievement_progress: {
        Row: {
          achievement_id: string
          completed_at: string | null
          created_at: string
          current_progress: number
          id: string
          is_completed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          id?: string
          is_completed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          id?: string
          is_completed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievement_progress_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string
          icon: string
          id: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description: string
          icon: string
          id?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          achievement_points: number | null
          cities_explored: number | null
          countries_visited: number | null
          created_at: string
          id: string
          level: number | null
          places_visited: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_points?: number | null
          cities_explored?: number | null
          countries_visited?: number | null
          created_at?: string
          id?: string
          level?: number | null
          places_visited?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_points?: number | null
          cities_explored?: number | null
          countries_visited?: number | null
          created_at?: string
          id?: string
          level?: number | null
          places_visited?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation_optimized: {
        Args: { invitation_token: string; user_email: string; user_id: string }
        Returns: Json
      }
      accept_trip_invitation: {
        Args:
          | { invitation_id: string; user_id: string; accepted_date: string }
          | { p_token: string }
          | { p_token: string; p_user_id: string }
        Returns: boolean
      }
      accept_trip_invitation_v2: {
        Args: { p_token: string }
        Returns: boolean
      }
      accept_trip_invitation_v3: {
        Args: { p_token: string }
        Returns: Json
      }
      calculate_age: {
        Args: { birth_date: string }
        Returns: number
      }
      can_edit_trip: {
        Args: { p_trip_id: string; p_user_id: string }
        Returns: boolean
      }
      extract_country_from_destination: {
        Args: { destination_name: string }
        Returns: string
      }
      generate_invitation_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_pending_invitations: {
        Args: { user_email: string }
        Returns: {
          id: string
          token: string
          trip_id: string
          trip_name: string
          inviter_name: string
          role: string
          created_at: string
          expires_at: string
        }[]
      }
      get_trip_members: {
        Args: { p_trip_id: string }
        Returns: {
          id: string
          trip_id: string
          user_id: string
          role: string
          created_at: string
          name: string
          email: string
        }[]
      }
      get_user_achievements_with_progress: {
        Args: { p_user_id: string }
        Returns: {
          achievement_id: string
          title: string
          description: string
          category: string
          icon: string
          points: number
          total_required: number
          criteria: string
          rarity: string
          current_progress: number
          is_completed: boolean
          completed_at: string
          progress_percentage: number
        }[]
      }
      grant_trip_member_access: {
        Args: { p_trip_id: string; p_user_id: string }
        Returns: undefined
      }
      has_pending_invitation: {
        Args: { trip_id: string; user_id: string }
        Returns: boolean
      }
      is_trip_collaborator: {
        Args: { trip_id: string; user_id: string }
        Returns: boolean
      }
      send_trip_invitation: {
        Args:
          | { p_trip_id: string; p_email: string; p_role?: string }
          | {
              p_trip_id: string
              p_email: string
              p_role?: string
              p_token?: string
            }
        Returns: string
      }
      update_achievement_progress: {
        Args: {
          p_user_id: string
          p_achievement_id: string
          p_progress_increment?: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
