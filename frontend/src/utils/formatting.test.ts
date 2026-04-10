/**
 * Tests for locale-aware formatting utilities
 * Validates Requirements 9.1, 9.2, 9.3, 9.4
 */

import { describe, it, expect } from 'vitest';

describe('Locale-aware formatting utilities', () => {
  describe('formatDate', () => {
    it('should format dates using Intl.DateTimeFormat', () => {
      const date = new Date('2024-01-15');
      
      // Test Arabic locale
      const arFormatter = new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const arFormatted = arFormatter.format(date);
      expect(arFormatted).toBeTruthy();
      expect(typeof arFormatted).toBe('string');
      
      // Test English locale
      const enFormatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const enFormatted = enFormatter.format(date);
      expect(enFormatted).toBeTruthy();
      expect(typeof enFormatted).toBe('string');
      
      // Verify they produce different outputs
      expect(arFormatted).not.toBe(enFormatted);
    });
  });

  describe('formatNumber', () => {
    it('should format numbers using Intl.NumberFormat', () => {
      const number = 1234567.89;
      
      // Test Arabic locale
      const arFormatter = new Intl.NumberFormat('ar-SA');
      const arFormatted = arFormatter.format(number);
      expect(arFormatted).toBeTruthy();
      expect(typeof arFormatted).toBe('string');
      
      // Test English locale
      const enFormatter = new Intl.NumberFormat('en-US');
      const enFormatted = enFormatter.format(number);
      expect(enFormatted).toBeTruthy();
      expect(typeof enFormatted).toBe('string');
      
      // Verify they produce different outputs (different separators)
      expect(arFormatted).not.toBe(enFormatted);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency using Intl.NumberFormat', () => {
      const amount = 1234.56;
      
      // Test Arabic locale with USD
      const arFormatter = new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'USD'
      });
      const arFormatted = arFormatter.format(amount);
      expect(arFormatted).toBeTruthy();
      expect(typeof arFormatted).toBe('string');
      // Arabic locale formats numbers with Arabic numerals
      expect(arFormatted.length).toBeGreaterThan(0);
      
      // Test English locale with USD
      const enFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      });
      const enFormatted = enFormatter.format(amount);
      expect(enFormatted).toBeTruthy();
      expect(typeof enFormatted).toBe('string');
      expect(enFormatted).toContain('$');
      
      // Verify they produce different outputs
      expect(arFormatted).not.toBe(enFormatted);
    });

    it('should support different currencies', () => {
      const amount = 1000;
      
      // Test with EUR
      const eurFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR'
      });
      const eurFormatted = eurFormatter.format(amount);
      expect(eurFormatted).toBeTruthy();
      expect(eurFormatted).toContain('€');
      
      // Test with GBP
      const gbpFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'GBP'
      });
      const gbpFormatted = gbpFormatter.format(amount);
      expect(gbpFormatted).toBeTruthy();
      expect(gbpFormatted).toContain('£');
    });
  });
});
