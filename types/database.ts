export interface Database {
  public: {
    Tables: {
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