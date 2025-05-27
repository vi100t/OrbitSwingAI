import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type Tables = Database['public']['Tables'];

export function useTasks() {
  const [tasks, setTasks] = useState<Tables['tasks']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchTasks();
    
    // Subscribe to changes
    const subscription = supabase
      .channel('tasks_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, subtasks(*)')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  async function createTask(task: Tables['tasks']['Insert']) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  }

  async function updateTask(id: string, updates: Tables['tasks']['Update']) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  }

  async function deleteTask(id: string) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  }

  async function generateSubtasks(taskTitle: string, taskDescription?: string) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-subtasks', {
        body: { taskTitle, taskDescription },
      });

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  }

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    generateSubtasks,
  };
}

export function useNotes() {
  const [notes, setNotes] = useState<Tables['notes']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchNotes();
    
    // Subscribe to changes
    const subscription = supabase
      .channel('notes_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, fetchNotes)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchNotes() {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*, note_tags(*)')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  async function createNote(note: Tables['notes']['Insert']) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert(note)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  }

  async function updateNote(id: string, updates: Tables['notes']['Update']) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  }

  async function deleteNote(id: string) {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  }

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
  };
}

export function useHabits() {
  const [habits, setHabits] = useState<Tables['habits']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchHabits();
    
    // Subscribe to changes
    const subscription = supabase
      .channel('habits_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habits' }, fetchHabits)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchHabits() {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*, habit_completions(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHabits(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  async function createHabit(habit: Tables['habits']['Insert']) {
    try {
      const { data, error } = await supabase
        .from('habits')
        .insert(habit)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  }

  async function updateHabit(id: string, updates: Tables['habits']['Update']) {
    try {
      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  }

  async function deleteHabit(id: string) {
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  }

  async function toggleCompletion(habitId: string, date: string) {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('habit_completions')
        .select()
        .eq('habit_id', habitId)
        .eq('date', date)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existing) {
        const { error } = await supabase
          .from('habit_completions')
          .update({ completed: !existing.completed })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('habit_completions')
          .insert({ habit_id: habitId, date, completed: true });

        if (error) throw error;
      }

      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  }

  return {
    habits,
    loading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
  };
}

export function useVoiceCommands() {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function processCommand(command: string, userId: string) {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-voice-command', {
        body: { command, userId },
      });

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setProcessing(false);
    }
  }

  return {
    processing,
    error,
    processCommand,
  };
}

export function useTaskSuggestions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function getSuggestions(userId: string, completedTaskId: string) {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-tasks', {
        body: { userId, completedTaskId },
      });

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    getSuggestions,
  };
}