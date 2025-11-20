import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database, CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';

export const DatabaseTestPanel: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    connection: 'success' | 'error' | 'pending';
    tables: 'success' | 'error' | 'pending';
    auth: 'success' | 'error' | 'pending';
    details: string[];
  }>({
    connection: 'pending',
    tables: 'pending',
    auth: 'pending',
    details: []
  });

  const testDatabase = async () => {
    setTesting(true);
    const details: string[] = [];

    // Test 1: Connection
    details.push('Testing database connection...');
    setResults(prev => ({ ...prev, connection: 'pending', details: [...details] }));

    try {
      const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
      
      if (error) {
        details.push(`❌ Connection Error: ${error.message}`);
        setResults(prev => ({ ...prev, connection: 'error', details: [...details] }));
      } else {
        details.push('✅ Database connection successful');
        setResults(prev => ({ ...prev, connection: 'success', details: [...details] }));
      }
    } catch (error: any) {
      details.push(`❌ Connection failed: ${error.message}`);
      setResults(prev => ({ ...prev, connection: 'error', details: [...details] }));
    }

    // Test 2: Tables
    details.push('\nTesting tables...');
    setResults(prev => ({ ...prev, tables: 'pending', details: [...details] }));

    const tablesToCheck = ['users', 'user_skills', 'missions', 'challenges', 'social_posts'];
    let allTablesExist = true;

    for (const table of tablesToCheck) {
      try {
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        
        if (error) {
          details.push(`❌ Table '${table}' error: ${error.message}`);
          allTablesExist = false;
        } else {
          details.push(`✅ Table '${table}' exists`);
        }
      } catch (error: any) {
        details.push(`❌ Table '${table}' check failed: ${error.message}`);
        allTablesExist = false;
      }
    }

    setResults(prev => ({ ...prev, tables: allTablesExist ? 'success' : 'error', details: [...details] }));

    // Test 3: Auth
    details.push('\nTesting authentication...');
    setResults(prev => ({ ...prev, auth: 'pending', details: [...details] }));

    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        details.push(`❌ Auth Error: ${error.message}`);
        setResults(prev => ({ ...prev, auth: 'error', details: [...details] }));
      } else {
        details.push(`✅ Auth system working (${data.session ? 'User logged in' : 'No active session'})`);
        setResults(prev => ({ ...prev, auth: 'success', details: [...details] }));
      }
    } catch (error: any) {
      details.push(`❌ Auth check failed: ${error.message}`);
      setResults(prev => ({ ...prev, auth: 'error', details: [...details] }));
    }

    details.push('\n=== Test Complete ===');
    setResults(prev => ({ ...prev, details: [...details] }));
    setTesting(false);
  };

  const getStatusIcon = (status: 'success' | 'error' | 'pending') => {
    if (status === 'success') return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (status === 'error') return <XCircle className="w-5 h-5 text-red-600" />;
    return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-secondary/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-primary">Database Connection Test</h2>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Connection Status</span>
          {getStatusIcon(results.connection)}
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Tables Check</span>
          {getStatusIcon(results.tables)}
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Authentication</span>
          {getStatusIcon(results.auth)}
        </div>
      </div>

      {results.details.length > 0 && (
        <div className="mb-4 p-4 bg-gray-900 rounded-lg">
          <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
            {results.details.join('\n')}
          </pre>
        </div>
      )}

      <button
        onClick={testDatabase}
        disabled={testing}
        className="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {testing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Testing...
          </>
        ) : (
          <>
            <Database className="w-4 h-4" />
            Run Database Tests
          </>
        )}
      </button>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">Database Setup Required:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Make sure you've run the schema.sql file in Supabase SQL Editor</li>
              <li>Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env</li>
              <li>Verify your Supabase project is active</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
