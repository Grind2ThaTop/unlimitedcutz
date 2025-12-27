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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      account_roles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          created_at: string
          id: string
          matching_l1_percent: number
          matching_l2_percent: number
          matrix_percent: number
          updated_at: string
          upgraded_at: string | null
          user_id: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string
          id?: string
          matching_l1_percent?: number
          matching_l2_percent?: number
          matrix_percent?: number
          updated_at?: string
          upgraded_at?: string | null
          user_id: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string
          id?: string
          matching_l1_percent?: number
          matching_l2_percent?: number
          matrix_percent?: number
          updated_at?: string
          upgraded_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      commission_events: {
        Row: {
          amount: number
          commission_type: Database["public"]["Enums"]["commission_type"]
          created_at: string
          description: string | null
          id: string
          level: number | null
          paid_at: string | null
          source_user_id: string | null
          status: Database["public"]["Enums"]["payout_status"]
          user_id: string
        }
        Insert: {
          amount: number
          commission_type: Database["public"]["Enums"]["commission_type"]
          created_at?: string
          description?: string | null
          id?: string
          level?: number | null
          paid_at?: string | null
          source_user_id?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          user_id: string
        }
        Update: {
          amount?: number
          commission_type?: Database["public"]["Enums"]["commission_type"]
          created_at?: string
          description?: string | null
          id?: string
          level?: number | null
          paid_at?: string | null
          source_user_id?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          user_id?: string
        }
        Relationships: []
      }
      connections: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_primary: boolean
          last_visit: string | null
          membership_id: string
          name: string
          removed_at: string | null
          slot_locked_until: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          last_visit?: string | null
          membership_id: string
          name: string
          removed_at?: string | null
          slot_locked_until?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          last_visit?: string | null
          membership_id?: string
          name?: string
          removed_at?: string | null
          slot_locked_until?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      matrix_nodes: {
        Row: {
          created_at: string
          id: string
          left_child: string | null
          level: number
          middle_child: string | null
          parent_id: string | null
          placed_at: string | null
          placement_source:
            | Database["public"]["Enums"]["placement_source"]
            | null
          position: number | null
          position_index: number | null
          right_child: string | null
          sponsor_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          left_child?: string | null
          level?: number
          middle_child?: string | null
          parent_id?: string | null
          placed_at?: string | null
          placement_source?:
            | Database["public"]["Enums"]["placement_source"]
            | null
          position?: number | null
          position_index?: number | null
          right_child?: string | null
          sponsor_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          left_child?: string | null
          level?: number
          middle_child?: string | null
          parent_id?: string | null
          placed_at?: string | null
          placement_source?:
            | Database["public"]["Enums"]["placement_source"]
            | null
          position?: number | null
          position_index?: number | null
          right_child?: string | null
          sponsor_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matrix_nodes_left_child_fkey"
            columns: ["left_child"]
            isOneToOne: false
            referencedRelation: "matrix_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matrix_nodes_middle_child_fkey"
            columns: ["middle_child"]
            isOneToOne: false
            referencedRelation: "matrix_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matrix_nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "matrix_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matrix_nodes_right_child_fkey"
            columns: ["right_child"]
            isOneToOne: false
            referencedRelation: "matrix_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      member_ranks: {
        Row: {
          active_bronze_count: number
          active_gold_count: number
          active_platinum_count: number
          active_silver_count: number
          created_at: string
          current_rank: Database["public"]["Enums"]["member_rank"]
          id: string
          is_active: boolean
          last_evaluated_at: string | null
          personally_enrolled_count: number
          rank_qualified_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_bronze_count?: number
          active_gold_count?: number
          active_platinum_count?: number
          active_silver_count?: number
          created_at?: string
          current_rank?: Database["public"]["Enums"]["member_rank"]
          id?: string
          is_active?: boolean
          last_evaluated_at?: string | null
          personally_enrolled_count?: number
          rank_qualified_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_bronze_count?: number
          active_gold_count?: number
          active_platinum_count?: number
          active_silver_count?: number
          created_at?: string
          current_rank?: Database["public"]["Enums"]["member_rank"]
          id?: string
          is_active?: boolean
          last_evaluated_at?: string | null
          personally_enrolled_count?: number
          rank_qualified_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          addon_amount: number
          base_amount: number
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          membership_id: string | null
          status: Database["public"]["Enums"]["membership_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          addon_amount?: number
          base_amount?: number
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          membership_id?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          addon_amount?: number
          base_amount?: number
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          membership_id?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity?: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "product_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_requests: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string
          method_details: string | null
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method: string
          method_details?: string | null
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          method_details?: string | null
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      placement_logs: {
        Row: {
          checks_passed: Json
          created_at: string
          id: string
          level: number
          matrix_node_id: string
          placed_under_user_id: string | null
          placement_source: Database["public"]["Enums"]["placement_source"]
          position: number | null
          position_index: number
          related_events: Json | null
          sponsor_id: string | null
          user_id: string
        }
        Insert: {
          checks_passed?: Json
          created_at?: string
          id?: string
          level: number
          matrix_node_id: string
          placed_under_user_id?: string | null
          placement_source: Database["public"]["Enums"]["placement_source"]
          position?: number | null
          position_index: number
          related_events?: Json | null
          sponsor_id?: string | null
          user_id: string
        }
        Update: {
          checks_passed?: Json
          created_at?: string
          id?: string
          level?: number
          matrix_node_id?: string
          placed_under_user_id?: string | null
          placement_source?: Database["public"]["Enums"]["placement_source"]
          position?: number | null
          position_index?: number
          related_events?: Json | null
          sponsor_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "placement_logs_matrix_node_id_fkey"
            columns: ["matrix_node_id"]
            isOneToOne: false
            referencedRelation: "matrix_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      product_orders: {
        Row: {
          created_at: string
          id: string
          status: string
          stripe_payment_intent_id: string | null
          total_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          total_amount: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          total_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          member_price: number
          name: string
          price: number
          rating: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          member_price: number
          name: string
          price: number
          rating?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          member_price?: number
          name?: string
          price?: number
          rating?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cashapp_username: string | null
          created_at: string
          email: string
          facebook_url: string | null
          full_name: string | null
          id: string
          instagram_url: string | null
          paypal_email: string | null
          referral_code: string | null
          referred_by: string | null
          tiktok_url: string | null
          updated_at: string
          x_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cashapp_username?: string | null
          created_at?: string
          email: string
          facebook_url?: string | null
          full_name?: string | null
          id: string
          instagram_url?: string | null
          paypal_email?: string | null
          referral_code?: string | null
          referred_by?: string | null
          tiktok_url?: string | null
          updated_at?: string
          x_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cashapp_username?: string | null
          created_at?: string
          email?: string
          facebook_url?: string | null
          full_name?: string | null
          id?: string
          instagram_url?: string | null
          paypal_email?: string | null
          referral_code?: string | null
          referred_by?: string | null
          tiktok_url?: string | null
          updated_at?: string
          x_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rank_history: {
        Row: {
          changed_at: string
          id: string
          new_rank: Database["public"]["Enums"]["member_rank"]
          old_rank: Database["public"]["Enums"]["member_rank"] | null
          reason: string | null
          user_id: string
        }
        Insert: {
          changed_at?: string
          id?: string
          new_rank: Database["public"]["Enums"]["member_rank"]
          old_rank?: Database["public"]["Enums"]["member_rank"] | null
          reason?: string | null
          user_id: string
        }
        Update: {
          changed_at?: string
          id?: string
          new_rank?: Database["public"]["Enums"]["member_rank"]
          old_rank?: Database["public"]["Enums"]["member_rank"] | null
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist_entries: {
        Row: {
          created_at: string
          email: string
          id: string
          invited_at: string | null
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invited_at?: string | null
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invited_at?: string | null
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_matrix_ancestor: {
        Args: { _node_user_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      account_type: "client" | "barber"
      app_role: "member" | "admin"
      commission_type:
        | "fast_start"
        | "level_bonus"
        | "matrix_membership"
        | "product_commission"
        | "matching_bonus"
      member_rank:
        | "bronze"
        | "silver"
        | "gold"
        | "platinum"
        | "diamond"
        | "partner"
      membership_status: "active" | "past_due" | "canceled" | "pending"
      payout_status: "pending" | "paid" | "canceled"
      placement_source: "direct_signup" | "spillover" | "admin_placement"
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
      account_type: ["client", "barber"],
      app_role: ["member", "admin"],
      commission_type: [
        "fast_start",
        "level_bonus",
        "matrix_membership",
        "product_commission",
        "matching_bonus",
      ],
      member_rank: [
        "bronze",
        "silver",
        "gold",
        "platinum",
        "diamond",
        "partner",
      ],
      membership_status: ["active", "past_due", "canceled", "pending"],
      payout_status: ["pending", "paid", "canceled"],
      placement_source: ["direct_signup", "spillover", "admin_placement"],
    },
  },
} as const
