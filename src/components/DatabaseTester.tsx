import React, { useState } from 'react';
import { Database, Check, X, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const DatabaseTester: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    connection: 'success' | 'error' | 'pending';
    tables: 'success' | 'error' | 'pending';
    message: string;
    details?: any;
  } | null>(null);

  const testDatabaseConnection = async () => {
    setTesting(true);
    setResults({
      connection: 'pending',
      tables: 'pending',
      message: 'Testing connection...'
    });

    try {
      // Test 1: Connection
      const { error: connectionError } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (connectionError) {
        setResults({
          connection: 'error',
          tables: 'pending',
          message: `Connection failed: ${connectionError.message}`,
          details: connectionError
        });
        setTesting(false);
        return;
      }

      setResults({
        connection: 'success',
        tables: 'pending',
        message: 'Connection successful! Testing tables...'
      });

      // Test 2: Check if tables exist
      const tables = [
        'users',
        'user_skills',
        'missions',
        'challenges',
        'challenge_participants',
        'social_posts'
      ];

      const tableResults: any = {};
      
      for (const table of tables) {
        try {
          const { error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          tableResults[table] = error ? `❌ ${error.message}` : '✅ Accessible';
        } catch (err) {
          tableResults[table] = '❌ Not found';
        }
      }

      setResults({
        connection: 'success',
        tables: 'success',
        message: 'Database test complete!',
        details: tableResults
      });

    } catch (error: any) {
      setResults({
        connection: 'error',
        tables: 'error',
        message: `Unexpected error: ${error.message}`,
        details: error
      });
    } finally {
      setTesting(false);
    }
  };

  const testDataWrite = async () => {
    setTesting(true);
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        alert('Please sign in first to test data writing');
        setTesting(false);
        return;
      }

      // Try to insert a test skill
      const testSkill = {
        user_id: user.id,
        name: 'Test Skill - ' + new Date().toLocaleTimeString(),
        level: 1,
        experience: 0,
        total_experience: 0,
        experience_to_next: 100,
        color: '#3B82F6'
      };

      const { data, error } = await supabase
        .from('user_skills')
        .insert([testSkill])
        .select();

      if (error) {
        alert(`Write test failed: ${error.message}\n\nThis might mean:\n- Table doesn't exist\n- You don't have write permissions\n- Schema mismatch`);
        console.error('Write error:', error);
      } else {
        alert(`✅ Success! Test skill written to database.\n\nData: ${JSON.stringify(data, null, 2)}\n\nCheck your Supabase dashboard to see it!`);
        console.log('Write successful:', data);
      }
    } catch (error: any) {
      alert(`Unexpected error: ${error.message}`);
      console.error('Write test error:', error);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-secondary/10 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-lg font-bold text-primary">Database Connection Tester</h3>
            <p className="text-sm text-gray-600">Verify Supabase integration</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={testDatabaseConnection}
          disabled={testing}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Test Database Connection
            </>
          )}
        </button>

        <button
          onClick={testDataWrite}
          disabled={testing}
          className="w-full flex items-center justify-center gap-2 bg-secondary text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Database className="w-4 h-4" />
              Test Data Write
            </>
          )}
        </button>

        {results && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {results.connection === 'success' ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : results.connection === 'error' ? (
                  <X className="w-5 h-5 text-red-600" />
                ) : (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                )}
                <span className="font-medium">Connection: {results.connection}</span>
              </div>

              <p className="text-sm text-gray-700">{results.message}</p>

              {results.details && (
                <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Table Status:</p>
                  <div className="space-y-1 text-xs font-mono">
                    {Object.entries(results.details).map(([table, status]) => (
                      <div key={table} className="flex justify-between">
                        <span className="text-gray-600">{table}:</span>
                        <span>{status as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>💡 Note:</strong> Your app currently uses localStorage for data storage. 
            Skills and missions are saved in your browser, not the database.
          </p>
        </div>
      </div>
    </div>
  );
};
