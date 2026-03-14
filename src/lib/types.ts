export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          description: string | null
          icon_url: string | null
          id: string
          name: string
          slug: string
          trigger_type: string
          trigger_value: number
        }
        Insert: {
          description?: string | null
          icon_url?: string | null
          id?: string
          name: string
          slug: string
          trigger_type: string
          trigger_value: number
        }
        Update: {
          description?: string | null
          icon_url?: string | null
          id?: string
          name?: string
          slug?: string
          trigger_type?: string
          trigger_value?: number
        }
        Relationships: []
      }
      cafes: {
        Row: {
          checkin_count: number | null
          city: string | null
          created_at: string | null
          id: string
          lat: number
          lng: number
          name: string
          neighborhood: string | null
          osm_id: string | null
        }
        Insert: {
          checkin_count?: number | null
          city?: string | null
          created_at?: string | null
          id?: string
          lat: number
          lng: number
          name: string
          neighborhood?: string | null
          osm_id?: string | null
        }
        Update: {
          checkin_count?: number | null
          city?: string | null
          created_at?: string | null
          id?: string
          lat?: number
          lng?: number
          name?: string
          neighborhood?: string | null
          osm_id?: string | null
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          cafe_id: string | null
          id: string
          user_id: string | null
          visit_number: number | null
          visited_at: string | null
        }
        Insert: {
          cafe_id?: string | null
          id?: string
          user_id?: string | null
          visit_number?: number | null
          visited_at?: string | null
        }
        Update: {
          cafe_id?: string | null
          id?: string
          user_id?: string | null
          visit_number?: number | null
          visited_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          total_checkins: number | null
          unique_cafes: number | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          total_checkins?: number | null
          unique_cafes?: number | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          total_checkins?: number | null
          unique_cafes?: number | null
          username?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          brew_method: string | null
          checkin_id: string | null
          id: string
          note: string | null
          photo_url: string | null
          rating: number | null
        }
        Insert: {
          brew_method?: string | null
          checkin_id?: string | null
          id?: string
          note?: string | null
          photo_url?: string | null
          rating?: number | null
        }
        Update: {
          brew_method?: string | null
          checkin_id?: string | null
          id?: string
          note?: string | null
          photo_url?: string | null
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_checkin_id_fkey"
            columns: ["checkin_id"]
            isOneToOne: false
            referencedRelation: "check_ins"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string | null
          earned_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          badge_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          badge_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

export type Profile  = DefaultSchema["Tables"]["profiles"]["Row"]
export type Cafe     = DefaultSchema["Tables"]["cafes"]["Row"]
export type CheckIn  = DefaultSchema["Tables"]["check_ins"]["Row"]
export type Review   = DefaultSchema["Tables"]["reviews"]["Row"]
export type Follow   = DefaultSchema["Tables"]["follows"]["Row"]
export type Badge    = DefaultSchema["Tables"]["badges"]["Row"]
export type UserBadge = DefaultSchema["Tables"]["user_badges"]["Row"]
