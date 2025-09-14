export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
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
      countries: {
        Row: {
          country_code: string | null
          country_name: string
          created_at: string
          flag_emoji: string | null
          id: string
          image_url: string | null
          updated_at: string
        }
        Insert: {
          country_code?: string | null
          country_name: string
          created_at?: string
          flag_emoji?: string | null
          id?: string
          image_url?: string | null
          updated_at?: string
        }
        Update: {
          country_code?: string | null
          country_name?: string
          created_at?: string
          flag_emoji?: string | null
          id?: string
          image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      document_access_log: {
        Row: {
          access_timestamp: string
          action_type: string
          document_id: string
          error_details: string | null
          id: string
          ip_address: unknown | null
          success: boolean
          user_agent: string | null
          user_id: string
        }
        Insert: {
          access_timestamp?: string
          action_type: string
          document_id: string
          error_details?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean
          user_agent?: string | null
          user_id: string
        }
        Update: {
          access_timestamp?: string
          action_type?: string
          document_id?: string
          error_details?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_access_log_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "encrypted_travel_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      encrypted_travel_documents: {
        Row: {
          access_count: number | null
          created_at: string
          document_type: string
          encrypted_metadata: string
          encryption_key_hash: string | null
          expires_at: string | null
          file_path: string | null
          id: string
          last_accessed_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_count?: number | null
          created_at?: string
          document_type: string
          encrypted_metadata: string
          encryption_key_hash?: string | null
          expires_at?: string | null
          file_path?: string | null
          id?: string
          last_accessed_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_count?: number | null
          created_at?: string
          document_type?: string
          encrypted_metadata?: string
          encryption_key_hash?: string | null
          expires_at?: string | null
          file_path?: string | null
          id?: string
          last_accessed_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      password_validation_log: {
        Row: {
          attempted_at: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
          validation_result: boolean
        }
        Insert: {
          attempted_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
          validation_result: boolean
        }
        Update: {
          attempted_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
          validation_result?: boolean
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
      place_visits: {
        Row: {
          city: string | null
          confirmation_distance: number
          country: string | null
          created_at: string
          id: string
          location_lat: number
          location_lat_encrypted: string | null
          location_lng: number
          location_lng_encrypted: string | null
          place_category: string | null
          place_name: string
          place_name_encrypted: string | null
          region: string | null
          saved_place_id: string
          trip_id: string
          user_id: string
          visited_at: string
        }
        Insert: {
          city?: string | null
          confirmation_distance: number
          country?: string | null
          created_at?: string
          id?: string
          location_lat: number
          location_lat_encrypted?: string | null
          location_lng: number
          location_lng_encrypted?: string | null
          place_category?: string | null
          place_name: string
          place_name_encrypted?: string | null
          region?: string | null
          saved_place_id: string
          trip_id: string
          user_id: string
          visited_at?: string
        }
        Update: {
          city?: string | null
          confirmation_distance?: number
          country?: string | null
          created_at?: string
          id?: string
          location_lat?: number
          location_lat_encrypted?: string | null
          location_lng?: number
          location_lng_encrypted?: string | null
          place_category?: string | null
          place_name?: string
          place_name_encrypted?: string | null
          region?: string | null
          saved_place_id?: string
          trip_id?: string
          user_id?: string
          visited_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          address_encrypted: string | null
          age: number | null
          avatar_url: string | null
          birth_date: string | null
          birth_date_encrypted: string | null
          city_state: string | null
          country: string | null
          country_code: string | null
          created_at: string | null
          description: string | null
          email: string | null
          email_encrypted: string | null
          full_name: string | null
          full_name_encrypted: string | null
          gender: string | null
          id: string
          mobile_phone: string | null
          mobile_phone_encrypted: string | null
          onboarding_completed: boolean | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          address_encrypted?: string | null
          age?: number | null
          avatar_url?: string | null
          birth_date?: string | null
          birth_date_encrypted?: string | null
          city_state?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          email_encrypted?: string | null
          full_name?: string | null
          full_name_encrypted?: string | null
          gender?: string | null
          id: string
          mobile_phone?: string | null
          mobile_phone_encrypted?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          address_encrypted?: string | null
          age?: number | null
          avatar_url?: string | null
          birth_date?: string | null
          birth_date_encrypted?: string | null
          city_state?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          email_encrypted?: string | null
          full_name?: string | null
          full_name_encrypted?: string | null
          gender?: string | null
          id?: string
          mobile_phone?: string | null
          mobile_phone_encrypted?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      saved_places: {
        Row: {
          address_json: Json | null
          category: string | null
          city: string | null
          country: string | null
          created_at: string
          description: string | null
          destination_name: string | null
          district: string | null
          estimated_time: string | null
          formatted_address: string | null
          id: string
          image: string | null
          lat: number | null
          lng: number | null
          name: string
          neighborhood: string | null
          place_reference: string | null
          place_source: string | null
          position_order: number | null
          postal_code: string | null
          priority: string | null
          rating: number | null
          region: string | null
          reminder_note: string | null
          state: string | null
          street: string | null
          street_number: string | null
          trip_id: string
        }
        Insert: {
          address_json?: Json | null
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          destination_name?: string | null
          district?: string | null
          estimated_time?: string | null
          formatted_address?: string | null
          id?: string
          image?: string | null
          lat?: number | null
          lng?: number | null
          name: string
          neighborhood?: string | null
          place_reference?: string | null
          place_source?: string | null
          position_order?: number | null
          postal_code?: string | null
          priority?: string | null
          rating?: number | null
          region?: string | null
          reminder_note?: string | null
          state?: string | null
          street?: string | null
          street_number?: string | null
          trip_id: string
        }
        Update: {
          address_json?: Json | null
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          destination_name?: string | null
          district?: string | null
          estimated_time?: string | null
          formatted_address?: string | null
          id?: string
          image?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          neighborhood?: string | null
          place_reference?: string | null
          place_source?: string | null
          position_order?: number | null
          postal_code?: string | null
          priority?: string | null
          rating?: number | null
          region?: string | null
          reminder_note?: string | null
          state?: string | null
          street?: string | null
          street_number?: string | null
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
      security_audit_log: {
        Row: {
          action_type: string
          details: Json | null
          id: string
          ip_address: string | null
          table_name: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          table_name: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          table_name?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
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
      trip_debt_backups: {
        Row: {
          amount: number
          counterparty_name: string
          counterparty_user_id: string | null
          created_at: string
          id: string
          notes: string | null
          removed_user_id: string
          removed_user_name: string
          trip_id: string
        }
        Insert: {
          amount: number
          counterparty_name: string
          counterparty_user_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          removed_user_id: string
          removed_user_name: string
          trip_id: string
        }
        Update: {
          amount?: number
          counterparty_name?: string
          counterparty_user_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          removed_user_id?: string
          removed_user_name?: string
          trip_id?: string
        }
        Relationships: []
      }
      trip_decision_votes: {
        Row: {
          created_at: string
          decision_id: string
          id: string
          option_index: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          decision_id: string
          id?: string
          option_index: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          decision_id?: string
          id?: string
          option_index?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_decision_votes_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "trip_decisions"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_decisions: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          options: Json
          selected_participants: Json
          status: string
          title: string
          trip_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          options?: Json
          selected_participants?: Json
          status?: string
          title: string
          trip_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          options?: Json
          selected_participants?: Json
          status?: string
          title?: string
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_decisions_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_expenses: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          description: string
          id: string
          paid_by: Json
          split_between: Json
          trip_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          description: string
          id?: string
          paid_by?: Json
          split_between?: Json
          trip_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          paid_by?: Json
          split_between?: Json
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_expenses_trip_id_fkey"
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
      trip_shared_locations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          lat: number
          lng: number
          location_type: string
          shared_at: string
          trip_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          lat: number
          lng: number
          location_type?: string
          shared_at?: string
          trip_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          lat?: number
          lng?: number
          location_type?: string
          shared_at?: string
          trip_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trips: {
        Row: {
          accommodation: string | null
          budget: string | null
          collaborators_count: number | null
          created_at: string
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
      trips_hidden_by_user: {
        Row: {
          hidden_at: string
          id: string
          trip_id: string
          user_id: string
        }
        Insert: {
          hidden_at?: string
          id?: string
          trip_id: string
          user_id: string
        }
        Update: {
          hidden_at?: string
          id?: string
          trip_id?: string
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
          attractions_visited: number | null
          cities_explored: number | null
          countries_visited: number | null
          created_at: string
          hotels_visited: number | null
          id: string
          landmarks_visited: number | null
          level: number | null
          museums_visited: number | null
          other_places_visited: number | null
          parks_visited: number | null
          places_visited: number | null
          restaurants_visited: number | null
          shops_visited: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_points?: number | null
          attractions_visited?: number | null
          cities_explored?: number | null
          countries_visited?: number | null
          created_at?: string
          hotels_visited?: number | null
          id?: string
          landmarks_visited?: number | null
          level?: number | null
          museums_visited?: number | null
          other_places_visited?: number | null
          parks_visited?: number | null
          places_visited?: number | null
          restaurants_visited?: number | null
          shops_visited?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_points?: number | null
          attractions_visited?: number | null
          cities_explored?: number | null
          countries_visited?: number | null
          created_at?: string
          hotels_visited?: number | null
          id?: string
          landmarks_visited?: number | null
          level?: number | null
          museums_visited?: number | null
          other_places_visited?: number | null
          parks_visited?: number | null
          places_visited?: number | null
          restaurants_visited?: number | null
          shops_visited?: number | null
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
          | { accepted_date: string; invitation_id: string; user_id: string }
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
      anonymize_location_history: {
        Args: { p_older_than_days?: number; p_user_id: string }
        Returns: boolean
      }
      are_trip_collaborators: {
        Args: { user1_id: string; user2_id: string }
        Returns: boolean
      }
      calculate_age: {
        Args: { birth_date: string }
        Returns: number
      }
      can_edit_trip: {
        Args: { p_trip_id: string; p_user_id: string }
        Returns: boolean
      }
      cleanup_expired_shared_locations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_audit_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      confirm_place_visit: {
        Args: {
          p_confirmation_distance: number
          p_location_lat: number
          p_location_lng: number
          p_saved_place_id: string
        }
        Returns: Json
      }
      create_place_visit_secure: {
        Args: {
          p_city?: string
          p_confirmation_distance: number
          p_country?: string
          p_location_lat: number
          p_location_lng: number
          p_place_category?: string
          p_place_name: string
          p_region?: string
          p_saved_place_id: string
          p_trip_id: string
          p_user_id: string
        }
        Returns: string
      }
      decrypt_sensitive_field: {
        Args: { encrypted_value: string }
        Returns: string
      }
      deobfuscate_location_data: {
        Args: { obfuscated_value: string }
        Returns: string
      }
      deobfuscate_sensitive_field: {
        Args: { obfuscated_value: string }
        Returns: string
      }
      encrypt_sensitive_field: {
        Args: { field_value: string }
        Returns: string
      }
      extract_country_from_destination: {
        Args: { destination_name: string }
        Returns: string
      }
      generate_invitation_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_collaborator_profile_safe: {
        Args: { p_user_id: string }
        Returns: {
          avatar_url: string
          full_name: string
          id: string
        }[]
      }
      get_pending_invitations: {
        Args: { user_email: string }
        Returns: {
          created_at: string
          expires_at: string
          id: string
          inviter_name: string
          role: string
          token: string
          trip_id: string
          trip_name: string
        }[]
      }
      get_place_review_stats: {
        Args: {
          p_lat?: number
          p_lng?: number
          p_place_id: string
          p_place_name: string
        }
        Returns: {
          average_rating: number
          rating_distribution: Json
          total_reviews: number
        }[]
      }
      get_place_reviews_count: {
        Args: {
          p_lat?: number
          p_lng?: number
          p_place_id: string
          p_place_name: string
        }
        Returns: number
      }
      get_place_reviews_public: {
        Args: {
          p_lat?: number
          p_limit?: number
          p_lng?: number
          p_offset?: number
          p_place_id: string
          p_place_name: string
        }
        Returns: {
          anonymous: boolean
          comment: string
          created_at: string
          id: string
          place_id: string
          place_name: string
          rating: number
          updated_at: string
          user_id: string
        }[]
      }
      get_place_reviews_secure: {
        Args: {
          p_lat?: number
          p_limit?: number
          p_lng?: number
          p_offset?: number
          p_place_id: string
          p_place_name: string
        }
        Returns: {
          anonymous: boolean
          comment: string
          created_at: string
          id: string
          rating: number
          reviewer_display_name: string
        }[]
      }
      get_place_visit_exact_location: {
        Args: { p_user_id: string; p_visit_id: string }
        Returns: {
          confirmation_distance: number
          latitude: number
          longitude: number
        }[]
      }
      get_place_visit_info: {
        Args: { p_saved_place_id: string; p_user_id: string }
        Returns: {
          confirmation_distance: number
          visited: boolean
          visited_at: string
        }[]
      }
      get_profile_public: {
        Args: { p_user_id: string }
        Returns: {
          avatar_url: string
          country: string
          description: string
          display_name: string
          id: string
        }[]
      }
      get_profile_secure: {
        Args: { p_user_id: string }
        Returns: {
          address: string
          age: number
          avatar_url: string
          birth_date: string
          city_state: string
          country: string
          country_code: string
          created_at: string
          description: string
          email: string
          full_name: string
          gender: string
          id: string
          mobile_phone: string
          onboarding_completed: boolean
          updated_at: string
        }[]
      }
      get_trip_collaborator_profiles: {
        Args: { p_trip_id: string }
        Returns: {
          avatar_url: string
          full_name: string
          id: string
          role: string
        }[]
      }
      get_trip_members: {
        Args: { p_trip_id: string }
        Returns: {
          created_at: string
          email: string
          id: string
          name: string
          role: string
          trip_id: string
          user_id: string
        }[]
      }
      get_trip_user_profile: {
        Args: { p_trip_id: string; p_user_id: string }
        Returns: {
          avatar_url: string
          email: string
          full_name: string
          id: string
        }[]
      }
      get_user_achievements_with_progress: {
        Args: { p_user_id: string }
        Returns: {
          achievement_id: string
          category: string
          completed_at: string
          criteria: string
          current_progress: number
          description: string
          icon: string
          is_completed: boolean
          points: number
          progress_percentage: number
          rarity: string
          title: string
          total_required: number
        }[]
      }
      get_user_location_visits_secure: {
        Args: { p_limit?: number; p_offset?: number; p_user_id: string }
        Returns: {
          approximate_location: string
          city: string
          country: string
          id: string
          place_category: string
          place_name: string
          region: string
          trip_id: string
          visited_at: string
        }[]
      }
      get_user_pending_invitations: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          expires_at: string
          invitation_id: string
          inviter_name: string
          role: string
          trip_id: string
          trip_name: string
        }[]
      }
      get_users_public_profile_min: {
        Args: { p_user_ids: string[] }
        Returns: {
          avatar_url: string
          full_name: string
          id: string
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
      has_pending_invitation_to_trip: {
        Args: { p_trip_id: string; p_user_id: string }
        Returns: boolean
      }
      is_place_visited_by_user: {
        Args: { p_saved_place_id: string; p_user_id: string }
        Returns: boolean
      }
      is_trip_collaborator: {
        Args: { trip_id: string; user_id: string }
        Returns: boolean
      }
      is_trip_hidden_by_user: {
        Args: { p_trip_id: string; p_user_id: string }
        Returns: boolean
      }
      log_password_validation: {
        Args: {
          p_ip_address?: unknown
          p_user_agent?: string
          p_user_id?: string
          p_validation_result?: boolean
        }
        Returns: undefined
      }
      monitor_review_access_patterns: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      obfuscate_location_data: {
        Args: { location_value: string }
        Returns: string
      }
      obfuscate_sensitive_field: {
        Args: { field_value: string }
        Returns: string
      }
      remove_collaborator_and_archive: {
        Args: { p_trip_id: string; p_user_id: string }
        Returns: Json
      }
      send_trip_invitation: {
        Args:
          | {
              p_email: string
              p_role?: string
              p_token?: string
              p_trip_id: string
            }
          | { p_email: string; p_role?: string; p_trip_id: string }
        Returns: string
      }
      update_achievement_progress: {
        Args: {
          p_achievement_id: string
          p_progress_increment?: number
          p_user_id: string
        }
        Returns: undefined
      }
      update_profile_secure: {
        Args: {
          p_address?: string
          p_avatar_url?: string
          p_birth_date?: string
          p_city_state?: string
          p_country?: string
          p_country_code?: string
          p_description?: string
          p_email?: string
          p_full_name?: string
          p_gender?: string
          p_mobile_phone?: string
          p_user_id: string
        }
        Returns: boolean
      }
      validate_password_strength: {
        Args: { password_input: string }
        Returns: Json
      }
      validate_profile_access: {
        Args: { profile_id: string }
        Returns: boolean
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
