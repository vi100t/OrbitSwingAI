import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import { Session } from '@supabase/supabase-js';

export function useTasks(session: Session) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createTask = async (task: any) => {
    try {
      const taskData = {
        ...task,
        user_id: session.user.id,
        due_time: task.due_time ? dayjs(task.due_time).format('HH:mm:ss') : null,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  // Add other task-related functions here

  return {
    tasks,
    loading,
    error,
    createTask,
  };
}