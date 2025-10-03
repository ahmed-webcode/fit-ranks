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
      achievements: {
        Row: {
          created_at: string
          description: string
          icon: string | null
          id: string
          name: string
          points_reward: number
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          name: string
          points_reward?: number
          requirement_type: string
          requirement_value: number
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          name?: string
          points_reward?: number
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      body_measurements: {
        Row: {
          biceps: number | null
          body_fat_percentage: number | null
          chest: number | null
          created_at: string
          height: number | null
          hips: number | null
          id: string
          measured_at: string
          muscle_mass: number | null
          notes: string | null
          thighs: number | null
          user_id: string
          waist: number | null
          weight: number | null
        }
        Insert: {
          biceps?: number | null
          body_fat_percentage?: number | null
          chest?: number | null
          created_at?: string
          height?: number | null
          hips?: number | null
          id?: string
          measured_at?: string
          muscle_mass?: number | null
          notes?: string | null
          thighs?: number | null
          user_id: string
          waist?: number | null
          weight?: number | null
        }
        Update: {
          biceps?: number | null
          body_fat_percentage?: number | null
          chest?: number | null
          created_at?: string
          height?: number | null
          hips?: number | null
          id?: string
          measured_at?: string
          muscle_mass?: number | null
          notes?: string | null
          thighs?: number | null
          user_id?: string
          waist?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      coach_groups: {
        Row: {
          coach_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          category: string
          created_at: string
          equipment: string | null
          id: string
          instructions: string | null
          muscle_groups: string[] | null
          name: string
          video_url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          equipment?: string | null
          id?: string
          instructions?: string | null
          muscle_groups?: string[] | null
          name: string
          video_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          equipment?: string | null
          id?: string
          instructions?: string | null
          muscle_groups?: string[] | null
          name?: string
          video_url?: string | null
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "coach_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_bests: {
        Row: {
          achieved_at: string
          best_distance_km: number | null
          best_duration_seconds: number | null
          best_reps: number | null
          best_weight: number | null
          exercise_id: string
          id: string
          user_id: string
        }
        Insert: {
          achieved_at?: string
          best_distance_km?: number | null
          best_duration_seconds?: number | null
          best_reps?: number | null
          best_weight?: number | null
          exercise_id: string
          id?: string
          user_id: string
        }
        Update: {
          achieved_at?: string
          best_distance_km?: number | null
          best_duration_seconds?: number | null
          best_reps?: number | null
          best_weight?: number | null
          exercise_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_bests_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          created_at: string
          fitness_goals: string | null
          fitness_level: number | null
          full_name: string | null
          id: string
          profile_picture_url: string | null
          rank_title: string | null
          total_points: number | null
          updated_at: string
          user_id: string
          username: string
          weight: number | null
        }
        Insert: {
          age?: number | null
          created_at?: string
          fitness_goals?: string | null
          fitness_level?: number | null
          full_name?: string | null
          id?: string
          profile_picture_url?: string | null
          rank_title?: string | null
          total_points?: number | null
          updated_at?: string
          user_id: string
          username: string
          weight?: number | null
        }
        Update: {
          age?: number | null
          created_at?: string
          fitness_goals?: string | null
          fitness_level?: number | null
          full_name?: string | null
          id?: string
          profile_picture_url?: string | null
          rank_title?: string | null
          total_points?: number | null
          updated_at?: string
          user_id?: string
          username?: string
          weight?: number | null
        }
        Relationships: []
      }
      template_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          notes: string | null
          order_index: number
          reps: number[] | null
          sets: number | null
          template_id: string
          weight: number[] | null
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string | null
          order_index: number
          reps?: number[] | null
          sets?: number | null
          template_id: string
          weight?: number[] | null
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          reps?: number[] | null
          sets?: number | null
          template_id?: string
          weight?: number[] | null
        }
        Relationships: [
          {
            foreignKeyName: "template_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_exercises_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          created_at: string
          distance_km: number | null
          duration_seconds: number | null
          exercise_id: string
          id: string
          notes: string | null
          reps: number[] | null
          sets: number | null
          weight: number[] | null
          workout_id: string
        }
        Insert: {
          created_at?: string
          distance_km?: number | null
          duration_seconds?: number | null
          exercise_id: string
          id?: string
          notes?: string | null
          reps?: number[] | null
          sets?: number | null
          weight?: number[] | null
          workout_id: string
        }
        Update: {
          created_at?: string
          distance_km?: number | null
          duration_seconds?: number | null
          exercise_id?: string
          id?: string
          notes?: string | null
          reps?: number[] | null
          sets?: number | null
          weight?: number[] | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_likes: {
        Row: {
          created_at: string
          id: string
          share_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          share_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          share_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_likes_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "workout_shares"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_shares: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          likes_count: number | null
          user_id: string
          workout_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          likes_count?: number | null
          user_id: string
          workout_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          likes_count?: number | null
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_shares_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_templates: {
        Row: {
          category: string | null
          created_at: string
          creator_id: string
          description: string | null
          difficulty_level: string | null
          id: string
          is_public: boolean | null
          name: string
          times_used: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          difficulty_level?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          times_used?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          difficulty_level?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          times_used?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          name: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          name: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          name?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
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
