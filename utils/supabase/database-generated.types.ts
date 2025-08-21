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
      game: {
        Row: {
          created_at: string
          created_by_team_id: string | null
          created_by_user_id: string
          ended_at: string | null
          field: string | null
          game_data: Json
          id: string
          location_id: string
          name: string
          scheduled_start_time: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["game_status"]
          tournament_id: string | null
        }
        Insert: {
          created_at?: string
          created_by_team_id?: string | null
          created_by_user_id: string
          ended_at?: string | null
          field?: string | null
          game_data?: Json
          id?: string
          location_id: string
          name: string
          scheduled_start_time?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["game_status"]
          tournament_id?: string | null
        }
        Update: {
          created_at?: string
          created_by_team_id?: string | null
          created_by_user_id?: string
          ended_at?: string | null
          field?: string | null
          game_data?: Json
          id?: string
          location_id?: string
          name?: string
          scheduled_start_time?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["game_status"]
          tournament_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_created_by_team_id_fkey"
            columns: ["created_by_team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournament"
            referencedColumns: ["id"]
          },
        ]
      }
      game_action: {
        Row: {
          action_data: Json
          action_type: Database["public"]["Enums"]["game_action_type"]
          created_at: string
          game_id: string
          id: string
          index: number
          previous_action_id: string | null
        }
        Insert: {
          action_data?: Json
          action_type: Database["public"]["Enums"]["game_action_type"]
          created_at?: string
          game_id: string
          id?: string
          index: number
          previous_action_id?: string | null
        }
        Update: {
          action_data?: Json
          action_type?: Database["public"]["Enums"]["game_action_type"]
          created_at?: string
          game_id?: string
          id?: string
          index?: number
          previous_action_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_action_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "game"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_action_previous_action_id_fkey"
            columns: ["previous_action_id"]
            isOneToOne: true
            referencedRelation: "game_action"
            referencedColumns: ["id"]
          },
        ]
      }
      game_team: {
        Row: {
          created_at: string
          game_id: string
          role: Database["public"]["Enums"]["team_role"]
          team_id: string
        }
        Insert: {
          created_at?: string
          game_id: string
          role: Database["public"]["Enums"]["team_role"]
          team_id: string
        }
        Update: {
          created_at?: string
          game_id?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_team_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "game"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_team_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
        ]
      }
      location: {
        Row: {
          address: string | null
          city: string
          created_at: string
          created_by_team_id: string | null
          id: string
          name: string
          state: string | null
        }
        Insert: {
          address?: string | null
          city: string
          created_at?: string
          created_by_team_id?: string | null
          id?: string
          name: string
          state?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          created_at?: string
          created_by_team_id?: string | null
          id?: string
          name?: string
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "location_created_by_team_id_fkey"
            columns: ["created_by_team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
        ]
      }
      player: {
        Row: {
          created_at: string
          id: string
          name: string
          nickname: string | null
          primary_position: Database["public"]["Enums"]["fielding_position"]
          secondary_position:
            | Database["public"]["Enums"]["fielding_position"]
            | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          nickname?: string | null
          primary_position?: Database["public"]["Enums"]["fielding_position"]
          secondary_position?:
            | Database["public"]["Enums"]["fielding_position"]
            | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          nickname?: string | null
          primary_position?: Database["public"]["Enums"]["fielding_position"]
          secondary_position?:
            | Database["public"]["Enums"]["fielding_position"]
            | null
        }
        Relationships: []
      }
      player_team: {
        Row: {
          jersey_number: string | null
          joined_at: string
          player_id: string
          team_id: string
        }
        Insert: {
          jersey_number?: string | null
          joined_at?: string
          player_id: string
          team_id: string
        }
        Update: {
          jersey_number?: string | null
          joined_at?: string
          player_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_team_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_team_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
        ]
      }
      region: {
        Row: {
          created_at: string
          id: string
          name: string
          short_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          short_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          short_name?: string | null
        }
        Relationships: []
      }
      team: {
        Row: {
          admin_note: string | null
          associated_team_id: string | null
          created_at: string
          id: string
          location_city: string | null
          location_state: string | null
          name: string
          primary_region_id: string | null
        }
        Insert: {
          admin_note?: string | null
          associated_team_id?: string | null
          created_at?: string
          id?: string
          location_city?: string | null
          location_state?: string | null
          name: string
          primary_region_id?: string | null
        }
        Update: {
          admin_note?: string | null
          associated_team_id?: string | null
          created_at?: string
          id?: string
          location_city?: string | null
          location_state?: string | null
          name?: string
          primary_region_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_associated_team_id_fkey"
            columns: ["associated_team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_primary_region_id_fkey"
            columns: ["primary_region_id"]
            isOneToOne: false
            referencedRelation: "region"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament: {
        Row: {
          association: string | null
          created_at: string
          end_date: string
          id: string
          location_city: string | null
          location_id: string | null
          location_state: string | null
          name: string
          region_id: string
          start_date: string
          tournament_data: Json
        }
        Insert: {
          association?: string | null
          created_at?: string
          end_date: string
          id?: string
          location_city?: string | null
          location_id?: string | null
          location_state?: string | null
          name: string
          region_id: string
          start_date: string
          tournament_data?: Json
        }
        Update: {
          association?: string | null
          created_at?: string
          end_date?: string
          id?: string
          location_city?: string | null
          location_id?: string | null
          location_state?: string | null
          name?: string
          region_id?: string
          start_date?: string
          tournament_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "tournament_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "region"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_team: {
        Row: {
          joined_at: string
          team_id: string
          tournament_id: string
        }
        Insert: {
          joined_at?: string
          team_id: string
          tournament_id: string
        }
        Update: {
          joined_at?: string
          team_id?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_team_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_team_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournament"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          email: string
          first_name: string
          full_name: string
          has_set_password: boolean
          id: string
          is_confirmed: boolean
          joined_at: string
          last_name: string
          permission_level: Database["public"]["Enums"]["user_permission_level"]
        }
        Insert: {
          email?: string
          first_name?: string
          full_name?: string
          has_set_password?: boolean
          id: string
          is_confirmed?: boolean
          joined_at?: string
          last_name?: string
          permission_level?: Database["public"]["Enums"]["user_permission_level"]
        }
        Update: {
          email?: string
          first_name?: string
          full_name?: string
          has_set_password?: boolean
          id?: string
          is_confirmed?: boolean
          joined_at?: string
          last_name?: string
          permission_level?: Database["public"]["Enums"]["user_permission_level"]
        }
        Relationships: []
      }
      user_team: {
        Row: {
          created_at: string
          permission_level: Database["public"]["Enums"]["team_permission_level"]
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          permission_level?: Database["public"]["Enums"]["team_permission_level"]
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          permission_level?: Database["public"]["Enums"]["team_permission_level"]
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_team_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_team_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_game: {
        Args: {
          game_name: string
          teams: Database["public"]["CompositeTypes"]["new_game_team"][]
        }
        Returns: {
          created_at: string
          created_by_team_id: string | null
          created_by_user_id: string
          ended_at: string | null
          field: string | null
          game_data: Json
          id: string
          location_id: string
          name: string
          scheduled_start_time: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["game_status"]
          tournament_id: string | null
        }
      }
      create_team_with_players: {
        Args: { player_ids: string[]; team_name: string }
        Returns: {
          admin_note: string | null
          associated_team_id: string | null
          created_at: string
          id: string
          location_city: string | null
          location_state: string | null
          name: string
          primary_region_id: string | null
        }
      }
      create_tournament_for_team: {
        Args: {
          association: string
          end_date: string
          location_city?: string
          location_id?: string
          location_state?: string
          region_id: string
          start_date: string
          team_id: string
          tournament_data?: Json
          tournament_name: string
        }
        Returns: {
          association: string | null
          created_at: string
          end_date: string
          id: string
          location_city: string | null
          location_id: string | null
          location_state: string | null
          name: string
          region_id: string
          start_date: string
          tournament_data: Json
        }
      }
      create_tournament_game_for_team: {
        Args: {
          creator_team_id: string
          creator_team_role: Database["public"]["Enums"]["team_role"]
          field_name?: string
          game_data?: Json
          game_name: string
          location_id?: string
          opponent_team_id: string
          scheduled_start_time: string
          tournament_id: string
        }
        Returns: {
          created_at: string
          created_by_team_id: string | null
          created_by_user_id: string
          ended_at: string | null
          field: string | null
          game_data: Json
          id: string
          location_id: string
          name: string
          scheduled_start_time: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["game_status"]
          tournament_id: string | null
        }
      }
      delete_team: {
        Args: { target_team_id: string }
        Returns: undefined
      }
      has_permission_for_any_team: {
        Args: {
          min_level: Database["public"]["Enums"]["team_permission_level"]
        }
        Returns: boolean
      }
      has_team_permission: {
        Args: {
          permission: Database["public"]["Enums"]["team_permission_level"]
          team_id: string
        }
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_admin: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      is_user_super_admin: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      is_valid_game_time_for_tournament: {
        Args: {
          grace_interval?: unknown
          scheduled_start: string
          tournament_id: string
        }
        Returns: boolean
      }
      opposite_team_role: {
        Args: { role: Database["public"]["Enums"]["team_role"] }
        Returns: Database["public"]["Enums"]["team_role"]
      }
    }
    Enums: {
      fielding_position:
        | "pitcher"
        | "catcher"
        | "first_base"
        | "second_base"
        | "third_base"
        | "shortstop"
        | "left_field"
        | "center_field"
        | "right_field"
        | "left_center_field"
        | "right_center_field"
        | "middle_infield"
        | "extra_hitter"
      game_action_type:
        | "start_game"
        | "single"
        | "double"
        | "triple"
        | "home_run"
        | "walk"
        | "intentional_walk"
        | "automatic_walk"
        | "strikeout"
        | "groundout"
        | "flyout"
        | "lineout"
        | "sacrifice"
        | "fielders_choice"
        | "double_play"
        | "triple_play"
        | "stolen_base"
        | "caught_stealing"
        | "error"
        | "dead_ball_out"
        | "pinch_runner"
        | "substitution"
        | "defensive_switch"
        | "batting_order_change"
        | "skip_at_bat"
        | "solo_mode_opponent_inning"
        | "manual_override"
        | "end_game"
      game_status: "completed" | "in_progress" | "not_started"
      team_permission_level: "member" | "scorekeeper" | "manager"
      team_role: "home" | "away"
      user_permission_level: "user" | "admin" | "super_admin"
    }
    CompositeTypes: {
      new_game_team: {
        team_id: string | null
        role: Database["public"]["Enums"]["team_role"] | null
      }
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
      fielding_position: [
        "pitcher",
        "catcher",
        "first_base",
        "second_base",
        "third_base",
        "shortstop",
        "left_field",
        "center_field",
        "right_field",
        "left_center_field",
        "right_center_field",
        "middle_infield",
        "extra_hitter",
      ],
      game_action_type: [
        "start_game",
        "single",
        "double",
        "triple",
        "home_run",
        "walk",
        "intentional_walk",
        "automatic_walk",
        "strikeout",
        "groundout",
        "flyout",
        "lineout",
        "sacrifice",
        "fielders_choice",
        "double_play",
        "triple_play",
        "stolen_base",
        "caught_stealing",
        "error",
        "dead_ball_out",
        "pinch_runner",
        "substitution",
        "defensive_switch",
        "batting_order_change",
        "skip_at_bat",
        "solo_mode_opponent_inning",
        "manual_override",
        "end_game",
      ],
      game_status: ["completed", "in_progress", "not_started"],
      team_permission_level: ["member", "scorekeeper", "manager"],
      team_role: ["home", "away"],
      user_permission_level: ["user", "admin", "super_admin"],
    },
  },
} as const

