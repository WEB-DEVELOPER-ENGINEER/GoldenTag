/**
 * Local storage utilities for persisting language preferences
 */

import { Language, LANGUAGE_STORAGE_KEY, isValidLanguage, DEFAULT_LANGUAGE } from '../config/languages';

/**
 * Persist the selected language to local storage
 * Handles cases where local storage is unavailable or full
 * 
 * @param language - Language code to persist
 * @returns true if successful, false otherwise
 */
export function persistLanguage(language: Language): boolean {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    return true;
  } catch (error) {
    // Local storage might be full, disabled, or unavailable
    console.warn('Failed to persist language preference:', error);
    return false;
  }
}

/**
 * Retrieve the stored language preference from local storage
 * Returns null if no preference is stored or if retrieval fails
 * 
 * @returns Stored language code or null
 */
export function retrieveLanguage(): Language | null {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    
    // Validate that the stored value is a valid language code
    if (stored && isValidLanguage(stored)) {
      return stored;
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to retrieve language preference:', error);
    return null;
  }
}

/**
 * Get the initial language for the application
 * Priority: stored preference > default language
 * 
 * @returns Language code to use on initialization
 */
export function getInitialLanguage(): Language {
  const stored = retrieveLanguage();
  return stored || DEFAULT_LANGUAGE;
}

/**
 * Clear the stored language preference
 * Useful for testing or resetting to default
 * 
 * @returns true if successful, false otherwise
 */
export function clearStoredLanguage(): boolean {
  try {
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    return true;
  } catch (error) {
    console.warn('Failed to clear language preference:', error);
    return false;
  }
}
