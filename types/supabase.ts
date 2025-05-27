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
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          due_date: string
          due_time: string | null
          is_completed: boolean
          completed_at: string | null
          priority: string
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          due_date: string
          due_time?: string | null
          is_completed?: boolean
          completed_at?: string | null
          priority?: string
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          due_date?: string
          due_time?: string | null
          is_completed?: boolean
          completed_at?: string | null
          priority?: string
          category?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subtasks: {
        Row: {
          id: string
          task_id: string
          title: string
          is_completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          title: string
          is_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          title?: string
          is_completed?: boolean
          created_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      note_tags: {
        Row: {
          id: string
          note_id: string
          tag: string
        }
        Insert: {
          id?: string
          note_id: string
          tag: string
        }
        Update: {
          id?: string
          note_id?: string
          tag?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          frequency: string
          days_of_week: number[] | null
          time_of_day: string | null
          current_streak: number
          longest_streak: number
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          frequency: string
          days_of_week?: number[] | null
          time_of_day?: string | null
          current_streak?: number
          longest_streak?: number
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          frequency?: string
          days_of_week?: number[] | null
          time_of_day?: string | null
          current_streak?: number
          longest_streak?: number
          color?: string
          created_at?: string
        }
      }
      habit_completions: {
        Row: {
          id: string
          habit_id: string
          date: string
          completed: boolean
        }
        Insert: {
          id?: string
          habit_id: string
          date: string
          completed?: boolean
        }
        Update: {
          id?: string
          habit_id?: string
          date?: string
          completed?: boolean
        }
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
  }
}