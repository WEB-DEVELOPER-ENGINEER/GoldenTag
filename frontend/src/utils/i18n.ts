/**
 * i18n utility functions for translation loading, caching, and retrieval
 */

import { Language, FALLBACK_LANGUAGE } from '../config/languages';
import { TranslationFile, TranslationCache } from '../locales/types';

/**
 * In-memory cache for loaded translations
 */
const translationCache: TranslationCache = {};

/**
 * Load translation file for a specific language
 * Implements caching to avoid repeated loads
 * 
 * @param language - Language code to load translations for
 * @returns Promise resolving to the translation file
 */
export async function loadTranslations(language: Language): Promise<TranslationFile> {
  // Return cached translations if available
  if (translationCache[language]) {
    return translationCache[language];
  }

  try {
    // Dynamic import of translation file
    const module = await import(`../locales/${language}.json`);
    const translations = module.default || module;
    
    // Cache the loaded translations
    translationCache[language] = translations;
    
    return translations;
  } catch (error) {
    console.error(`Failed to load translations for language "${language}":`, error);
    
    // If Arabic fails, try English as fallback
    if (language !== FALLBACK_LANGUAGE) {
      try {
        const fallback = await import(`../locales/${FALLBACK_LANGUAGE}.json`);
        const fallbackTranslations = fallback.default || fallback;
        translationCache[language] = fallbackTranslations;
        return fallbackTranslations;
      } catch (fallbackError) {
        console.error('Failed to load fallback translations:', fallbackError);
        return {};
      }
    }
    
    return {};
  }
}

/**
 * Get a translation value from a nested object using dot notation
 * 
 * @param obj - Translation object to search in
 * @param path - Dot-notation path to the translation key (e.g., "auth.login.title")
 * @returns The translation string or undefined if not found
 */
export function getNestedTranslation(
  obj: TranslationFile,
  path: string
): string | undefined {
  const keys = path.split('.');
  let current: any = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Get translation for a key with fallback support
 * 
 * @param key - Translation key in dot notation
 * @param language - Current language
 * @param fallbackLanguage - Fallback language if key not found
 * @returns Translated string, fallback, or the key itself
 */
export function getTranslation(
  key: string,
  language: Language,
  fallbackLanguage: Language = FALLBACK_LANGUAGE
): string {
  // Try to get translation in current language
  const currentLangTranslations = translationCache[language];
  if (currentLangTranslations) {
    const translation = getNestedTranslation(currentLangTranslations, key);
    if (translation) {
      return translation;
    }
  }

  // Fall back to fallback language
  if (language !== fallbackLanguage) {
    const fallbackTranslations = translationCache[fallbackLanguage];
    if (fallbackTranslations) {
      const fallbackTranslation = getNestedTranslation(fallbackTranslations, key);
      if (fallbackTranslation) {
        if (import.meta.env.DEV) {
          console.warn(`Translation missing for key "${key}" in language "${language}"`);
        }
        return fallbackTranslation;
      }
    }
  }

  // Last resort: return the key itself
  if (import.meta.env.DEV) {
    console.warn(`Translation missing for key "${key}" in all languages`);
  }
  return key;
}

/**
 * Interpolate parameters into a translation string
 * Replaces {{paramName}} with the corresponding value from params
 * 
 * @param text - Translation string with placeholders
 * @param params - Object with parameter values
 * @returns String with interpolated values
 */
export function interpolateParams(
  text: string,
  params?: Record<string, string | number>
): string {
  if (!params) {
    return text;
  }

  return text.replace(/\{\{(\w+)\}\}/g, (match, paramName) => {
    if (paramName in params) {
      return String(params[paramName]);
    }
    return match;
  });
}

/**
 * Clear the translation cache
 * Useful for testing or forcing a reload
 */
export function clearTranslationCache(): void {
  Object.keys(translationCache).forEach(key => {
    delete translationCache[key];
  });
}

/**
 * Get all cached translations (for testing purposes)
 */
export function getTranslationCache(): TranslationCache {
  return { ...translationCache };
}
