/**
 * Unit tests for LanguageSelector component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LanguageSelector } from './LanguageSelector';
import { I18nProvider } from '../contexts/I18nContext';

// Mock the language storage utilities
vi.mock('../utils/languageStorage', () => ({
  getInitialLanguage: vi.fn(() => 'ar'),
  persistLanguage: vi.fn(() => true),
  retrieveLanguage: vi.fn(() => null)
}));

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.removeAttribute('dir');
    document.documentElement.removeAttribute('lang');
  });

  it('should render dropdown variant by default', async () => {
    render(
      <I18nProvider>
        <LanguageSelector />
      </I18nProvider>
    );

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /select language/i });
      expect(button).toBeDefined();
    });
  });

  it('should display current language with flag and native name', async () => {
    render(
      <I18nProvider>
        <LanguageSelector />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('العربية')).toBeDefined();
      expect(screen.getByText('🇸🇦')).toBeDefined();
    });
  });

  it('should open dropdown when clicked', async () => {
    render(
      <I18nProvider>
        <LanguageSelector />
      </I18nProvider>
    );

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeDefined();
    });
  });

  it('should render toggle variant', async () => {
    render(
      <I18nProvider>
        <LanguageSelector variant="toggle" />
      </I18nProvider>
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(2); // One for each language
    });
  });

  it('should render buttons variant', async () => {
    render(
      <I18nProvider>
        <LanguageSelector variant="buttons" />
      </I18nProvider>
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(2); // One for each language
    });
  });

  it('should have minimum touch target size', async () => {
    render(
      <I18nProvider>
        <LanguageSelector />
      </I18nProvider>
    );

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /select language/i });
      // The touch-target class ensures min-h-[44px] and min-w-[44px]
      expect(button.classList.contains('touch-target')).toBe(true);
    });
  });

  it('should support keyboard navigation', async () => {
    render(
      <I18nProvider>
        <LanguageSelector />
      </I18nProvider>
    );

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /select language/i });
      
      // Press Enter to open
      fireEvent.keyDown(button, { key: 'Enter' });
    });

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeDefined();
    });
  });

  it('should close dropdown on Escape key', async () => {
    render(
      <I18nProvider>
        <LanguageSelector />
      </I18nProvider>
    );

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeDefined();
    });

    const button = screen.getByRole('button', { name: /select language/i });
    fireEvent.keyDown(button, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
  });

  it('should hide flags when showFlags is false', async () => {
    render(
      <I18nProvider>
        <LanguageSelector showFlags={false} />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('🇸🇦')).toBeNull();
    });
  });

  it('should hide labels when showLabels is false', async () => {
    render(
      <I18nProvider>
        <LanguageSelector showLabels={false} />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('العربية')).toBeNull();
    });
  });
});
