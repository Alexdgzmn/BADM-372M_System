import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { emailVerificationService } from '../services/emailVerificationService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  emailVerificationSent: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resendVerification: (email: string) => Promise<{ error: any }>;
  resetEmailVerificationSent: () => void;
  checkVerificationStatus: () => Promise<{ verified: boolean; pending: boolean; error?: string }>;
  getUserProfile: () => Promise<{ profile?: any; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (!error && data?.user && !data?.user?.email_confirmed_at) {
      setEmailVerificationSent(true);
    }
    
    return { error, data };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setEmailVerificationSent(false);
  };

  const resendVerification = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (!error) {
      setEmailVerificationSent(true);
    }
    
    return { error };
  };

  const resetEmailVerificationSent = () => {
    setEmailVerificationSent(false);
  };

  const checkVerificationStatus = async () => {
    if (!user?.id) {
      return { verified: false, pending: false, error: 'No user logged in' };
    }
    
    return await emailVerificationService.getVerificationStatus(user.id);
  };

  const getUserProfile = async () => {
    if (!user?.id) {
      return { error: 'No user logged in' };
    }
    
    return await emailVerificationService.getUserProfile(user.id);
  };

  const value = {
    user,
    session,
    loading,
    emailVerificationSent,
    signUp,
    signIn,
    signOut,
    resendVerification,
    resetEmailVerificationSent,
    checkVerificationStatus,
    getUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};