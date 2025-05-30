import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

// Create a single instance of the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Initialize auth state
let authSubscription: {
  data: { subscription: { unsubscribe: () => void } };
} | null = null;

export const initializeAuth = () => {
  // Clean up any existing subscription
  if (authSubscription) {
    authSubscription.data.subscription.unsubscribe();
  }

  // Set up new subscription
  authSubscription = supabase.auth.onAuthStateChange((event, session) => {
    console.log(
      'Auth state changed:',
      event,
      session ? 'Session active' : 'No session'
    );
  });

  // Check initial session
  return supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (error) {
      console.error('Supabase auth test failed:', error);
    } else {
      console.log(
        'Supabase auth test successful, session:',
        session ? 'Active' : 'None'
      );
    }
    return session;
  });
};

// Cleanup function
export const cleanupAuth = () => {
  if (authSubscription) {
    authSubscription.data.subscription.unsubscribe();
    authSubscription = null;
  }
};

export async function createNote(
  title: string,
  content: string,
  tags: string[],
  color: string = '#ffffff' // Default to white if no color is provided
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: note, error: noteError } = await supabase
    .from('notes')
    .insert({
      title,
      content,
      user_id: user.id,
      color,
    })
    .select()
    .single();

  if (noteError) throw noteError;
  if (!note) throw new Error('Failed to create note');

  // Insert tags
  if (tags.length > 0) {
    const { error: tagsError } = await supabase.from('note_tags').insert(
      tags.map((tag) => ({
        note_id: note.id,
        tag,
      }))
    );
    if (tagsError) throw tagsError;
  }

  return note;
}
