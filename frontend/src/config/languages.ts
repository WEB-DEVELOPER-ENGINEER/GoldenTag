/**
 * Language configuration constants for the i18n system
 * Defines supported languages with their properties including RTL/LTR settings
 */

export type Language = 'ar' | 'en';

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  flag: string;
  dateLocale: string;
}

/**
 * Configuration for all supported languages
 * Arabic is the default language, English is the fallback
 */
export const LANGUAGE_CONFIGS: Record<Language, LanguageConfig> = {
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    flag: '🇸🇦',
    dateLocale: 'ar-SA'
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    flag: '🇬🇧',
    dateLocale: 'en-US'
  }
};

/**
 * Default language for the application
 */
export const DEFAULT_LANGUAGE: Language = 'ar';

/**
 * Fallback language when translations are missing
 */
export const FALLBACK_LANGUAGE: Language = 'en';

/**
 * Local storage key for persisting language preference
 */
export const LANGUAGE_STORAGE_KEY = 'app_language';

/**
 * Available languages array for iteration
 */
export const AVAILABLE_LANGUAGES: Language[] = ['ar', 'en'];

/**
 * Type guard to check if a string is a valid language code
 */
export function isValidLanguage(lang: string): lang is Language {
  return lang === 'ar' || lang === 'en';
}
