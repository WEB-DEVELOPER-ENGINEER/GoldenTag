/**
 * Type definitions for translation files
 */

/**
 * Translation file structure supporting nested keys
 */
export interface TranslationFile {
  [namespace: string]: string | TranslationFile;
}

/**
 * Cache for loaded translations
 */
export interface TranslationCache {
  [language: string]: TranslationFile;
}
