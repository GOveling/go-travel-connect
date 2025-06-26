export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      place_reviews: {
        Row: {
          anonymous: boolean | null
          comment: string
          created_at: string
          id: string
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
          avatar_url: string | null
          created_at: string | null
          description: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
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
      trips: {
        Row: {
          accommodation: string | null
          budget: string | null
          created_at: string
          dates: string
          description: string | null
          destination: string
          id: string
          image: string | null
          is_group_trip: boolean | null
          name: string
          status: string
          transportation: string | null
          travelers: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accommodation?: string | null
          budget?: string | null
          created_at?: string
          dates: string
          description?: string | null
          destination: string
          id?: string
          image?: string | null
          is_group_trip?: boolean | null
          name: string
          status?: string
          transportation?: string | null
          travelers?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accommodation?: string | null
          budget?: string | null
          created_at?: string
          dates?: string
          description?: string | null
          destination?: string
          id?: string
          image?: string | null
          is_group_trip?: boolean | null
          name?: string
          status?: string
          transportation?: string | null
          travelers?: number | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
