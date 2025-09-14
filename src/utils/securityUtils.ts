// Enhanced security utilities for handling sensitive data with unified encryption

import { encryptionService, DataSensitivityLevel } from "./unifiedEncryption";

export interface SecurityAuditLog {
  timestamp: string;
  event: string;
  userId?: string;
  details?: any;
  threatLevel: "low" | "medium" | "high" | "critical";
  clientInfo?: {
    userAgent?: string;
    ip?: string;
  };
}

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
  // Enhanced international phone number validation
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateStrongPassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const maskSensitiveData = (
  data: string,
  visibleChars: number = 4
): string => {
  if (!data || data.length <= visibleChars) return data;

  const visible = data.slice(-visibleChars);
  const masked = "*".repeat(Math.max(0, data.length - visibleChars));
  return masked + visible;
};

export const detectSuspiciousActivity = (
  event: string,
  userId?: string,
  details?: any
): "low" | "medium" | "high" | "critical" => {
  // Enhanced threat detection logic
  const suspiciousPatterns = [
    /password/i,
    /token/i,
    /key/i,
    /admin/i,
    /root/i,
    /inject/i,
    /script/i,
    /eval/i
  ];

  const eventString = JSON.stringify({ event, details });
  
  if (suspiciousPatterns.some(pattern => pattern.test(eventString))) {
    return "high";
  }

  // Multiple rapid requests from same user
  if (details?.requestCount && details.requestCount > 10) {
    return "medium";
  }

  return "low";
};

export const logSecurityEvent = (
  event: string,
  details?: any,
  userId?: string
): void => {
  const threatLevel = detectSuspiciousActivity(event, userId, details);
  
  const auditLog: SecurityAuditLog = {
    timestamp: new Date().toISOString(),
    event,
    userId,
    details,
    threatLevel,
    clientInfo: {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    }
  };

  console.warn(`[SECURITY ${threatLevel.toUpperCase()}] ${event}:`, auditLog);

  // Store critical events in localStorage for offline analysis
  if (threatLevel === "high" || threatLevel === "critical") {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      existingLogs.push(auditLog);
      
      // Keep only last 100 critical events
      const trimmedLogs = existingLogs.slice(-100);
      localStorage.setItem('security_logs', JSON.stringify(trimmedLogs));
    } catch (error) {
      console.error('Failed to store security log:', error);
    }
  }

  // In production, send to security monitoring service
  if (process.env.NODE_ENV === "production") {
    // Add security logging service here
  }
};

export const isValidUser = (userId?: string): boolean => {
  return !!(userId && userId.length > 0 && userId.length === 36); // UUID length
};

export const encryptSensitiveField = async (
  field: string,
  sensitivityLevel: DataSensitivityLevel = DataSensitivityLevel.MEDIUM
): Promise<string> => {
  try {
    const container = await encryptionService.encryptData(field, {
      sensitivityLevel,
      dataType: "field"
    });
    return JSON.stringify(container);
  } catch (error) {
    logSecurityEvent("Field encryption failed", { error: error.message });
    throw new Error("Failed to encrypt sensitive field");
  }
};

export const decryptSensitiveField = async (encryptedField: string): Promise<string> => {
  try {
    const container = JSON.parse(encryptedField);
    return await encryptionService.decryptData(container, "field");
  } catch (error) {
    logSecurityEvent("Field decryption failed", { error: error.message });
    throw new Error("Failed to decrypt sensitive field");
  }
};

export const clearSecurityCache = (): void => {
  encryptionService.clearKeyCache();
  logSecurityEvent("Security cache cleared");
};

export const getSecurityLogs = (): SecurityAuditLog[] => {
  try {
    return JSON.parse(localStorage.getItem('security_logs') || '[]');
  } catch {
    return [];
  }
};

export const clearSecurityLogs = (): void => {
  localStorage.removeItem('security_logs');
  logSecurityEvent("Security logs cleared");
};
