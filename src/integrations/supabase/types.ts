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
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          error_message: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          success: boolean
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          success?: boolean
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          success?: boolean
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      ads: {
        Row: {
          average_rating: number | null
          category: string
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          images: string[] | null
          location: string | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_notes: string | null
          moderation_status: string | null
          phone: string | null
          price: number | null
          rating_count: number | null
          status: string
          title: string
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          average_rating?: number | null
          category: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          images?: string[] | null
          location?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string | null
          phone?: string | null
          price?: number | null
          rating_count?: number | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          average_rating?: number | null
          category?: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          images?: string[] | null
          location?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string | null
          phone?: string | null
          price?: number | null
          rating_count?: number | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          metric_type: string
          metric_value: number | null
          page_url: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          metric_type: string
          metric_value?: number | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          metric_type?: string
          metric_value?: number | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          ad_id: string | null
          created_at: string
          id: string
          last_message_at: string | null
          participants: Json
          updated_at: string
        }
        Insert: {
          ad_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          participants: Json
          updated_at?: string
        }
        Update: {
          ad_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          participants?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      email_events: {
        Row: {
          created_at: string
          email_id: string
          event_type: string
          id: string
          metadata: Json | null
          recipient: string
          subject: string
        }
        Insert: {
          created_at?: string
          email_id: string
          event_type: string
          id?: string
          metadata?: Json | null
          recipient: string
          subject: string
        }
        Update: {
          created_at?: string
          email_id?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          recipient?: string
          subject?: string
        }
        Relationships: []
      }
      email_tracking: {
        Row: {
          bounce_reason: string | null
          created_at: string
          email_address: string
          email_type: string
          id: string
          metadata: Json | null
          provider: string
          risk_level: string | null
          status: string
          updated_at: string
        }
        Insert: {
          bounce_reason?: string | null
          created_at?: string
          email_address: string
          email_type: string
          id?: string
          metadata?: Json | null
          provider?: string
          risk_level?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          bounce_reason?: string | null
          created_at?: string
          email_address?: string
          email_type?: string
          id?: string
          metadata?: Json | null
          provider?: string
          risk_level?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_waitlist: {
        Row: {
          city: string | null
          created_at: string
          email: string
          full_name: string | null
          gender: string | null
          id: string
          notified: boolean
          pseudonym: string | null
          telegram_username: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          gender?: string | null
          id?: string
          notified?: boolean
          pseudonym?: string | null
          telegram_username?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          gender?: string | null
          id?: string
          notified?: boolean
          pseudonym?: string | null
          telegram_username?: string | null
        }
        Relationships: []
      }
      message_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          message_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          message_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          ad_id: string | null
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          is_read: boolean
          recipient_id: string
          sender_id: string
          subject: string | null
        }
        Insert: {
          ad_id?: string | null
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id: string
          sender_id: string
          subject?: string | null
        }
        Update: {
          ad_id?: string | null
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id?: string
          sender_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_reasons: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          id: string
          priority: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json | null
          id?: string
          priority?: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          id?: string
          priority?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          referral_code: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          referral_code?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          referral_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          ad_id: string
          created_at: string
          id: string
          rating_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_id: string
          created_at?: string
          id?: string
          rating_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_id?: string
          created_at?: string
          id?: string
          rating_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_referral_codes_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_points: {
        Row: {
          id: string
          level_1_points: number
          level_2_points: number
          total_points: number
          total_referrals_level_1: number
          total_referrals_level_2: number
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          level_1_points?: number
          level_2_points?: number
          total_points?: number
          total_referrals_level_1?: number
          total_referrals_level_2?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          level_1_points?: number
          level_2_points?: number
          total_points?: number
          total_referrals_level_1?: number
          total_referrals_level_2?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_relationships: {
        Row: {
          created_at: string
          id: string
          level: number
          points_awarded: number
          referral_code_used: string
          referred_user_id: string
          referrer_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level: number
          points_awarded?: number
          referral_code_used: string
          referred_user_id: string
          referrer_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: number
          points_awarded?: number
          referral_code_used?: string
          referred_user_id?: string
          referrer_user_id?: string
        }
        Relationships: []
      }
      role_modification_limits: {
        Row: {
          action_count: number
          admin_user_id: string
          created_at: string
          id: string
          last_action: string
          window_start: string
        }
        Insert: {
          action_count?: number
          admin_user_id: string
          created_at?: string
          id?: string
          last_action?: string
          window_start?: string
        }
        Update: {
          action_count?: number
          admin_user_id?: string
          created_at?: string
          id?: string
          last_action?: string
          window_start?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          description: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          severity: string
          source: string
          url: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          severity: string
          source: string
          url?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          severity?: string
          source?: string
          url?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          current_page: string | null
          id: string
          last_seen: string
          metadata: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          current_page?: string | null
          id?: string
          last_seen?: string
          metadata?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          current_page?: string | null
          id?: string
          last_seen?: string
          metadata?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          active_ads: number
          created_at: string
          id: string
          last_login: string | null
          profile_views: number
          total_ads: number
          total_messages: number
          unread_messages: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active_ads?: number
          created_at?: string
          id?: string
          last_login?: string | null
          profile_views?: number
          total_ads?: number
          total_messages?: number
          unread_messages?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active_ads?: number
          created_at?: string
          id?: string
          last_login?: string | null
          profile_views?: number
          total_ads?: number
          total_messages?: number
          unread_messages?: number
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
      add_user_role: {
        Args: {
          _target_user_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _ip_address?: string
          _user_agent?: string
        }
        Returns: boolean
      }
      analyze_email_bounces: {
        Args: { days_back?: number }
        Returns: {
          email_address: string
          bounce_count: number
          total_emails: number
          bounce_rate: number
          last_bounce_date: string
          risk_assessment: string
        }[]
      }
      check_role_modification_rate_limit: {
        Args: {
          _admin_user_id: string
          _max_actions?: number
          _window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_old_audit_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_email_tracking: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_security_events: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_referral_code: {
        Args: { _user_id: string }
        Returns: string
      }
      get_analytics_summary: {
        Args: { p_start_date?: string; p_end_date?: string }
        Returns: {
          metric_type: string
          total_count: number
          unique_sessions: number
          date_breakdown: Json
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      initialize_referral_system: {
        Args: { _user_id: string }
        Returns: undefined
      }
      log_admin_action: {
        Args: {
          _admin_user_id: string
          _target_user_id?: string
          _action?: string
          _resource_type?: string
          _resource_id?: string
          _old_values?: Json
          _new_values?: Json
          _metadata?: Json
          _ip_address?: string
          _user_agent?: string
        }
        Returns: string
      }
      process_referral: {
        Args: { _referred_user_id: string; _referral_code: string }
        Returns: undefined
      }
      remove_user_role: {
        Args: {
          _target_user_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _ip_address?: string
          _user_agent?: string
        }
        Returns: boolean
      }
      track_metric: {
        Args: {
          p_metric_type: string
          p_metric_value?: number
          p_page_url?: string
          p_user_agent?: string
          p_referrer?: string
          p_ip_address?: string
          p_session_id?: string
          p_metadata?: Json
        }
        Returns: string
      }
      user_has_moderation_rights: {
        Args: { _user_id: string }
        Returns: boolean
      }
      validate_role_change: {
        Args: {
          _admin_user_id: string
          _target_user_id: string
          _new_role: Database["public"]["Enums"]["app_role"]
          _action?: string
        }
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
