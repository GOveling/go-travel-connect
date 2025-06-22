
/**
 * Utility to detect environment and provide correct URLs
 */

export type Environment = 'development' | 'production' | 'lovable';

export const detectEnvironment = (): Environment => {
  const hostname = window.location.hostname;
  const isDev = import.meta.env.DEV;
  
  if (isDev || hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }
  
  if (hostname.includes('lovableproject.com')) {
    return 'lovable';
  }
  
  return 'production';
};

export const getBaseUrl = (): string => {
  return window.location.origin;
};

export const getRedirectUrl = (path: string = ''): string => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path}`;
};

export const getEnvironmentConfig = () => {
  const env = detectEnvironment();
  const baseUrl = getBaseUrl();
  
  console.log(`🌍 Environment detected: ${env}`);
  console.log(`🔗 Base URL: ${baseUrl}`);
  
  return {
    environment: env,
    baseUrl,
    isDevelopment: env === 'development',
    isProduction: env === 'production',
    isLovable: env === 'lovable',
  };
};
