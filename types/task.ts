export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // ISO string
  dueTime?: string; // ISO string
  isCompleted: boolean;
  completedAt?: string; // ISO string
  priority: 'low' | 'medium' | 'high';
  subTasks?: SubTask[];
  category?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}