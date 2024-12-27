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
          game_data: Json
          id: string
          name: string
          status: Database["public"]["Enums"]["game_status"]
        }
        Insert: {
          created_at?: string
          game_data?: Json
          id?: string
          name: string
          status?: Database["public"]["Enums"]["game_status"]
        }
        Update: {
          created_at?: string
          game_data?: Json
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["game_status"]
        }
        Relationships: []
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
      player: {
        Row: {
          created_at: string
          id: string
          jersey_number: string | null
          name: string
          primary_position: Database["public"]["Enums"]["fielding_position"]
          secondary_position:
            | Database["public"]["Enums"]["fielding_position"]
            | null
        }
        Insert: {
          created_at?: string
          id?: string
          jersey_number?: string | null
          name: string
          primary_position?: Database["public"]["Enums"]["fielding_position"]
          secondary_position?:
            | Database["public"]["Enums"]["fielding_position"]
            | null
        }
        Update: {
          created_at?: string
          id?: string
          jersey_number?: string | null
          name?: string
          primary_position?: Database["public"]["Enums"]["fielding_position"]
          secondary_position?:
            | Database["public"]["Enums"]["fielding_position"]
            | null
        }
        Relationships: []
      }
      player_team: {
        Row: {
          created_at: string
          player_id: string
          team_id: string
        }
        Insert: {
          created_at?: string
          player_id: string
          team_id: string
        }
        Update: {
          created_at?: string
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
      team: {
        Row: {
          associated_team_id: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          associated_team_id?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          associated_team_id?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_associated_team_id_fkey"
            columns: ["associated_team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          permission_level: Database["public"]["Enums"]["user_permission_level"]
        }
        Insert: {
          created_at?: string
          email?: string
          first_name?: string
          id: string
          last_name?: string
          permission_level?: Database["public"]["Enums"]["user_permission_level"]
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          permission_level?: Database["public"]["Enums"]["user_permission_level"]
        }
        Relationships: []
      }
      user_team: {
        Row: {
          created_at: string
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
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
          game_data: Json
          id: string
          name: string
          status: Database["public"]["Enums"]["game_status"]
        }
      }
      create_team_with_players: {
        Args: {
          team_name: string
          player_ids: string[]
        }
        Returns: {
          associated_team_id: string | null
          created_at: string
          id: string
          name: string
        }
      }
      delete_team: {
        Args: {
          target_team_id: string
        }
        Returns: undefined
      }
      is_user_admin: {
        Args: {
          target_user_id: string
        }
        Returns: boolean
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
        | "substitution"
        | "defensive_switch"
        | "batting_order_change"
        | "skip_at_bat"
        | "solo_mode_opponent_inning"
        | "end_game"
      game_status: "completed" | "in_progress" | "not_started"
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
