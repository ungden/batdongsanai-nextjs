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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          target_id: string | null
          target_table: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      consultation_requests: {
        Row: {
          budget_range: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          occupation: string | null
          phone: string
          preferred_contact_time: string | null
          project_id: string
          project_name: string
          status: string | null
          updated_at: string
        }
        Insert: {
          budget_range?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          occupation?: string | null
          phone: string
          preferred_contact_time?: string | null
          project_id: string
          project_name: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          budget_range?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          occupation?: string | null
          phone?: string
          preferred_contact_time?: string | null
          project_id?: string
          project_name?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      content_items: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          end_date: string | null
          featured_image: string | null
          id: string
          keywords: string[] | null
          meta_description: string | null
          meta_title: string | null
          priority: number | null
          slug: string | null
          start_date: string | null
          status: string
          title: string
          type: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          featured_image?: string | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          priority?: number | null
          slug?: string | null
          start_date?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          featured_image?: string | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          priority?: number | null
          slug?: string | null
          start_date?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          project_id: string
          project_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          project_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          project_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      media_files: {
        Row: {
          alt_text: string | null
          created_at: string
          description: string | null
          file_path: string
          file_size: number
          filename: string
          id: string
          mime_type: string
          original_name: string
          tags: string[] | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          description?: string | null
          file_path: string
          file_size: number
          filename: string
          id?: string
          mime_type: string
          original_name: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number
          filename?: string
          id?: string
          mime_type?: string
          original_name?: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      menus: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          items: Json
          location: string
          name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          items?: Json
          location: string
          name: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          items?: Json
          location?: string
          name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          metadata: Json | null
          payment_gateway: string | null
          payment_method: string
          payment_status: string
          subscription_id: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_gateway?: string | null
          payment_method: string
          payment_status: string
          subscription_id?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_gateway?: string | null
          payment_method?: string
          payment_status?: string
          subscription_id?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          budget_range: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          occupation: string | null
          phone: string | null
          subscription_end_date: string | null
          subscription_type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          budget_range?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          occupation?: string | null
          phone?: string | null
          subscription_end_date?: string | null
          subscription_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          budget_range?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          occupation?: string | null
          phone?: string | null
          subscription_end_date?: string | null
          subscription_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      project_views: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          project_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          project_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          project_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          amenities: string[] | null
          apartment_types: string[] | null
          city: string
          completion_date: string | null
          created_at: string
          created_by: string | null
          current_price: number | null
          description: string | null
          developer: string
          district: string
          floors: number | null
          id: string
          image: string | null
          launch_date: string | null
          launch_price: number | null
          legal_score: number | null
          location: string
          name: string
          price_per_sqm: number | null
          price_range: string | null
          sold_units: number | null
          status: string | null
          total_units: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amenities?: string[] | null
          apartment_types?: string[] | null
          city: string
          completion_date?: string | null
          created_at?: string
          created_by?: string | null
          current_price?: number | null
          description?: string | null
          developer: string
          district: string
          floors?: number | null
          id?: string
          image?: string | null
          launch_date?: string | null
          launch_price?: number | null
          legal_score?: number | null
          location: string
          name: string
          price_per_sqm?: number | null
          price_range?: string | null
          sold_units?: number | null
          status?: string | null
          total_units?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amenities?: string[] | null
          apartment_types?: string[] | null
          city?: string
          completion_date?: string | null
          created_at?: string
          created_by?: string | null
          current_price?: number | null
          description?: string | null
          developer?: string
          district?: string
          floors?: number | null
          id?: string
          image?: string | null
          launch_date?: string | null
          launch_price?: number | null
          legal_score?: number | null
          location?: string
          name?: string
          price_per_sqm?: number | null
          price_range?: string | null
          sold_units?: number | null
          status?: string | null
          total_units?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          description: string | null
          id: string
          is_public: boolean
          key: string
          section: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          is_public?: boolean
          key: string
          section: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          is_public?: boolean
          key?: string
          section?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean | null
          payment_method: string | null
          start_date: string | null
          subscription_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          payment_method?: string | null
          start_date?: string | null
          subscription_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          payment_method?: string | null
          start_date?: string | null
          subscription_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_reports: {
        Row: {
          author_id: string | null
          content: Json
          created_at: string
          id: string
          is_vip_only: boolean | null
          project_id: string
          published_at: string | null
          report_type: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: Json
          created_at?: string
          id?: string
          is_vip_only?: boolean | null
          project_id: string
          published_at?: string | null
          report_type: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: Json
          created_at?: string
          id?: string
          is_vip_only?: boolean | null
          project_id?: string
          published_at?: string | null
          report_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      developers: {
        Row: {
          id: string
          name: string
          logo: string | null
          description: string | null
          established_year: number | null
          website: string | null
          hotline: string | null
          email: string | null
          address: string | null
          total_projects: number
          completed_projects: number
          avg_legal_score: number | null
          avg_rating: number | null
          specialties: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo?: string | null
          description?: string | null
          established_year?: number | null
          website?: string | null
          hotline?: string | null
          email?: string | null
          address?: string | null
          total_projects?: number
          completed_projects?: number
          avg_legal_score?: number | null
          avg_rating?: number | null
          specialties?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo?: string | null
          description?: string | null
          established_year?: number | null
          website?: string | null
          hotline?: string | null
          email?: string | null
          address?: string | null
          total_projects?: number
          completed_projects?: number
          avg_legal_score?: number | null
          avg_rating?: number | null
          specialties?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_vip_active: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const