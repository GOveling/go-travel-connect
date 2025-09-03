// Security utilities for handling sensitive data

export const sanitizeInput = (input: string): string => {
  if (!input) return "";
  
  // Remove potential XSS vectors
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<.*?>/g, "")
    .trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Basic international phone number validation
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const maskSensitiveData = (data: string, visibleChars: number = 4): string => {
  if (!data || data.length <= visibleChars) return data;
  
  const visible = data.slice(-visibleChars);
  const masked = "*".repeat(Math.max(0, data.length - visibleChars));
  return masked + visible;
};

export const logSecurityEvent = (event: string, details?: any) => {
  console.warn(`[SECURITY] ${event}:`, details);
  
  // In production, this should send to a security monitoring service
  if (process.env.NODE_ENV === "production") {
    // Add security logging service here
  }
};

export const isValidUser = (userId?: string): boolean => {
  return !!(userId && userId.length > 0);
};