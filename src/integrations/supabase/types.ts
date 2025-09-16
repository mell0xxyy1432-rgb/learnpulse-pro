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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          content_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: number | null
          estimated_minutes: number | null
          id: string
          is_active: boolean | null
          required_interests: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          content_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          estimated_minutes?: number | null
          id?: string
          is_active?: boolean | null
          required_interests?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          content_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          estimated_minutes?: number | null
          id?: string
          is_active?: boolean | null
          required_interests?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      activity_suggestions: {
        Row: {
          activity_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          feedback: string | null
          free_period_end: string | null
          free_period_start: string | null
          id: string
          rating: number | null
          student_id: string
          suggested_for_date: string
        }
        Insert: {
          activity_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          feedback?: string | null
          free_period_end?: string | null
          free_period_start?: string | null
          id?: string
          rating?: number | null
          student_id: string
          suggested_for_date: string
        }
        Update: {
          activity_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          feedback?: string | null
          free_period_end?: string | null
          free_period_start?: string | null
          id?: string
          rating?: number | null
          student_id?: string
          suggested_for_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_suggestions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_suggestions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      attendance: {
        Row: {
          created_at: string | null
          id: string
          is_present: boolean | null
          latitude: number | null
          longitude: number | null
          marked_at: string | null
          method: Database["public"]["Enums"]["attendance_method"] | null
          notes: string | null
          session_id: string
          student_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_present?: boolean | null
          latitude?: number | null
          longitude?: number | null
          marked_at?: string | null
          method?: Database["public"]["Enums"]["attendance_method"] | null
          notes?: string | null
          session_id: string
          student_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_present?: boolean | null
          latitude?: number | null
          longitude?: number | null
          marked_at?: string | null
          method?: Database["public"]["Enums"]["attendance_method"] | null
          notes?: string | null
          session_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      class_enrollments: {
        Row: {
          class_id: string
          enrolled_at: string | null
          id: string
          student_id: string
        }
        Insert: {
          class_id: string
          enrolled_at?: string | null
          id?: string
          student_id: string
        }
        Update: {
          class_id?: string
          enrolled_at?: string | null
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      classes: {
        Row: {
          capacity: number | null
          created_at: string | null
          department: string | null
          description: string | null
          id: string
          name: string
          room_number: string | null
          semester: number | null
          subject: string
          teacher_id: string | null
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          name: string
          room_number?: string | null
          semester?: number | null
          subject: string
          teacher_id?: string | null
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          name?: string
          room_number?: string | null
          semester?: number | null
          subject?: string
          teacher_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          roll_number: string | null
          semester: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          roll_number?: string | null
          semester?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          roll_number?: string | null
          semester?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          class_id: string
          created_at: string | null
          end_time: string
          id: string
          is_active: boolean | null
          location: string | null
          present_count: number | null
          qr_code: string | null
          qr_expires_at: string | null
          session_date: string
          start_time: string
          teacher_id: string
          total_students: number | null
          updated_at: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          end_time: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          present_count?: number | null
          qr_code?: string | null
          qr_expires_at?: string | null
          session_date: string
          start_time: string
          teacher_id: string
          total_students?: number | null
          updated_at?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          present_count?: number | null
          qr_code?: string | null
          qr_expires_at?: string | null
          session_date?: string
          start_time?: string
          teacher_id?: string
          total_students?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      student_goals: {
        Row: {
          completed: boolean | null
          created_at: string | null
          goal: string
          id: string
          priority: number | null
          target_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          goal: string
          id?: string
          priority?: number | null
          target_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          goal?: string
          id?: string
          priority?: number | null
          target_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      student_interests: {
        Row: {
          created_at: string | null
          id: string
          interest: string
          strength_level: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interest: string
          strength_level?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interest?: string
          strength_level?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
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
      activity_type:
        | "study"
        | "practice"
        | "quiz"
        | "project"
        | "career"
        | "skill"
      attendance_method: "qr" | "face" | "bluetooth" | "manual"
      user_role: "student" | "teacher" | "admin" | "counselor"
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
      activity_type: [
        "study",
        "practice",
        "quiz",
        "project",
        "career",
        "skill",
      ],
      attendance_method: ["qr", "face", "bluetooth", "manual"],
      user_role: ["student", "teacher", "admin", "counselor"],
    },
  },
} as const
