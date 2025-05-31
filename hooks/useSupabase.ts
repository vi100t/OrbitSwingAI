import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type Tables = Database['public']['Tables'];

// Global channel instance
let globalChannel: any = null;
let globalNotesChannel: any = null;

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

      // Add retry logic for tasks fetch
      let retryCount = 0;
      const maxRetries = 3;
      let tasks = null;
      let tasksError = null;

      while (retryCount < maxRetries) {
        try {
          const result = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', session.user.id)
            .order('due_date', { ascending: true });

          tasks = result.data;
          tasksError = result.error;
          break;
        } catch (err) {
          console.log(`Retry ${retryCount + 1} failed:`, err);
          retryCount++;
          if (retryCount === maxRetries) throw err;
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCount)
          );
        }
      }

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        throw tasksError;
      }

      // Fetch subtasks for all tasks with retry logic
      const taskIds = tasks?.map((task) => task.id) || [];
      let subtasks = null;
      let subtasksError = null;
      retryCount = 0;

      while (retryCount < maxRetries) {
        try {
          const result = await supabase
            .from('subtasks')
            .select('*')
            .in('task_id', taskIds);

          subtasks = result.data;
          subtasksError = result.error;
          break;
        } catch (err) {
          console.log(`Retry ${retryCount + 1} failed:`, err);
          retryCount++;
          if (retryCount === maxRetries) throw err;
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCount)
          );
        }
      }

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
    if (!session?.user?.id) {
      // Clean up channel if user logs out
      if (globalChannel) {
        console.log('User logged out, removing tasks channel');
        supabase.removeChannel(globalChannel);
        globalChannel = null;
        isSubscribedRef.current = false;
      }
      return;
    }

    // Use the global channel instance
    if (!globalChannel) {
      console.log('Setting up new subscription');
      globalChannel = supabase.channel('tasks_changes').on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          console.log('Task change detected:', payload);
          fetchTasks();
        }
      );

      // Subscribe only once
      globalChannel.subscribe(
        (status: 'SUBSCRIBED' | 'CLOSED' | 'CHANNEL_ERROR' | 'TIMED_OUT') => {
          console.log('Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current = true;
          }
        }
      );
    }

    // Cleanup function
    return () => {
      console.log('Running cleanup');
      if (globalChannel) {
        console.log('Removing channel');
        supabase.removeChannel(globalChannel);
        globalChannel = null;
        isSubscribedRef.current = false;
      }
    };
  }, [session?.user?.id]); // Only depend on user ID

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

  async function updateTask(id: string, updates: any) {
    try {
      if (!session?.user?.id) {
        throw new Error('No user session');
      }

      console.log('Starting task update:', {
        taskId: id,
        userId: session.user.id,
        updates,
      });

      // Extract subtasks from updates if they exist
      const subtasks = updates.subtasks;
      delete updates.subtasks;

      // First verify the task exists and belongs to the user
      console.log('Verifying task exists...');
      const { data: existingTask, error: verifyError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (verifyError) {
        console.error('Error verifying task:', verifyError);
        throw verifyError;
      }

      console.log('Verification result:', { existingTask });

      if (!existingTask) {
        console.error('Task not found:', { id });
        throw new Error('Task not found');
      }

      if (existingTask.user_id !== session.user.id) {
        console.error('Task belongs to different user:', {
          taskUserId: existingTask.user_id,
          currentUserId: session.user.id,
        });
        throw new Error('Unauthorized to update this task');
      }

      console.log('Task verified, proceeding with update');

      // Update the task
      const { data: updatedTask, error: taskError } = await supabase
        .from('tasks')
        .update({
          title: updates.title,
          description: updates.description,
          due_date: updates.due_date,
          due_time: updates.due_time,
          priority: updates.priority,
          is_completed: updates.is_completed,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (taskError) {
        console.error('Error updating task:', taskError);
        throw taskError;
      }

      // If there are subtasks, update them
      if (subtasks && Array.isArray(subtasks)) {
        for (const subtask of subtasks) {
          if (subtask.id) {
            // Update existing subtask
            const { error: subtaskError } = await supabase
              .from('subtasks')
              .update({
                title: subtask.title,
                is_completed: subtask.is_completed,
                updated_at: new Date().toISOString(),
              })
              .eq('id', subtask.id)
              .eq('task_id', id);

            if (subtaskError) {
              console.error('Error updating subtask:', subtaskError);
            }
          } else {
            // Create new subtask
            const { error: subtaskError } = await supabase
              .from('subtasks')
              .insert({
                task_id: id,
                title: subtask.title,
                is_completed: subtask.is_completed,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

            if (subtaskError) {
              console.error('Error creating subtask:', subtaskError);
            }
          }
        }
      }

      // Fetch the updated task with its subtasks
      const { data: finalTask, error: fetchError } = await supabase
        .from('tasks')
        .select('*, subtasks(*)')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching updated task:', fetchError);
        throw fetchError;
      }

      console.log('Final task data:', finalTask);

      // Refresh the tasks list
      await fetchTasks();

      return finalTask;
    } catch (err) {
      console.error('Exception in updateTask:', err);
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
  const { session } = useAuth();
  const [notes, setNotes] = useState<Tables['notes']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isSubscribedRef = React.useRef(false);

  const fetchNotes = React.useCallback(async () => {
    try {
      if (!session?.user?.id) {
        console.log('No user session, skipping note fetch');
        return;
      }

      setLoading(true);
      console.log('Fetching notes for user:', session.user.id);
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select('*, note_tags(tag)') // Select tags along with notes
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false });

      if (notesError) {
        console.error('Error fetching notes:', notesError);
        throw notesError;
      }

      console.log('Raw notes data from Supabase:', notes);

      // Map note_tags to a simple array of strings
      const notesWithTags =
        notes?.map((note) => ({
          ...note,
          tags:
            note.note_tags?.map((tag: Tables['note_tags']['Row']) => tag.tag) ||
            [],
        })) || [];

      console.log('Processed notes with tags:', notesWithTags);
      setNotes(notesWithTags);
    } catch (err) {
      console.error('Error in fetchNotes:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Fetch notes on mount and when session changes
  useEffect(() => {
    if (session?.user?.id) {
      fetchNotes();
    }
  }, [session?.user?.id, fetchNotes]);

  // Set up realtime subscription
  useEffect(() => {
    if (!session?.user?.id) {
      // Clean up channel if user logs out
      if (globalNotesChannel) {
        console.log('User logged out, removing notes channel');
        supabase.removeChannel(globalNotesChannel);
        globalNotesChannel = null;
        isSubscribedRef.current = false;
      }
      return;
    }

    // Use the global channel instance
    if (!globalNotesChannel) {
      console.log('Setting up new notes subscription');
      globalNotesChannel = supabase.channel('notes_changes').on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          console.log('Note change detected:', payload);
          // Only fetch if the change wasn't triggered by our own update
          if (payload.eventType !== 'UPDATE') {
            fetchNotes();
          }
        }
      );

      // Subscribe only once
      globalNotesChannel.subscribe(
        (status: 'SUBSCRIBED' | 'CLOSED' | 'CHANNEL_ERROR' | 'TIMED_OUT') => {
          console.log('Notes subscription status:', status);
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current = true;
          }
        }
      );
    }

    // Cleanup function
    return () => {
      console.log('Running notes cleanup');
      if (globalNotesChannel) {
        console.log('Removing notes channel');
        supabase.removeChannel(globalNotesChannel);
        globalNotesChannel = null;
        isSubscribedRef.current = false;
      }
    };
  }, [session?.user?.id]); // Only depend on user ID

  const createNote = async (note: {
    title: string;
    content: string;
    tags?: string[];
    color?: string;
  }) => {
    try {
      if (!session?.user?.id) {
        throw new Error('No user session');
      }

      console.log('Creating note:', note);

      // Start a transaction
      const { data: newNote, error: noteError } = await supabase
        .from('notes')
        .insert({
          user_id: session.user.id,
          title: note.title,
          content: note.content,
          color: note.color || '#ffffff', // Default to white if no color provided
        })
        .select()
        .single();

      if (noteError) {
        console.error('Error creating note:', noteError);
        throw noteError;
      }

      console.log('Created note:', newNote);

      // If there are tags, insert them
      if (note.tags && note.tags.length > 0) {
        const { error: tagsError } = await supabase.from('note_tags').insert(
          note.tags.map((tag) => ({
            note_id: newNote.id,
            tag,
          }))
        );

        if (tagsError) {
          console.error('Error creating note tags:', tagsError);
          throw tagsError;
        }
      }

      // Re-fetch notes to update the list
      await fetchNotes();

      return newNote;
    } catch (err) {
      console.error('Error in createNote:', err);
      throw err;
    }
  };

  async function updateNote(
    id: string,
    updates: Tables['notes']['Update'] & { tags?: string[] }
  ) {
    try {
      if (!session?.user?.id) {
        throw new Error('No user session');
      }

      console.log('Starting note update:', {
        noteId: id,
        userId: session.user.id,
        updates,
      });

      // Verify the note exists and belongs to the user
      const { data: existingNote, error: verifyError } = await supabase
        .from('notes')
        .select('id, user_id')
        .eq('id', id)
        .maybeSingle();

      if (verifyError) {
        console.error('Error verifying note:', verifyError);
        throw verifyError;
      }

      if (!existingNote || existingNote.user_id !== session.user.id) {
        console.error('Note not found or belongs to different user:', { id });
        throw new Error('Note not found or unauthorized');
      }

      // Separate note data from tags
      const { tags, ...noteDataToUpdate } = updates;

      // Update the note
      const { data: updatedNote, error: noteError } = await supabase
        .from('notes')
        .update({
          ...noteDataToUpdate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (noteError) {
        console.error('Error updating note:', noteError);
        throw noteError;
      }

      console.log('Note updated successfully:', updatedNote);

      // Handle tags update: delete existing tags and insert new ones
      if (tags !== undefined) {
        // Only update tags if they are included in the updates object
        console.log('Updating note tags...');
        // Delete existing tags for this note
        const { error: deleteTagsError } = await supabase
          .from('note_tags')
          .delete()
          .eq('note_id', id);

        if (deleteTagsError) {
          console.error('Error deleting existing note tags:', deleteTagsError);
          throw deleteTagsError;
        }
        console.log('Existing tags deleted');

        // Insert new tags if there are any
        if (tags.length > 0) {
          const noteTagsData = tags.map((tag: string) => ({
            note_id: id,
            tag: tag,
          }));

          const { error: insertTagsError } = await supabase
            .from('note_tags')
            .insert(noteTagsData);

          if (insertTagsError) {
            console.error('Error inserting new note tags:', insertTagsError);
            throw insertTagsError;
          }
          console.log('New tags inserted successfully');
        }
        console.log('Note tags update complete');
      }

      // Update the notes state directly instead of fetching
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === id
            ? { ...note, ...noteDataToUpdate, tags: tags || note.tags }
            : note
        )
      );

      // Return the updated note with tags
      return {
        ...updatedNote,
        tags: tags || [],
      };
    } catch (err) {
      console.error('Exception in updateNote:', err);
      setError(err as Error);
      return null;
    }
  }

  async function deleteNote(id: string) {
    try {
      if (!session?.user?.id) {
        throw new Error('No user session');
      }

      console.log('Deleting note:', { noteId: id, userId: session.user.id });

      // Verify the note exists and belongs to the user before deleting
      const { data: existingNote, error: verifyError } = await supabase
        .from('notes')
        .select('id, user_id')
        .eq('id', id)
        .maybeSingle();

      if (verifyError) {
        console.error('Error verifying note before deletion:', verifyError);
        throw verifyError;
      }

      if (!existingNote || existingNote.user_id !== session.user.id) {
        console.error('Note not found or belongs to different user:', { id });
        throw new Error('Note not found or unauthorized for deletion');
      }

      const { error } = await supabase.from('notes').delete().eq('id', id);

      if (error) {
        console.error('Error deleting note:', error);
        throw error;
      }

      console.log('Note deleted successfully:', id);

      // Fetch notes to update the list
      await fetchNotes();

      return true;
    } catch (err) {
      console.error('Exception in deleteNote:', err);
      setError(err as Error);
      return false;
    }
  }

  // Function to fetch a single note by ID (for the detail screen)
  async function fetchNoteById(id: string) {
    try {
      if (!session?.user?.id) {
        console.log('No user session, skipping fetchNoteById');
        return null;
      }

      setLoading(true);
      console.log('Fetching note by ID:', {
        noteId: id,
        userId: session.user.id,
      });
      const { data: note, error } = await supabase
        .from('notes')
        .select('*, note_tags(tag)')
        .eq('id', id)
        .eq('user_id', session.user.id) // Ensure the note belongs to the user
        .single();

      if (error) {
        console.error('Error fetching note by ID:', error);
        throw error;
      }

      if (!note) {
        console.log('Note not found for ID:', id);
        return null;
      }

      // Map note_tags to a simple array of strings
      const noteWithTags = {
        ...note,
        tags:
          note.note_tags?.map((tag: Tables['note_tags']['Row']) => tag.tag) ||
          [],
      };

      console.log('Note fetched successfully by ID:', noteWithTags);
      return noteWithTags;
    } catch (err) {
      console.error('Exception in fetchNoteById:', err);
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }

  // Force refresh notes
  const refreshNotes = React.useCallback(() => {
    console.log('Force refreshing notes...');
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    loading,
    error,
    fetchNotes,
    fetchNoteById,
    createNote,
    updateNote,
    deleteNote,
    refreshNotes,
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
