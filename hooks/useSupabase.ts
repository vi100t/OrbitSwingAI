import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import { useAuth } from '@/contexts/AuthContext';
import { Task, Label } from '@/types/task';
import { Database } from '@/types/supabase';

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
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while fetching tasks'
      );
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
        due_time: taskData.due_time
          ? dayjs(taskData.due_time).format('HH:mm:ss')
          : null,
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
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, ...data } : task
        )
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

  const createSubtasks = async (
    taskId: string,
    subtasks: Array<{ title: string; is_completed: boolean }>
  ) => {
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
      const { data, error } = await supabase.functions.invoke(
        'generate-subtasks',
        {
          body: { title, description },
        }
      );

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
  const [habits, setHabits] = useState<
    Database['public']['Tables']['habits']['Row'][]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    habits,
    loading,
    error,
  };
}

export function useUserProfile() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<
    Database['public']['Tables']['user_profiles']['Row'] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session?.user?.id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const defaultProfile = {
            id: session?.user?.id,
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
  };

  const updateProfile = async (
    updates: Partial<Database['public']['Tables']['user_profiles']['Update']>
  ) => {
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
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
  };
}

export function useNotes() {
  const { session } = useAuth();
  const [notes, setNotes] = useState<
    Database['public']['Tables']['notes']['Row'][]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotes();
    }
  }, [session?.user?.id]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*, note_tags(tag)')
        .eq('user_id', session?.user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Transform the data to include tags as an array
      const transformedNotes =
        data?.map((note) => ({
          ...note,
          tags: note.note_tags?.map((nt: { tag: string }) => nt.tag) || [],
        })) || [];

      setNotes(transformedNotes);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (noteData: {
    title: string;
    content: string | null;
    tags?: string[];
  }) => {
    try {
      if (!session?.user?.id) {
        throw new Error('User must be authenticated to create notes');
      }

      const { data: note, error: createError } = await supabase
        .from('notes')
        .insert({
          ...noteData,
          user_id: session.user.id,
          created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          updated_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        })
        .select()
        .single();

      if (createError) throw createError;

      // Insert tags if provided
      if (noteData.tags && noteData.tags.length > 0) {
        const { error: tagsError } = await supabase.from('note_tags').insert(
          noteData.tags.map((tag) => ({
            note_id: note.id,
            tag,
          }))
        );

        if (tagsError) throw tagsError;
      }

      const newNote = {
        ...note,
        tags: noteData.tags || [],
      };

      setNotes((prevNotes) => [newNote, ...prevNotes]);
      return newNote;
    } catch (err) {
      console.error('Error creating note:', err);
      throw err;
    }
  };

  const updateNote = async (
    noteId: string,
    updates: {
      title?: string;
      content?: string | null;
      tags?: string[];
    }
  ) => {
    try {
      if (!session?.user?.id) {
        throw new Error('User must be authenticated to update notes');
      }

      const { data: note, error: updateError } = await supabase
        .from('notes')
        .update({
          ...updates,
          updated_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        })
        .eq('id', noteId)
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update tags if provided
      if (updates.tags) {
        // Delete existing tags
        await supabase.from('note_tags').delete().eq('note_id', noteId);

        // Insert new tags
        if (updates.tags.length > 0) {
          const { error: tagsError } = await supabase.from('note_tags').insert(
            updates.tags.map((tag) => ({
              note_id: noteId,
              tag,
            }))
          );

          if (tagsError) throw tagsError;
        }
      }

      const updatedNote = {
        ...note,
        tags: updates.tags || [],
      };

      setNotes((prevNotes) =>
        prevNotes.map((n) => (n.id === noteId ? updatedNote : n))
      );

      return updatedNote;
    } catch (err) {
      console.error('Error updating note:', err);
      throw err;
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      if (!session?.user?.id) {
        throw new Error('User must be authenticated to delete notes');
      }

      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', session.user.id);

      if (deleteError) throw deleteError;

      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
      return true;
    } catch (err) {
      console.error('Error deleting note:', err);
      throw err;
    }
  };

  const fetchNoteById = async (noteId: string) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*, note_tags(tag)')
        .eq('id', noteId)
        .single();

      if (error) throw error;

      return {
        ...data,
        tags: data.note_tags?.map((nt: { tag: string }) => nt.tag) || [],
      };
    } catch (err) {
      console.error('Error fetching note:', err);
      throw err;
    }
  };

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    fetchNoteById,
    refreshNotes: fetchNotes,
  };
}

export function useSupabase() {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loadingLabels, setLoadingLabels] = useState(true);

  useEffect(() => {
    fetchTasks();
    fetchLabels();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLabels = async () => {
    try {
      setLoadingLabels(true);
      const { data, error } = await supabase
        .from('labels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLabels(data || []);
    } catch (error) {
      console.error('Error fetching labels:', error);
    } finally {
      setLoadingLabels(false);
    }
  };

  const createTask = async (
    task: Omit<Task, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([task])
        .select()
        .single();

      if (error) throw error;
      setTasks((prev) => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, ...data } : task))
      );
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const createLabel = async (
    label: Omit<Label, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      const { data, error } = await supabase
        .from('labels')
        .insert([label])
        .select()
        .single();

      if (error) throw error;
      setLabels((prev) => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating label:', error);
      throw error;
    }
  };

  const updateLabel = async (id: string, updates: Partial<Label>) => {
    try {
      const { data, error } = await supabase
        .from('labels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setLabels((prev) =>
        prev.map((label) => (label.id === id ? { ...label, ...data } : label))
      );
      return data;
    } catch (error) {
      console.error('Error updating label:', error);
      throw error;
    }
  };

  const deleteLabel = async (id: string) => {
    try {
      const { error } = await supabase.from('labels').delete().eq('id', id);
      if (error) throw error;
      setLabels((prev) => prev.filter((label) => label.id !== id));
    } catch (error) {
      console.error('Error deleting label:', error);
      throw error;
    }
  };

  return {
    tasks,
    loading,
    error,
    labels,
    loadingLabels,
    fetchTasks,
    fetchLabels,
    createTask,
    updateTask,
    deleteTask,
    createLabel,
    updateLabel,
    deleteLabel,
  };
}
