
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getEnvironmentConfig } from '@/utils/environment';

const AuthDebug = () => {
  const { user, session, loading } = useAuth();
  const envConfig = getEnvironmentConfig();

  useEffect(() => {
    // Solo mostrar logs en desarrollo
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        mode: envConfig.environment,
        baseUrl: envConfig.baseUrl,
        isDev: envConfig.isDevelopment
      },
      authState: {
        loading,
        hasUser: !!user,
        hasSession: !!session
      },
      userInfo: user ? {
        email: user.email,
        id: user.id.substring(0, 8) + '...',
        provider: user.app_metadata?.provider || 'email',
        confirmed: !!user.email_confirmed_at
      } : null,
      sessionInfo: session ? {
        hasToken: !!session.access_token,
        tokenType: session.token_type,
        expires: new Date(session.expires_at! * 1000).toLocaleString()
      } : null,
      urls: {
        current: window.location.href,
        origin: window.location.origin,
        host: window.location.hostname
      }
    };

    console.log('🐛 Auth Debug Info:', debugInfo);
  }, [user, session, loading, envConfig]);

  // No renderizar nada en el DOM
  return null;
};

export default AuthDebug;
