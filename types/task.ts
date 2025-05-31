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
  due_date: string;
  due_time: string | null;
  is_completed: boolean;
  completed_at: string | null;
  priority: string;
  category: string | null;
  created_at: string;
  updated_at: string;
  subtasks?: {
    id: string;
    task_id: string;
    title: string;
    is_completed: boolean;
    created_at: string;
  }[];
};
