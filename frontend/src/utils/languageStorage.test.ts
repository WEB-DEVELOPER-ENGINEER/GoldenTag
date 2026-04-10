/**
 * Unit tests for language storage utilities
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  persistLanguage,
  retrieveLanguage,
  getInitialLanguage,
  clearStoredLanguage
} from './languageStorage';
import { LANGUAGE_STORAGE_KEY } from '../config/languages';

describe('languageStorage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('persistLanguage', () => {
    it('should persist Arabic language to localStorage', () => {
      const result = persistLanguage('ar');
      expect(result).toBe(true);
      expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('ar');
    });

    it('should persist English language to localStorage', () => {
      const result = persistLanguage('en');
      expect(result).toBe(true);
      expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    });

    it('should overwrite existing language preference', () => {
      persistLanguage('ar');
      persistLanguage('en');
      expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    });
  });

  describe('retrieveLanguage', () => {
    it('should retrieve stored Arabic language', () => {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, 'ar');
      const result = retrieveLanguage();
      expect(result).toBe('ar');
    });

    it('should retrieve stored English language', () => {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
      const result = retrieveLanguage();
      expect(result).toBe('en');
    });

    it('should return null when no language is stored', () => {
      const result = retrieveLanguage();
      expect(result).toBeNull();
    });

    it('should return null for invalid language codes', () => {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, 'invalid');
      const result = retrieveLanguage();
      expect(result).toBeNull();
    });
  });

  describe('getInitialLanguage', () => {
    it('should return stored language if available', () => {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
      const result = getInitialLanguage();
      expect(result).toBe('en');
    });

    it('should return default language (ar) when no preference stored', () => {
      const result = getInitialLanguage();
      expect(result).toBe('ar');
    });
  });

  describe('clearStoredLanguage', () => {
    it('should remove stored language preference', () => {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
      const result = clearStoredLanguage();
      expect(result).toBe(true);
      expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull();
    });

    it('should return true even when no preference exists', () => {
      const result = clearStoredLanguage();
      expect(result).toBe(true);
    });
  });
});
