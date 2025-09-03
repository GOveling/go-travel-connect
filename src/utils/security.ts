/**
 * Security utilities for input sanitization and XSS prevention
 */

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Removes script tags and dangerous attributes
 */
export const sanitizeHtml = (html: string): string => {
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Remove all script tags
  const scripts = tempDiv.querySelectorAll('script');
  scripts.forEach(script => script.remove());
  
  // Remove dangerous attributes
  const dangerousAttributes = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'];
  const allElements = tempDiv.querySelectorAll('*');
  
  allElements.forEach(element => {
    dangerousAttributes.forEach(attr => {
      if (element.hasAttribute(attr)) {
        element.removeAttribute(attr);
      }
    });
    
    // Remove javascript: URLs
    ['href', 'src', 'action'].forEach(attr => {
      const value = element.getAttribute(attr);
      if (value && value.toLowerCase().startsWith('javascript:')) {
        element.removeAttribute(attr);
      }
    });
  });
  
  return tempDiv.innerHTML;
};

/**
 * Escapes HTML special characters to prevent XSS
 */
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (s) => map[s]);
};

/**
 * Validates and sanitizes user input for reviews and comments
 */
export const sanitizeUserInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove potential XSS attempts
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .replace(/on\w+='[^']*'/gi, ''); // Remove event handlers with single quotes
  
  // Limit length to prevent DoS
  const maxLength = 2000;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized.trim();
};

/**
 * Validates URL to ensure it's safe
 */
export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Creates a safe DOM element with text content (prevents innerHTML XSS)
 */
export const createSafeElement = (tagName: string, textContent: string, className?: string): HTMLElement => {
  const element = document.createElement(tagName);
  element.textContent = textContent; // Safe - no HTML parsing
  if (className) {
    element.className = className;
  }
  return element;
};