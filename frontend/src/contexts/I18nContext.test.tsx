/**
 * Unit tests for I18nContext and Provider
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { I18nProvider, useI18n } from './I18nContext';
import * as languageStorage from '../utils/languageStorage';

// Mock the language storage utilities
vi.mock('../utils/languageStorage', () => ({
  getInitialLanguage: vi.fn(() => 'ar'),
  persistLanguage: vi.fn(() => true),
  retrieveLanguage: vi.fn(() => null)
}));

// Test component that uses the i18n context
function TestComponent() {
  const { language, t, isRTL, changeLanguage, formatDate, formatNumber, formatCurrency } = useI18n();
  
  return (
    <div>
      <div data-testid="language">{language}</div>
      <div data-testid="isRTL">{isRTL ? 'true' : 'false'}</div>
      <div data-testid="translation">{t('common.app_name')}</div>
      <button onClick={() => changeLanguage('en')}>Change to English</button>
      <div data-testid="formatted-date">{formatDate(new Date('2024-01-15'))}</div>
      <div data-testid="formatted-number">{formatNumber(1234.56)}</div>
      <div data-testid="formatted-currency">{formatCurrency(99.99, 'USD')}</div>
    </div>
  );
}

describe('I18nContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset document attributes
    document.documentElement.removeAttribute('dir');
    document.documentElement.removeAttribute('lang');
  });

  it('should initialize with default language', async () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('language').textContent).toBe('ar');
    });
  });

  it('should set RTL for Arabic language', async () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('isRTL').textContent).toBe('true');
    });
  });

  it('should update document direction attribute', async () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
      expect(document.documentElement.getAttribute('lang')).toBe('ar');
    });
  });

  it('should change language when changeLanguage is called', async () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('language').textContent).toBe('ar');
    });

    const button = screen.getByText('Change to English');
    
    await act(async () => {
      button.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('language').textContent).toBe('en');
      expect(screen.getByTestId('isRTL').textContent).toBe('false');
    });
  });

  it('should update document direction when language changes', async () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    });

    const button = screen.getByText('Change to English');
    
    await act(async () => {
      button.click();
    });

    await waitFor(() => {
      expect(document.documentElement.getAttribute('dir')).toBe('ltr');
      expect(document.documentElement.getAttribute('lang')).toBe('en');
    });
  });

  it('should persist language when changed', async () => {
    const persistLanguageMock = vi.mocked(languageStorage.persistLanguage);
    
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('language').textContent).toBe('ar');
    });

    const button = screen.getByText('Change to English');
    
    await act(async () => {
      button.click();
    });

    await waitFor(() => {
      expect(persistLanguageMock).toHaveBeenCalledWith('en');
    });
  });

  it('should provide translation function', async () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      const translation = screen.getByTestId('translation');
      expect(translation).toBeDefined();
    });
  });

  it('should provide formatting utilities', async () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('formatted-date')).toBeDefined();
      expect(screen.getByTestId('formatted-number')).toBeDefined();
      expect(screen.getByTestId('formatted-currency')).toBeDefined();
    });
  });

  it('should throw error when useI18n is used outside provider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useI18n must be used within an I18nProvider');
    
    consoleError.mockRestore();
  });

  it('should accept defaultLanguage prop', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <TestComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('language').textContent).toBe('en');
      expect(screen.getByTestId('isRTL').textContent).toBe('false');
    });
  });
});
