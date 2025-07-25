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
      chat_messages: {
        Row: {
          chat_id: string
          created_at: string
          id: string
          message: string
          sender_id: string
        }
        Insert: {
          chat_id: string
          created_at?: string
          id?: string
          message: string
          sender_id: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string
          id: string
          skill: string
          status: string
          updated_at: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          skill: string
          status?: string
          updated_at?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          skill?: string
          status?: string
          updated_at?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string
          id: string
          message: string
          recipient_id: string
          sender_id: string
          skill: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          recipient_id: string
          sender_id: string
          skill: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          recipient_id?: string
          sender_id?: string
          skill?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_requests: {
        Row: {
          country: string
          created_at: string
          description: string
          id: string
          level: string
          responses_count: number
          skill: string
          updated_at: string
          urgency: string
          user_id: string
        }
        Insert: {
          country: string
          created_at?: string
          description: string
          id?: string
          level: string
          responses_count?: number
          skill: string
          updated_at?: string
          urgency: string
          user_id: string
        }
        Update: {
          country?: string
          created_at?: string
          description?: string
          id?: string
          level?: string
          responses_count?: number
          skill?: string
          updated_at?: string
          urgency?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          gender: string | null
          id: string
          phone: string | null
          skills_to_learn: string[] | null
          skills_to_teach: Json | null
          updated_at: string | null
          willing_to_teach_without_return: boolean | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          gender?: string | null
          id: string
          phone?: string | null
          skills_to_learn?: string[] | null
          skills_to_teach?: Json | null
          updated_at?: string | null
          willing_to_teach_without_return?: boolean | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          phone?: string | null
          skills_to_learn?: string[] | null
          skills_to_teach?: Json | null
          updated_at?: string | null
          willing_to_teach_without_return?: boolean | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          chat_id: string | null
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
          skill: string
        }
        Insert: {
          chat_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewee_id: string
          reviewer_id: string
          skill: string
        }
        Update: {
          chat_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
          skill?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
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
