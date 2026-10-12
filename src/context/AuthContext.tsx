import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface AuthResponse<T = any> {
  data?: T;
  error: string | null;
  needsEmailConfirmation?: boolean;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResponse<{ user: User | null; session: Session | null }>>;
  signIn: (email: string, password: string) => Promise<AuthResponse<{ user: User | null; session: Session | null }>>;
  signOut: () => Promise<AuthResponse<void>>;
  resetPassword: (email: string) => Promise<AuthResponse<void>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to sanitize & humanize Supabase Auth error messages
export function humanizeAuthError(err: any): string {
  if (!err) return 'An unexpected error occurred.';
  const msg = (err.message || String(err)).toLowerCase();

  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Invalid email or password. Please verify your credentials and try again.';
  }
  if (msg.includes('user already registered') || msg.includes('already registered')) {
    return 'This email address is already registered. Please sign in instead.';
  }
  if (msg.includes('password should be at least') || msg.includes('weak password') || msg.includes('too short')) {
    return 'Password must be at least 8 characters long.';
  }
  if (msg.includes('unable to validate email') || msg.includes('invalid email') || msg.includes('bad email')) {
    return 'Please enter a valid email address.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Your email has not been confirmed yet. Please check your inbox for the confirmation link.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Too many requests. Please wait a few moments and try again.';
  }
  return err.message || 'An error occurred during authentication.';
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Restore active session on app boot
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession }, error }) => {
        if (!isMounted) return;
        if (error) {
          console.warn('[Supabase Auth] Session fetch error:', error.message);
        }
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('[Supabase Auth] Failed to restore session:', err);
        setLoading(false);
      });

    // 2. Listen for real-time auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign Up method
  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<AuthResponse<{ user: User | null; session: Session | null }>> => {
    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();

    // Client-side validations
    if (!trimmedName) {
      return { error: 'Please enter your full legal name.' };
    }
    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      return { error: 'Please enter a valid email address (e.g. name@domain.com).' };
    }
    if (!password || password.length < 8) {
      return { error: 'Password must be at least 8 characters long.' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            name: trimmedName,
          },
        },
      });

      if (error) {
        return { error: humanizeAuthError(error) };
      }

      // Check if email confirmation is required by project settings
      const needsEmailConfirmation = !data.session && !!data.user;

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      }

      return {
        data: { user: data.user, session: data.session },
        needsEmailConfirmation,
        error: null,
      };
    } catch (err: any) {
      return { error: humanizeAuthError(err) };
    }
  };

  // Sign In method
  const signIn = async (
    email: string,
    password: string
  ): Promise<AuthResponse<{ user: User | null; session: Session | null }>> => {
    const trimmedEmail = email.trim();

    // Client-side validations
    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      return { error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 8) {
      return { error: 'Password must be at least 8 characters long.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        return { error: humanizeAuthError(error) };
      }

      setSession(data.session);
      setUser(data.user);

      return {
        data: { user: data.user, session: data.session },
        error: null,
      };
    } catch (err: any) {
      return { error: humanizeAuthError(err) };
    }
  };

  // Sign Out method
  const signOut = async (): Promise<AuthResponse<void>> => {
    try {
      const { error } = await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      if (error) {
        return { error: humanizeAuthError(error) };
      }
      return { error: null };
    } catch (err: any) {
      setUser(null);
      setSession(null);
      return { error: humanizeAuthError(err) };
    }
  };

  // Reset Password method
  const resetPassword = async (email: string): Promise<AuthResponse<void>> => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      return { error: 'Please enter a valid email address.' };
    }

    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { error: humanizeAuthError(error) };
      }

      return { error: null };
    } catch (err: any) {
      return { error: humanizeAuthError(err) };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
