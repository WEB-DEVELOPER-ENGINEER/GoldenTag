/**
 * Tests for useTranslation hook
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTranslation } from './useTranslation';
import { I18nProvider } from '../contexts/I18nContext';
import React from 'react';

// Wrapper component for testing
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <I18nProvider defaultLanguage="en">{children}</I18nProvider>
);

describe('useTranslation', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should return translation function', async () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    
    expect(result.current.t).toBeDefined();
    expect(typeof result.current.t).toBe('function');
  });

  it('should return current language', async () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    
    expect(result.current.language).toBeDefined();
    expect(['ar', 'en']).toContain(result.current.language);
  });

  it('should return isRTL flag', async () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    
    expect(result.current.isRTL).toBeDefined();
    expect(typeof result.current.isRTL).toBe('boolean');
  });

  it('should return changeLanguage function', async () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    
    expect(result.current.changeLanguage).toBeDefined();
    expect(typeof result.current.changeLanguage).toBe('function');
  });

  it('should have isRTL false for English', async () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    
    expect(result.current.language).toBe('en');
    expect(result.current.isRTL).toBe(false);
  });

  it('should change language when changeLanguage is called', async () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    
    // Initial language should be English
    expect(result.current.language).toBe('en');
    expect(result.current.isRTL).toBe(false);
    
    // Change to Arabic
    await act(async () => {
      result.current.changeLanguage('ar');
    });
    
    await waitFor(() => {
      expect(result.current.language).toBe('ar');
    });
    
    // Language should now be Arabic
    expect(result.current.isRTL).toBe(true);
  });

  it('should trigger re-render when language changes', async () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    
    const initialLanguage = result.current.language;
    const newLanguage = initialLanguage === 'en' ? 'ar' : 'en';
    
    // Change language
    await act(async () => {
      result.current.changeLanguage(newLanguage);
    });
    
    // Hook should have re-rendered with new language
    await waitFor(() => {
      expect(result.current.language).toBe(newLanguage);
    });
  });

  it('should translate keys using t function', async () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    
    // Test translation (will use actual translation files)
    const translation = result.current.t('common.app_name');
    
    expect(translation).toBeDefined();
    expect(typeof translation).toBe('string');
    expect(translation.length).toBeGreaterThan(0);
  });

  it('should throw error when used outside I18nProvider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};
    
    expect(() => {
      renderHook(() => useTranslation());
    }).toThrow('useI18n must be used within an I18nProvider');
    
    // Restore console.error
    console.error = originalError;
  });
});
