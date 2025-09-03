import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { sanitizeUserInput } from '../utils/security';

/**
 * Enhanced auth hook with security features
 */
export const useSecureAuth = () => {
  const auth = useAuth();
  const [authAttempts, setAuthAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Rate limiting for authentication attempts
  const MAX_AUTH_ATTEMPTS = 5;
  const RATE_LIMIT_DURATION = 15 * 60 * 1000; // 15 minutes

  const checkRateLimit = useCallback(() => {
    if (authAttempts >= MAX_AUTH_ATTEMPTS) {
      setIsRateLimited(true);
      setTimeout(() => {
        setIsRateLimited(false);
        setAuthAttempts(0);
      }, RATE_LIMIT_DURATION);
      return true;
    }
    return false;
  }, [authAttempts]);

  const secureSignIn = useCallback(async (email: string, password: string) => {
    if (checkRateLimit()) {
      throw new Error('Too many authentication attempts. Please try again later.');
    }

    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Sanitize inputs (though auth library should handle this)
    const sanitizedEmail = sanitizeUserInput(email.toLowerCase().trim());
    
    try {
      const result = await auth.signIn(sanitizedEmail, password);
      // Reset attempts on successful login
      setAuthAttempts(0);
      setIsRateLimited(false);
      return result;
    } catch (error) {
      setAuthAttempts(prev => prev + 1);
      
      // Log failed attempt for security monitoring
      console.warn('Failed authentication attempt:', {
        timestamp: new Date().toISOString(),
        email: sanitizedEmail,
        attempt: authAttempts + 1,
        userAgent: navigator.userAgent
      });
      
      throw error;
    }
  }, [auth.signIn, checkRateLimit, authAttempts]);

  const secureSignUp = useCallback(async (email: string, password: string, additionalData?: any) => {
    if (checkRateLimit()) {
      throw new Error('Too many registration attempts. Please try again later.');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }

    // Validate and sanitize inputs
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    const sanitizedEmail = sanitizeUserInput(email.toLowerCase().trim());
    const sanitizedData = additionalData ? {
      ...additionalData,
      firstName: additionalData.firstName ? sanitizeUserInput(additionalData.firstName) : undefined,
      lastName: additionalData.lastName ? sanitizeUserInput(additionalData.lastName) : undefined,
    } : undefined;

    try {
      const result = await auth.signUp(sanitizedEmail, password, sanitizedData);
      setAuthAttempts(0);
      setIsRateLimited(false);
      return result;
    } catch (error) {
      setAuthAttempts(prev => prev + 1);
      throw error;
    }
  }, [auth.signUp, checkRateLimit, authAttempts]);

  return {
    ...auth,
    secureSignIn,
    secureSignUp,
    isRateLimited,
    authAttempts,
    maxAttempts: MAX_AUTH_ATTEMPTS,
  };
};