import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Configuration Check:');
console.log('URL:', supabaseUrl ? 'SET ✅' : 'MISSING ❌');
console.log('Key:', supabaseAnonKey ? 'SET ✅' : 'MISSING ❌');

// Create a mock client if Supabase is not configured
let supabase: any;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url' || supabaseAnonKey === 'your_supabase_anon_key') {
  console.warn('⚠️ Supabase not configured - using mock authentication');
  
  // Create a comprehensive mock Supabase client for development
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: ({ email, password }: any) => {
        console.log('🔄 Mock signUp called:', email, 'password length:', password?.length);
        return Promise.resolve({ 
          data: { user: { id: 'mock-user-id', email }, session: null }, 
          error: null 
        });
      },
      signInWithPassword: ({ email, password }: any) => {
        console.log('🔄 Mock signIn called:', email, 'password length:', password?.length);
        return Promise.resolve({ 
          data: { user: { id: 'mock-user-id', email }, session: null }, 
          error: null 
        });
      },
      signOut: () => {
        console.log('🔄 Mock signOut called');
        return Promise.resolve({ error: null });
      },
      resend: ({ type, email }: any) => {
        console.log('🔄 Mock resend called:', type, email);
        return Promise.resolve({ error: null });
      }
    },
    from: () => ({
      select: () => ({ 
        eq: () => ({ 
          single: () => Promise.resolve({ data: null, error: { message: 'Mock database not implemented' } }),
          limit: () => Promise.resolve({ data: [], error: null })
        })
      }),
      insert: () => Promise.resolve({ error: { message: 'Mock database not implemented' } }),
      update: () => ({ 
        eq: () => Promise.resolve({ error: { message: 'Mock database not implemented' } })
      })
    }),
    rpc: (functionName: string, params: any) => {
      console.log('🔄 Mock RPC called:', functionName, params);
      return Promise.resolve({ data: null, error: { message: 'Mock RPC not implemented' } });
    }
  };
} else {
  console.log('✅ Using real Supabase client');
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };