
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

const AuthDebug = () => {
  const { user, session, loading } = useAuth();

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">🐛 Auth Debug</div>
      <div>Loading: {loading ? '✅' : '❌'}</div>
      <div>User: {user ? '✅ ' + user.email : '❌ No user'}</div>
      <div>Session: {session ? '✅ Active' : '❌ No session'}</div>
      <div>Provider: {user?.app_metadata?.provider || 'N/A'}</div>
      <div className="text-xs mt-2 opacity-70">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default AuthDebug;
