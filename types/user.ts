export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  reminders: boolean;
}

export interface WorkHours {
  start: string;
  end: string;
  days: number[]; // 0 = Sunday, 1 = Monday, etc.
}

export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  timezone: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  notification_preferences: NotificationPreferences;
  work_hours: WorkHours;
  created_at: string;
  updated_at: string;
}
