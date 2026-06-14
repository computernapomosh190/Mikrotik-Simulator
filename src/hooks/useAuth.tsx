import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { UserRole, User as AppUser } from '../types';

interface AuthContextType {
  user: User | null;
  profile: AppUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AppUser>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapProfile(data: Record<string, unknown>, email: string): AppUser {
  return {
    id: data.id as string,
    email,
    username: data.username as string,
    displayName: data.display_name as string | null,
    avatarUrl: data.avatar_url as string | null,
    role: data.role as UserRole,
    rating: (data.rating as number) || 0,
    totalLabsCompleted: (data.total_labs_completed as number) || 0,
    currentLevel: (data.current_level as number) || 1,
    currentCourseId: data.current_course_id as string | null,
    createdAt: data.created_at as string,
  };
}

async function fetchOrCreateProfile(supabaseUser: User): Promise<AppUser | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .maybeSingle();

    if (error) {
      console.error('fetchProfile error:', error);
      return null;
    }

    if (data) {
      return mapProfile(data, supabaseUser.email || '');
    }

    const username =
      (supabaseUser.user_metadata?.username as string) ||
      supabaseUser.email?.split('@')[0] ||
      `user_${Date.now()}`;

    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({ id: supabaseUser.id, username })
      .select()
      .single();

    if (insertError) {
      console.error('insertProfile error:', insertError);
      return null;
    }

    return newProfile ? mapProfile(newProfile, supabaseUser.email || '') : null;
  } catch (err) {
    console.error('fetchOrCreateProfile unexpected error:', err);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Fallback: ensure loading is cleared after 8s even if onAuthStateChange never fires
    const fallbackTimer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 8000);

    const handleUser = async (supabaseUser: User | undefined | null, currentSession: Session | null) => {
      if (!mounted) return;
      setSession(currentSession);
      setUser(supabaseUser ?? null);

      if (supabaseUser) {
        const appProfile = await fetchOrCreateProfile(supabaseUser);
        if (mounted) setProfile(appProfile);
      } else {
        if (mounted) setProfile(null);
      }
      if (mounted) {
        clearTimeout(fallbackTimer);
        setLoading(false);
      }
    };

    // Get initial session first
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted) return;
      handleUser(initialSession?.user, initialSession ?? null);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    // Listen for subsequent changes (skip INITIAL_SESSION since we handle it via getSession)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'INITIAL_SESSION') return;
      if (!mounted) return;
      handleUser(newSession?.user, newSession ?? null);
    });

    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (error) return { error: new Error(error.message) };
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: new Error(error.message) };
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<AppUser>) => {
    if (!user) return { error: new Error('Not authenticated') };
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: updates.displayName, avatar_url: updates.avatarUrl })
        .eq('id', user.id);
      if (error) return { error: new Error(error.message) };
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
