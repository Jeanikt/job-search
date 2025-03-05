export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string
          title: string
          company: string
          location: string
          country: string
          description: string
          url: string
          posted_at: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          company: string
          location: string
          country: string
          description: string
          url: string
          posted_at: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          company?: string
          location?: string
          country?: string
          description?: string
          url?: string
          posted_at?: string
          created_at?: string
        }
      }
      searches: {
        Row: {
          id: string
          user_id: string
          location: string
          country: string
          job_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          location: string
          country: string
          job_type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          location?: string
          country?: string
          job_type?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          is_premium: boolean
          premium_until: string | null
          searches_count: number
          last_search_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          is_premium?: boolean
          premium_until?: string | null
          searches_count?: number
          last_search_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          is_premium?: boolean
          premium_until?: string | null
          searches_count?: number
          last_search_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment: {
        Args: {
          x: number
        }
        Returns: number
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