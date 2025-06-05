import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import { useAuth } from '@/contexts/AuthContext';
import { Task } from '@/types/task';

export function useTasks() {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchTasks();
    }
  }, [session?.user?.id]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*, subtasks(*)')
        .eq('user_id', session?.user?.id)
        .order('due_date', { ascending: true });

      if (fetchError) throw fetchError;
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: Partial<Task>) => {
    try {
      if (!session?.user?.id) {
        throw new Error('User must be authenticated to create tasks');
      }

      const newTask = {
        ...taskData,
        user_id: session.user.id,
        due_time: taskData.due_time ? dayjs(taskData.due_time).format('HH:mm:ss') : null,
        created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updated_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      const { data, error: createError } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (createError) throw createError;

      setTasks((prevTasks) => [...prevTasks, data]);
      return data;
    } catch (err) {
      console.error('Error creating task:', err);
      throw err;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      if (!session?.user?.id) {
        throw new Error('User must be authenticated to update tasks');
      }

      const { data, error: updateError } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        })
        .eq('id', taskId)
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? { ...task, ...data } : task))
      );

      return data;
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      if (!session?.user?.id) {
        throw new Error('User must be authenticated to delete tasks');
      }

      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', session.user.id);

      if (deleteError) throw deleteError;

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  const createSubtasks = async (taskId: string, subtasks: Array<{ title: string; is_completed: boolean }>) => {
    try {
      if (!session?.user?.id) {
        throw new Error('User must be authenticated to create subtasks');
      }

      const subtasksWithTaskId = subtasks.map((subtask) => ({
        ...subtask,
        task_id: taskId,
        created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updated_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      }));

      const { data, error: createError } = await supabase
        .from('subtasks')
        .insert(subtasksWithTaskId)
        .select();

      if (createError) throw createError;

      return data;
    } catch (err) {
      console.error('Error creating subtasks:', err);
      throw err;
    }
  };

  const generateSubtasks = async (title: string, description: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-subtasks', {
        body: { title, description },
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error generating subtasks:', err);
      throw err;
    }
  };

  const refreshTasks = () => {
    return fetchTasks();
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    createSubtasks,
    generateSubtasks,
    refreshTasks,
  };
}

export function useHabits() {
  const { session } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchHabits();
    }
  }, [session?.user?.id]);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHabits(data || []);
    } catch (err) {
      console.error('Error fetching habits:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    habits,
    loading,
  };
}

export function useUserProfile() {
  const { session } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session?.user?.id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
  };
}