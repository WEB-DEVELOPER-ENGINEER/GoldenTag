/**
 * useTranslation hook
 * Provides translation function and language state to components
 * 
 * This hook accesses the I18nContext and returns a focused API
 * for components that need translation capabilities.
 */

import { useI18n } from '../contexts/I18nContext';
import { Language } from '../config/languages';

/**
 * Return type for useTranslation hook
 */
export interface UseTranslationReturn {
  // Translation function
  t: (key: string, params?: Record<string, string | number>) => string;
  
  // Current active language
  language: Language;
  
  // Check if current language is RTL
  isRTL: boolean;
  
  // Change language function
  changeLanguage: (lang: Language) => void;
}

/**
 * Custom hook to access translation functionality
 * 
 * This hook provides a simplified interface to the i18n system,
 * focusing on the most commonly needed features: translation function,
 * current language, and RTL flag.
 * 
 * The hook automatically triggers component re-renders when the language
 * changes, ensuring that all translated text updates immediately.
 * 
 * @returns {UseTranslationReturn} Translation utilities
 * @throws {Error} If used outside of I18nProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t, language, isRTL } = useTranslation();
 *   
 *   return (
 *     <div className={isRTL ? 'text-right' : 'text-left'}>
 *       <h1>{t('common.welcome')}</h1>
 *       <p>{t('common.greeting', { name: 'User' })}</p>
 *       <p>Current language: {language}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTranslation(): UseTranslationReturn {
  // Access the I18nContext
  const { t, language, isRTL, changeLanguage } = useI18n();
  
  // Return focused API
  return {
    t,
    language,
    isRTL,
    changeLanguage
  };
}
