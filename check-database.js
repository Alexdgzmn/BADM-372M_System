import { createClient } from '@supabase/supabase-js';

// Use your actual Supabase credentials
const supabaseUrl = 'https://htxgcwwclkgivjxfzyuc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eGdjd3djbGtnaXZqeGZ6eXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTQzMTEsImV4cCI6MjA3NzE5MDMxMX0.Bex2QXCyYbYJJrSB5E2BOXoa9Ziui51PTgDTJV9ZjQo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseStructure() {
  console.log('🔍 Checking Supabase Database Structure...\n');

  try {
    // Check if email_verifications table exists
    console.log('📋 Checking email_verifications table...');
    const { data: emailVerifications, error: emailVerError } = await supabase
      .from('email_verifications')
      .select('*')
      .limit(1);

    if (emailVerError) {
      console.log('❌ email_verifications table:', emailVerError.message);
    } else {
      console.log('✅ email_verifications table exists');
      console.log('   Sample structure:', Object.keys(emailVerifications?.[0] || {}));
    }

    // Check if user_profiles table exists
    console.log('\n📋 Checking user_profiles table...');
    const { data: userProfiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (profileError) {
      console.log('❌ user_profiles table:', profileError.message);
    } else {
      console.log('✅ user_profiles table exists');
      console.log('   Sample structure:', Object.keys(userProfiles?.[0] || {}));
    }

    // Check auth.users (built-in Supabase table)
    console.log('\n👤 Checking auth.users...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('ℹ️  No authenticated user (this is normal for checking structure)');
    } else {
      console.log('✅ Auth system is working, user authenticated');
    }

    // Test database functions
    console.log('\n🔧 Testing database functions...');
    
    // Try to call our custom function (this might fail if not implemented)
    const { data: functionTest, error: functionError } = await supabase
      .rpc('confirm_email_verification', { token_param: 'test-token' });

    if (functionError) {
      console.log('❌ confirm_email_verification function:', functionError.message);
    } else {
      console.log('✅ confirm_email_verification function exists');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkDatabaseStructure();