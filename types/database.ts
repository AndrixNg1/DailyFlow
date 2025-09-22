export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          emoji: string;
          reminder_time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          emoji?: string;
          reminder_time: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          emoji?: string;
          reminder_time?: string;
          created_at?: string;
        };
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string;
          date: string;
          completed: boolean;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          habit_id: string;
          date?: string;
          completed?: boolean;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          habit_id?: string;
          date?: string;
          completed?: boolean;
          completed_at?: string | null;
        };
      };
    };
  };
}