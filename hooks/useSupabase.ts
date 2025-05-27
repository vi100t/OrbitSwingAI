import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type Tables = Database['public']['Tables'];

// Global channel instance
let globalChannel: any = null;

export function useTasks() {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<Tables['tasks']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = React.useRef<any>(null);
  const isSubscribedRef = React.useRef(false);

  const fetchTasks = React.useCallback(async () => {
    try {
      if (!session?.user?.id) {
        console.log('No user session, skipping task fetch');
        return;
      }

      setLoading(true);
      console.log('Fetching tasks for user:', session.user.id);
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', session.user.id)
        .order('due_date', { ascending: true });

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        throw tasksError;
      }

      // Fetch subtasks for all tasks
      const taskIds = tasks?.map((task) => task.id) || [];
      const { data: subtasks, error: subtasksError } = await supabase
        .from('subtasks')
        .select('*')
        .in('task_id', taskIds);

      if (subtasksError) {
        console.error('Error fetching subtasks:', subtasksError);
        throw subtasksError;
      }

      // Combine tasks with their subtasks
      const tasksWithSubtasks =
        tasks?.map((task) => ({
          ...task,
          subtasks:
            subtasks?.filter((subtask) => subtask.task_id === task.id) || [],
        })) || [];

      console.log('Fetched tasks with subtasks:', tasksWithSubtasks);
      setTasks(tasksWithSubtasks);
    } catch (err) {
      console.error('Error in fetchTasks:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Fetch tasks on mount and when session changes
  useEffect(() => {
    if (session?.user?.id) {
      fetchTasks();
    }
  }, [session?.user?.id, fetchTasks]);

  // Set up realtime subscription
  useEffect(() => {
    if (!session?.user?.id) return;

    const setupSubscription = async () => {
      // Clean up existing subscription
      if (channelRef.current) {
        console.log('Cleaning up existing subscription');
        await channelRef.current.unsubscribe();
        channelRef.current = null;
        isSubscribedRef.current = false;
      }

      // Only create a new subscription if we're not already subscribed
      if (!isSubscribedRef.current) {
        console.log('Setting up new subscription');
        const channel = supabase.channel('tasks_changes').on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${session.user.id}`,
          },
          (payload: RealtimePostgresChangesPayload<Tables['tasks']['Row']>) => {
            console.log('Task change detected:', payload);
            fetchTasks();
          }
        );

        try {
          await channel.subscribe((status) => {
            console.log('Subscription status:', status);
            if (status === 'SUBSCRIBED') {
              isSubscribedRef.current = true;
              channelRef.current = channel;
            }
          });
        } catch (err) {
          console.error('Error subscribing to channel:', err);
          isSubscribedRef.current = false;
        }
      }
    };

    setupSubscription();

    return () => {
      const cleanup = async () => {
        if (channelRef.current) {
          console.log('Cleaning up subscription on unmount');
          await channelRef.current.unsubscribe();
          channelRef.current = null;
          isSubscribedRef.current = false;
        }
      };
      cleanup();
    };
  }, [session?.user?.id, fetchTasks]);

  // Force refresh tasks
  const refreshTasks = React.useCallback(() => {
    console.log('Force refreshing tasks...');
    fetchTasks();
  }, [fetchTasks]);

  async function createTask(task: Tables['tasks']['Insert']) {
    try {
      if (!session?.user?.id) {
        throw new Error('No user session');
      }

      const taskWithUserId = {
        ...task,
        user_id: session.user.id,
      };

      console.log('Creating task with data:', taskWithUserId);

      // Start a transaction
      const { data: newTask, error: taskError } = await supabase
        .from('tasks')
        .insert(taskWithUserId)
        .select()
        .single();

      if (taskError) {
        console.error('Error creating task:', taskError);
        throw taskError;
      }

      console.log('Task created successfully:', newTask);

      // Fetch tasks immediately after creation
      await fetchTasks();

      return newTask;
    } catch (err) {
      console.error('Exception in createTask:', err);
      setError(err as Error);
      return null;
    }
  }

  async function createSubtasks(
    taskId: string,
    subtasks: Array<{ title: string; is_completed: boolean }>
  ) {
    try {
      if (!session?.user?.id) {
        throw new Error('No user session');
      }

      const subtaskData = subtasks.map((subtask) => ({
        task_id: taskId,
        title: subtask.title,
        is_completed: subtask.is_completed,
        created_at: new Date().toISOString(),
      }));

      const { data: insertedSubtasks, error: subtaskError } = await supabase
        .from('subtasks')
        .insert(subtaskData)
        .select();

      if (subtaskError) {
        console.error('Error creating subtasks:', subtaskError);
        throw subtaskError;
      }

      // Fetch tasks to update the list with new subtasks
      await fetchTasks();

      return insertedSubtasks;
    } catch (err) {
      console.error('Exception in createSubtasks:', err);
      setError(err as Error);
      return null;
    }
  }

  async function updateTask(id: string, updates: Tables['tasks']['Update']) {
    try {
      if (!session?.user?.id) {
        throw new Error('No user session');
      }

      // If we're updating subtasks, handle them separately
      if ('subtasks' in updates) {
        const subtasks = updates.subtasks as Tables['subtasks']['Update'][];
        delete updates.subtasks;

        // Update the task first
        const { data: task, error: taskError } = await supabase
          .from('tasks')
          .update(updates)
          .eq('id', id)
          .eq('user_id', session.user.id)
          .select()
          .single();

        if (taskError) throw taskError;

        // Then update each subtask
        for (const subtask of subtasks) {
          const { error: subtaskError } = await supabase
            .from('subtasks')
            .update(subtask)
            .eq('id', subtask.id)
            .eq('task_id', id);

          if (subtaskError) {
            console.error('Error updating subtask:', subtaskError);
          }
        }

        return task;
      }

      // Regular task update
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', session.user.id)
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
      if (!session?.user?.id) {
        throw new Error('No user session');
      }

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  }

  async function generateSubtasks(taskTitle: string, taskDescription?: string) {
    try {
      const { data, error } = await supabase.functions.invoke(
        'generate-subtasks',
        {
          body: { title: taskTitle, description: taskDescription ?? '' },
        }
      );

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
    createSubtasks,
    refreshTasks,
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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        fetchNotes
      )
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
      const { error } = await supabase.from('notes').delete().eq('id', id);

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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habits' },
        fetchHabits
      )
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
      const { error } = await supabase.from('habits').delete().eq('id', id);

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
      const { data, error } = await supabase.functions.invoke(
        'process-voice-command',
        {
          body: { command, userId },
        }
      );

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

export function useUserProfile() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session?.user?.id]);

  async function fetchProfile() {
    try {
      if (!session?.user?.id) {
        throw new Error('No user session');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const defaultProfile = {
            id: session.user.id,
            timezone: 'UTC',
            language: 'en',
            theme: 'system',
            notification_preferences: {
              email: true,
              push: true,
              reminders: true,
            },
            work_hours: {
              start: '09:00',
              end: '17:00',
              days: [1, 2, 3, 4, 5],
            },
          };
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert(defaultProfile)
            .select()
            .single();

          if (createError) throw createError;
          setProfile(newProfile);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(updates: any) {
    try {
      if (!session?.user?.id) {
        throw new Error('No user session');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', session.user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err as Error);
      return null;
    }
  }

  async function createProfile(profileData: any) {
    try {
      if (!session?.user?.id) {
        throw new Error('No user session');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .insert({ id: session.user.id, ...profileData })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Error creating profile:', err);
      setError(err as Error);
      return null;
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile,
    createProfile,
    refreshProfile: fetchProfile,
  };
}
