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
      deeds: {
        Row: {
          created_at: string | null
          description: string | null
          group_id: string | null
          id: string
          is_counter_mode: boolean | null
          metric_type: string
          name: string
          privacy_level: string | null
          recurrence: string
          sub_items: Json | null
          target: number
          target_secondary: number | null
          updated_at: string | null
          user_id: string
          worship_type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          is_counter_mode?: boolean | null
          metric_type: string
          name: string
          privacy_level?: string | null
          recurrence: string
          sub_items?: Json | null
          target: number
          target_secondary?: number | null
          updated_at?: string | null
          user_id: string
          worship_type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          is_counter_mode?: boolean | null
          metric_type?: string
          name?: string
          privacy_level?: string | null
          recurrence?: string
          sub_items?: Json | null
          target?: number
          target_secondary?: number | null
          updated_at?: string | null
          user_id?: string
          worship_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "deeds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          created_at: string | null
          group_id: string
          progress_ratio: number | null
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group_id: string
          progress_ratio?: number | null
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          progress_ratio?: number | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          admin_id: string
          created_at: string | null
          cutoff_time: string | null
          grace_period_hours: number | null
          id: string
          name: string
          visibility: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          cutoff_time?: string | null
          grace_period_hours?: number | null
          id?: string
          name: string
          visibility?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          cutoff_time?: string | null
          grace_period_hours?: number | null
          id?: string
          name?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groups_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone_number: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name: string
          phone_number?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone_number?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      progress_logs: {
        Row: {
          created_at: string | null
          date: string
          deed_id: string
          group_id: string | null
          id: string
          sub_values: Json | null
          updated_at: number | null
          user_id: string
          value: number
          value_secondary: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          deed_id: string
          group_id?: string | null
          id: string
          sub_values?: Json | null
          updated_at?: number | null
          user_id: string
          value?: number
          value_secondary?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          deed_id?: string
          group_id?: string | null
          id?: string
          sub_values?: Json | null
          updated_at?: number | null
          user_id?: string
          value?: number
          value_secondary?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_logs_deed_id_fkey"
            columns: ["deed_id"]
            isOneToOne: false
            referencedRelation: "deeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_logs_user_id_fkey"
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
