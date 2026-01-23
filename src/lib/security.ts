import { z } from 'zod';

/**
 * Security utility functions for input validation and sanitization
 */

// Common validation schemas
export const emailSchema = z
  .string()
  .trim()
  .email({ message: 'Email inválido' })
  .max(255, { message: 'Email muito longo' });

export const passwordSchema = z
  .string()
  .min(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  .max(128, { message: 'Senha muito longa' })
  .regex(/[A-Z]/, { message: 'Senha deve conter pelo menos uma letra maiúscula' })
  .regex(/[a-z]/, { message: 'Senha deve conter pelo menos uma letra minúscula' })
  .regex(/[0-9]/, { message: 'Senha deve conter pelo menos um número' });

export const nameSchema = z
  .string()
  .trim()
  .min(2, { message: 'Nome muito curto' })
  .max(100, { message: 'Nome muito longo' })
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: 'Nome contém caracteres inválidos' });

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[\d\s\-\(\)\+]+$/, { message: 'Telefone inválido' })
  .min(10, { message: 'Telefone muito curto' })
  .max(20, { message: 'Telefone muito longo' });

export const textInputSchema = z
  .string()
  .trim()
  .max(1000, { message: 'Texto muito longo' });

export const urlSchema = z
  .string()
  .trim()
  .url({ message: 'URL inválida' })
  .max(2048, { message: 'URL muito longa' });

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes all HTML tags and potentially dangerous content
 */
export const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  
  return input
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove style tags and their content
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove all HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove data: protocol for potential XSS
    .replace(/data:/gi, '')
    // Remove on* event handlers
    .replace(/\bon\w+\s*=/gi, '')
    // Decode HTML entities to prevent double encoding attacks
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    // Re-encode to safe entities
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
};

/**
 * Sanitize input for SQL-like injection prevention
 * Note: Always use parameterized queries, this is an additional layer
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\0/g, '')
    .trim();
};

/**
 * Validate and sanitize URL parameters
 */
export const sanitizeUrlParam = (param: string): string => {
  if (!param) return '';
  
  return encodeURIComponent(
    param
      .replace(/[<>'"]/g, '')
      .trim()
  );
};

/**
 * Check for common attack patterns in input
 */
export const detectMaliciousInput = (input: string): boolean => {
  if (!input) return false;
  
  const patterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /vbscript:/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /document\./i,
    /window\./i,
    /eval\(/i,
    /setTimeout\(/i,
    /setInterval\(/i,
    /new\s+Function/i,
  ];
  
  return patterns.some(pattern => pattern.test(input));
};

/**
 * Rate limiting helper for client-side
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isRateLimited(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Filter out old attempts
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return true;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return false;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Generate a secure random token
 */
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Hash sensitive data for comparison (client-side, not for passwords)
 */
export const hashData = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
};

export default {
  emailSchema,
  passwordSchema,
  nameSchema,
  phoneSchema,
  textInputSchema,
  urlSchema,
  sanitizeHtml,
  sanitizeInput,
  sanitizeUrlParam,
  detectMaliciousInput,
  RateLimiter,
  generateSecureToken,
  hashData,
};
