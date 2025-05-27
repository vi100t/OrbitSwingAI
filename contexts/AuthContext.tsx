import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, initializeAuth, cleanupAuth } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Initialize auth and get initial session
    initializeAuth().then((initialSession) => {
      setSession(initialSession);
    });

    // Cleanup on unmount
    return () => {
      cleanupAuth();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in with email:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      throw new Error(error.message);
    }

    if (!data.session) {
      console.error('No session returned after sign in');
      throw new Error('Failed to create session');
    }

    console.log('Sign in successful, session created');
    setSession(data.session);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
