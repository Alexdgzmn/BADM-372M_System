// Debug component to help troubleshoot Vercel deployment issues
import React from 'react';

export const DeploymentDebug: React.FC = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const isDev = import.meta.env.DEV;
  const mode = import.meta.env.MODE;

  return (
    <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-lg max-w-md text-xs font-mono z-50">
      <h3 className="font-bold text-gray-800 mb-2">🔍 Deployment Debug</h3>
      <div className="space-y-1 text-gray-600">
        <div className="flex justify-between">
          <span>Environment:</span>
          <span className={isDev ? 'text-blue-600' : 'text-green-600'}>
            {isDev ? 'Development' : 'Production'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Mode:</span>
          <span>{mode}</span>
        </div>
        <div className="flex justify-between">
          <span>Origin:</span>
          <span className="text-purple-600">{window.location.origin}</span>
        </div>
        <div className="flex justify-between">
          <span>Supabase URL:</span>
          <span className={supabaseUrl ? 'text-green-600' : 'text-red-600'}>
            {supabaseUrl ? '✅ Set' : '❌ Missing'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Supabase Key:</span>
          <span className={supabaseKey ? 'text-green-600' : 'text-red-600'}>
            {supabaseKey ? '✅ Set' : '❌ Missing'}
          </span>
        </div>
        {supabaseUrl && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs break-all">
            <strong>URL:</strong> {supabaseUrl.substring(0, 30)}...
          </div>
        )}
        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
          <strong>Expected Redirect:</strong><br/>
          {window.location.origin}/auth/callback
        </div>
      </div>
    </div>
  );
};