/**
 * Unit tests for i18n utilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadTranslations,
  getNestedTranslation,
  getTranslation,
  interpolateParams,
  clearTranslationCache
} from './i18n';
import { TranslationFile } from '../locales/types';

describe('i18n utilities', () => {
  beforeEach(() => {
    clearTranslationCache();
  });

  describe('loadTranslations', () => {
    it('should load Arabic translations', async () => {
      const translations = await loadTranslations('ar');
      expect(translations).toBeDefined();
      expect(translations.common).toBeDefined();
    });

    it('should load English translations', async () => {
      const translations = await loadTranslations('en');
      expect(translations).toBeDefined();
      expect(translations.common).toBeDefined();
    });

    it('should cache loaded translations', async () => {
      const first = await loadTranslations('ar');
      const second = await loadTranslations('ar');
      expect(first).toBe(second);
    });
  });

  describe('getNestedTranslation', () => {
    it('should retrieve nested translation values', () => {
      const translations: TranslationFile = {
        common: {
          app_name: 'Test App',
          loading: 'Loading...'
        }
      };

      expect(getNestedTranslation(translations, 'common.app_name')).toBe('Test App');
      expect(getNestedTranslation(translations, 'common.loading')).toBe('Loading...');
    });

    it('should return undefined for missing keys', () => {
      const translations: TranslationFile = {
        common: {
          app_name: 'Test App'
        }
      };

      expect(getNestedTranslation(translations, 'common.missing')).toBeUndefined();
      expect(getNestedTranslation(translations, 'missing.key')).toBeUndefined();
    });

    it('should handle deeply nested keys', () => {
      const translations: TranslationFile = {
        auth: {
          login: {
            title: 'Sign In',
            button: 'Login'
          }
        }
      };

      expect(getNestedTranslation(translations, 'auth.login.title')).toBe('Sign In');
      expect(getNestedTranslation(translations, 'auth.login.button')).toBe('Login');
    });
  });

  describe('interpolateParams', () => {
    it('should interpolate single parameter', () => {
      const text = 'Hello, {{name}}!';
      const result = interpolateParams(text, { name: 'John' });
      expect(result).toBe('Hello, John!');
    });

    it('should interpolate multiple parameters', () => {
      const text = 'Welcome, {{username}}! You have {{count}} messages.';
      const result = interpolateParams(text, { username: 'Alice', count: 5 });
      expect(result).toBe('Welcome, Alice! You have 5 messages.');
    });

    it('should handle missing parameters', () => {
      const text = 'Hello, {{name}}!';
      const result = interpolateParams(text, {});
      expect(result).toBe('Hello, {{name}}!');
    });

    it('should return original text when no params provided', () => {
      const text = 'Hello, {{name}}!';
      const result = interpolateParams(text);
      expect(result).toBe('Hello, {{name}}!');
    });

    it('should handle numeric parameters', () => {
      const text = 'You have {{count}} items';
      const result = interpolateParams(text, { count: 42 });
      expect(result).toBe('You have 42 items');
    });
  });

  describe('getTranslation', () => {
    it('should return the key itself when translation not found', () => {
      const result = getTranslation('missing.key', 'ar');
      expect(result).toBe('missing.key');
    });
  });
});
