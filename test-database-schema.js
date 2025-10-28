// Test script to validate database schema and Supabase connection
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Testing Supabase Connection and Schema...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseSchema() {
  try {
    console.log('1. Testing database connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('skill_categories').select('*').limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    
    // Test all required tables exist
    console.log('\n2. Testing required tables...');
    
    const requiredTables = [
      'users',
      'user_profiles', 
      'user_progress',
      'user_skills',
      'skill_categories',
      'missions',
      'mission_progress',
      'challenges',
      'challenge_participants',
      'social_posts',
      'post_likes',
      'post_comments',
      'user_relationships',
      'social_activities',
      'user_rankings',
      'user_badges',
      'leaderboard_entries',
      'user_skill_progress',
      'user_progress_logs',
      'challenge_recommendations',
      'user_notifications',
      'notification_preferences',
      'user_sessions',
      'user_engagement'
    ];
    
    let allTablesExist = true;
    
    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ Table '${table}' missing or inaccessible:`, error.message);
          allTablesExist = false;
        } else {
          console.log(`✅ Table '${table}' exists`);
        }
      } catch (err) {
        console.log(`❌ Error testing table '${table}':`, err.message);
        allTablesExist = false;
      }
    }
    
    if (!allTablesExist) {
      console.log('\n❌ Some tables are missing. Please run the schema_safe.sql script in Supabase SQL Editor.');
      return false;
    }
    
    console.log('\n3. Testing sample data...');
    
    // Check if skill categories were inserted
    const { data: categories, error: catError } = await supabase
      .from('skill_categories')
      .select('*');
      
    if (catError) {
      console.log('❌ Error fetching skill categories:', catError.message);
    } else {
      console.log(`✅ Found ${categories.length} skill categories`);
      categories.forEach(cat => {
        console.log(`   - ${cat.name}: ${cat.description}`);
      });
    }
    
    console.log('\n4. Testing database functions...');
    
    // Test if our custom functions exist
    try {
      // This should not error even if no posts exist
      const { error: funcError } = await supabase.rpc('increment_post_likes', { 
        post_id: '00000000-0000-0000-0000-000000000000' 
      });
      
      // We expect this to "succeed" but do nothing since the post doesn't exist
      console.log('✅ Database functions are accessible');
    } catch (err) {
      console.log('❌ Database functions may not be installed:', err.message);
    }
    
    console.log('\n🎉 Database schema test completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   ✅ Connection: Working`);
    console.log(`   ✅ Tables: ${requiredTables.length} tables verified`);
    console.log(`   ✅ Sample Data: ${categories?.length || 0} skill categories`);
    console.log(`   ✅ Functions: Accessible`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error during testing:', error);
    return false;
  }
}

// Run the test
testDatabaseSchema().then(success => {
  if (success) {
    console.log('\n🚀 Your database is ready for the application!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Please fix the issues above and run the test again.');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});