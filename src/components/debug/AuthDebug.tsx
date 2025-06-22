
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getEnvironmentConfig } from '@/utils/environment';

const AuthDebug = () => {
  const { user, session, loading } = useAuth();
  const envConfig = getEnvironmentConfig();

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm z-50 max-h-96 overflow-y-auto">
      <div className="font-bold mb-2">🐛 Auth Debug</div>
      
      {/* Environment Info */}
      <div className="mb-2 border-b border-gray-600 pb-2">
        <div className="text-yellow-300 font-semibold">Environment:</div>
        <div>Mode: {envConfig.environment}</div>
        <div>Base URL: {envConfig.baseUrl}</div>
        <div>Is Dev: {envConfig.isDevelopment ? '✅' : '❌'}</div>
      </div>

      {/* Auth State */}
      <div className="mb-2 border-b border-gray-600 pb-2">
        <div className="text-blue-300 font-semibold">Auth State:</div>
        <div>Loading: {loading ? '⏳' : '✅'}</div>
        <div>Has User: {user ? '✅' : '❌'}</div>
        <div>Has Session: {session ? '✅' : '❌'}</div>
      </div>

      {/* User Info */}
      {user && (
        <div className="mb-2 border-b border-gray-600 pb-2">
          <div className="text-green-300 font-semibold">User Info:</div>
          <div>Email: {user.email}</div>
          <div>ID: {user.id.substring(0, 8)}...</div>
          <div>Provider: {user.app_metadata?.provider || 'email'}</div>
          <div>Confirmed: {user.email_confirmed_at ? '✅' : '❌'}</div>
        </div>
      )}

      {/* Session Info */}
      {session && (
        <div className="mb-2 border-b border-gray-600 pb-2">
          <div className="text-purple-300 font-semibold">Session Info:</div>
          <div>Has Token: {session.access_token ? '✅' : '❌'}</div>
          <div>Token Type: {session.token_type}</div>
          <div>Expires: {new Date(session.expires_at! * 1000).toLocaleTimeString()}</div>
        </div>
      )}

      {/* URLs Info */}
      <div className="mb-2">
        <div className="text-orange-300 font-semibold">URLs:</div>
        <div>Current: {window.location.href}</div>
        <div>Origin: {window.location.origin}</div>
        <div>Host: {window.location.hostname}</div>
      </div>

      <div className="text-xs mt-2 opacity-70">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default AuthDebug;
