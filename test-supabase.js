// Quick test to check Supabase configuration
import { supabase } from './src/lib/supabase.js';

console.log('🔧 Testing Supabase Configuration...');
console.log('Supabase URL:', import.meta.env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'NOT FOUND');
console.log('Supabase Key:', import.meta.env?.VITE_SUPABASE_ANON_KEY ? 'SET ✅' : 'NOT SET ❌');
console.log('Supabase Client Type:', typeof supabase);
console.log('Auth methods available:', Object.keys(supabase.auth || {}));

// Test a simple auth operation
try {
  const result = await supabase.auth.getSession();
  console.log('Auth test result:', result);
} catch (error) {
  console.error('Auth test error:', error);
}