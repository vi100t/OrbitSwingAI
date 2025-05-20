export interface HabitCompletion {
  date: string; // ISO string
  completed: boolean;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
  timeOfDay?: string; // ISO string
  currentStreak: number;
  longestStreak: number;
  color: string;
  createdAt: string; // ISO string
  completions: HabitCompletion[];
}