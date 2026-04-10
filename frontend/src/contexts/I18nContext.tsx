/**
 * I18nContext and Provider for internationalization
 * Manages language state, translations, and RTL/LTR switching
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Language,
  LanguageConfig,
  LANGUAGE_CONFIGS,
  AVAILABLE_LANGUAGES,
  FALLBACK_LANGUAGE
} from '../config/languages';
import { getInitialLanguage, persistLanguage } from '../utils/languageStorage';
import { loadTranslations, getTranslation, interpolateParams } from '../utils/i18n';

/**
 * Context value interface
 */
interface I18nContextValue {
  // Current active language
  language: Language;
  
  // Available languages
  availableLanguages: Language[];
  
  // Change language function
  changeLanguage: (lang: Language) => void;
  
  // Translation function
  t: (key: string, params?: Record<string, string | number>) => string;
  
  // Check if current language is RTL
  isRTL: boolean;
  
  // Current language configuration
  languageConfig: LanguageConfig;
  
  // Format utilities
  formatDate: (date: Date, format?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number, currency?: string) => string;
}

/**
 * Provider props
 */
interface I18nProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
}

/**
 * Create the context
 */
const I18nContext = createContext<I18nContextValue | undefined>(undefined);

/**
 * Announce language change to screen readers
 */
function announceLanguageChange(languageName: string) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = `Language changed to ${languageName}`;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * I18nProvider component
 * Manages language state, loads translations, and provides i18n utilities
 */
export function I18nProvider({ children, defaultLanguage }: I18nProviderProps) {
  // Initialize language from storage or use default
  const [language, setLanguage] = useState<Language>(() => {
    return defaultLanguage || getInitialLanguage();
  });
  
  const [translationsLoaded, setTranslationsLoaded] = useState(false);

  /**
   * Update document direction and language attributes based on language
   */
  const updateDocumentDirection = useCallback((lang: Language) => {
    const direction = LANGUAGE_CONFIGS[lang].direction;
    const languageName = LANGUAGE_CONFIGS[lang].name;
    
    // Set direction attribute for RTL/LTR layout
    document.documentElement.setAttribute('dir', direction);
    
    // Set lang attribute for accessibility and SEO
    document.documentElement.setAttribute('lang', lang);
    
    // Announce language change to screen readers
    announceLanguageChange(languageName);
  }, []);

  /**
   * Load translations for the current language
   */
  useEffect(() => {
    let isMounted = true;

    async function loadLanguageTranslations() {
      try {
        // Load translations for current language
        await loadTranslations(language);
        
        // Also preload fallback language if different
        if (language !== FALLBACK_LANGUAGE) {
          await loadTranslations(FALLBACK_LANGUAGE);
        }
        
        if (isMounted) {
          setTranslationsLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load translations:', error);
        if (isMounted) {
          setTranslationsLoaded(true); // Continue even if loading fails
        }
      }
    }

    loadLanguageTranslations();

    return () => {
      isMounted = false;
    };
  }, [language]);

  /**
   * Update document direction when language changes
   */
  useEffect(() => {
    updateDocumentDirection(language);
  }, [language, updateDocumentDirection]);

  /**
   * Change language handler
   */
  const changeLanguage = useCallback((newLanguage: Language) => {
    if (newLanguage === language) {
      return; // No change needed
    }

    // Update state
    setLanguage(newLanguage);
    
    // Persist to local storage
    persistLanguage(newLanguage);
    
    // Update document direction and announce change
    updateDocumentDirection(newLanguage);
  }, [language, updateDocumentDirection]);

  /**
   * Translation function with parameter interpolation
   */
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const translation = getTranslation(key, language, FALLBACK_LANGUAGE);
    return interpolateParams(translation, params);
  }, [language]);

  /**
   * Format date according to current locale
   */
  const formatDate = useCallback((date: Date, options?: Intl.DateTimeFormatOptions): string => {
    const locale = LANGUAGE_CONFIGS[language].dateLocale;
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    try {
      return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
    } catch (error) {
      console.error('Date formatting error:', error);
      return date.toLocaleDateString();
    }
  }, [language]);

  /**
   * Format number according to current locale
   */
  const formatNumber = useCallback((num: number): string => {
    const locale = LANGUAGE_CONFIGS[language].dateLocale;
    
    try {
      return new Intl.NumberFormat(locale).format(num);
    } catch (error) {
      console.error('Number formatting error:', error);
      return num.toString();
    }
  }, [language]);

  /**
   * Format currency according to current locale
   */
  const formatCurrency = useCallback((amount: number, currency: string = 'USD'): string => {
    const locale = LANGUAGE_CONFIGS[language].dateLocale;
    
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (error) {
      console.error('Currency formatting error:', error);
      return `${currency} ${amount}`;
    }
  }, [language]);

  /**
   * Get current language configuration
   */
  const languageConfig = useMemo(() => LANGUAGE_CONFIGS[language], [language]);

  /**
   * Check if current language is RTL
   */
  const isRTL = useMemo(() => languageConfig.direction === 'rtl', [languageConfig]);

  /**
   * Context value
   */
  const contextValue: I18nContextValue = useMemo(() => ({
    language,
    availableLanguages: AVAILABLE_LANGUAGES,
    changeLanguage,
    t,
    isRTL,
    languageConfig,
    formatDate,
    formatNumber,
    formatCurrency
  }), [language, changeLanguage, t, isRTL, languageConfig, formatDate, formatNumber, formatCurrency]);

  // Don't render children until translations are loaded
  if (!translationsLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Custom hook to access I18n context
 * Throws an error if used outside of I18nProvider
 */
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  
  return context;
}

/**
 * Export context for testing purposes
 */
export { I18nContext };
