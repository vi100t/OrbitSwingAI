export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  due_time: string | null;
  priority: 'low' | 'medium' | 'high';
  status: string;
  is_completed: boolean;
  completed_at: string | null;
  repeat_type: 'none' | 'daily' | 'weekly' | 'monthly';
  repeat_frequency: number;
  repeat_days: number[] | null;
  repeat_ends: string | null;
  labels: string[];
  subtasks: SubTask[];
  created_at: string;
  updated_at: string;
};

export type Label = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
};
