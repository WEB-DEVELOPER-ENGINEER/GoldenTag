# Design Document: Internationalization (i18n) System

## Overview

This design document outlines the architecture and implementation strategy for a comprehensive internationalization (i18n) system for the Digital Profile Hub application. The system will support Arabic (default) and English languages with full RTL/LTR layout support, persistent language preferences, and dynamic language switching without page reloads.

The i18n system will be built using React Context API for state management, custom hooks for component integration, and a structured JSON-based translation file system. The architecture prioritizes maintainability, scalability, and developer experience.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Components  │  │    Pages     │  │   Layouts    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  useTranslation │                        │
│                    │      Hook       │                        │
│                    └───────┬────────┘                        │
│                            │                                 │
├────────────────────────────┼─────────────────────────────────┤
│                    ┌───────▼────────┐                        │
│                    │  I18nContext   │                        │
│                    │   & Provider   │                        │
│                    └───────┬────────┘                        │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐             │
│         │                  │                  │             │
│  ┌──────▼──────┐  ┌────────▼────────┐  ┌─────▼──────┐     │
│  │ Translation │  │  Language       │  │    RTL     │     │
│  │   Manager   │  │  Persistence    │  │  Manager   │     │
│  └──────┬──────┘  └────────┬────────┘  └─────┬──────┘     │
│         │                  │                  │             │
├─────────┼──────────────────┼──────────────────┼─────────────┤
│  ┌──────▼──────┐  ┌────────▼────────┐  ┌─────▼──────┐     │
│  │ Translation │  │  Local Storage  │  │    DOM     │     │
│  │    Files    │  │                 │  │ Attributes │     │
│  │  (ar.json)  │  │  (lang pref)    │  │  (dir)     │     │
│  │  (en.json)  │  │                 │  │            │     │
│  └─────────────┘  └─────────────────┘  └────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Core Components

1. **I18nContext & Provider**: Central state management for language, translations, and RTL/LTR mode
2. **Translation Manager**: Handles loading, caching, and retrieval of translations
3. **Language Persistence**: Manages storing and retrieving language preferences from local storage
4. **RTL Manager**: Controls document direction and layout mirroring
5. **useTranslation Hook**: Custom React hook for accessing translations in components
6. **LanguageSelector Component**: UI component for language switching

## Components and Interfaces

### 1. I18nContext Interface

```typescript
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
  
  // Format utilities
  formatDate: (date: Date, format?: string) => string;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number, currency?: string) => string;
}

type Language = 'ar' | 'en';
```

### 2. Translation File Structure

```typescript
// Translation file type definition
interface TranslationFile {
  [namespace: string]: {
    [key: string]: string | TranslationFile;
  };
}

// Example structure:
{
  "common": {
    "app_name": "Profile Hub",
    "loading": "Loading...",
    "error": "An error occurred",
    "save": "Save",
    "cancel": "Cancel"
  },
  "auth": {
    "login": {
      "title": "Sign In",
      "email_label": "Email Address",
      "password_label": "Password",
      "submit_button": "Sign In",
      "forgot_password": "Forgot Password?",
      "no_account": "Don't have an account?",
      "register_link": "Create Account"
    },
    "register": {
      "title": "Create Account",
      "username_label": "Username",
      "email_label": "Email Address",
      "password_label": "Password",
      "submit_button": "Create Account",
      "have_account": "Already have an account?",
      "login_link": "Sign In"
    }
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome, {{username}}",
    "tabs": {
      "profile": "Profile",
      "links": "Links",
      "theme": "Theme",
      "qrcode": "QR Code"
    }
  },
  "profile": {
    "edit_title": "Edit Profile",
    "display_name": "Display Name",
    "bio": "Bio",
    "avatar": "Profile Picture",
    "background": "Background Image",
    "save_button": "Save Changes"
  }
}
```

### 3. I18nProvider Component

```typescript
interface I18nProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
}

// The provider will:
// - Initialize with stored or default language
// - Load translation files
// - Manage language state
// - Provide translation functions
// - Handle RTL/LTR switching
```

### 4. LanguageSelector Component

```typescript
interface LanguageSelectorProps {
  variant?: 'dropdown' | 'toggle' | 'buttons';
  className?: string;
  showFlags?: boolean;
  showLabels?: boolean;
}

// The component will:
// - Display available languages
// - Handle language switching
// - Show current language
// - Be responsive for mobile
// - Support different visual variants
```

## Data Models

### Language Configuration

```typescript
interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  flag: string; // emoji or icon identifier
  dateLocale: string; // for date-fns or Intl
}

const LANGUAGE_CONFIGS: Record<Language, LanguageConfig> = {
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
```

### Translation Storage

```typescript
interface TranslationCache {
  [language: string]: TranslationFile;
}

// Translations will be stored in:
// - frontend/src/locales/ar.json
// - frontend/src/locales/en.json
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After reviewing all testable properties from the prework, I've identified the following consolidations to eliminate redundancy:

- Properties 1.2 and 8.2 are identical (translation key returns correct language text) - will keep only one
- Properties related to CSS/visual layout (7.2-7.5) are handled by the browser and CSS, not the i18n system itself
- Performance requirements (2.4) are not correctness properties
- Documentation requirements (10.1-10.4) are not testable properties

The remaining properties provide unique validation value and will be included below.

### Correctness Properties

Property 1: Language selection updates translations
*For any* valid translation key, when the language is changed, the translation function should return the text in the newly selected language
**Validates: Requirements 1.2, 5.3**

Property 2: State preservation during language switch
*For any* application state (form data, navigation position, component state), changing the language should preserve that state unchanged
**Validates: Requirements 2.2**

Property 3: Document direction matches language
*For any* language with a defined direction (RTL or LTR), when that language is selected, the document direction attribute should match the language's direction
**Validates: Requirements 2.3**

Property 4: Language persistence round-trip
*For any* supported language, when selected and persisted to local storage, retrieving from local storage should return the same language
**Validates: Requirements 3.1, 3.2**

Property 5: Translation key format consistency
*For all* translation keys in the translation files, they should follow the namespaced dot notation pattern (e.g., "namespace.key" or "namespace.subnamespace.key")
**Validates: Requirements 5.2**

Property 6: Fallback to English for missing keys
*For any* translation key that exists in English but not in the active language, the translation function should return the English translation
**Validates: Requirements 5.4**

Property 7: Translation key consistency across languages
*For any* translation key that exists in one language file, the same key structure should exist in all other language files
**Validates: Requirements 6.3**

Property 8: Parameter interpolation in translations
*For any* translation string containing placeholders (e.g., "{{username}}") and any set of parameters, the translation function should correctly substitute all placeholders with the provided values
**Validates: Requirements 8.3**

Property 9: Component re-render on language change
*For any* component using the translation hook, when the language changes, that component should re-render to display the new translations
**Validates: Requirements 8.4**

Property 10: Date formatting matches locale
*For any* date value and supported language, the formatted date should use the locale conventions of that language (e.g., DD/MM/YYYY vs MM/DD/YYYY)
**Validates: Requirements 9.1**

Property 11: Number formatting matches locale
*For any* number value and supported language, the formatted number should use the correct decimal and thousand separators for that language's locale
**Validates: Requirements 9.2**

Property 12: Currency formatting matches locale
*For any* currency value and supported language, the formatted currency should follow the locale conventions for that language
**Validates: Requirements 9.3**

## Error Handling

### Translation Key Not Found

```typescript
// When a translation key doesn't exist:
// 1. Log a warning in development mode
// 2. Fall back to English translation if available
// 3. Return the key itself as last resort
// 4. Never throw an error (fail gracefully)

function getTranslation(key: string, language: Language): string {
  const translation = translations[language]?.[key];
  
  if (translation) {
    return translation;
  }
  
  // Fallback to English
  if (language !== 'en' && translations.en?.[key]) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Translation missing for key "${key}" in language "${language}"`);
    }
    return translations.en[key];
  }
  
  // Last resort: return the key itself
  if (process.env.NODE_ENV === 'development') {
    console.warn(`Translation missing for key "${key}" in all languages`);
  }
  return key;
}
```

### Local Storage Errors

```typescript
// Handle cases where local storage is unavailable or full
function persistLanguage(language: Language): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    // Local storage might be full or disabled
    console.warn('Failed to persist language preference:', error);
    // Continue without persistence - use in-memory state only
  }
}

function retrieveLanguage(): Language | null {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
  } catch (error) {
    console.warn('Failed to retrieve language preference:', error);
    return null;
  }
}
```

### Translation File Loading Errors

```typescript
// Handle cases where translation files fail to load
async function loadTranslations(language: Language): Promise<TranslationFile> {
  try {
    const module = await import(`./locales/${language}.json`);
    return module.default;
  } catch (error) {
    console.error(`Failed to load translations for language "${language}":`, error);
    
    // If Arabic fails, try English as fallback
    if (language === 'ar') {
      try {
        const fallback = await import('./locales/en.json');
        return fallback.default;
      } catch (fallbackError) {
        console.error('Failed to load fallback translations:', fallbackError);
        return {}; // Return empty object as last resort
      }
    }
    
    return {};
  }
}
```

### Invalid Language Selection

```typescript
// Handle cases where an invalid language code is provided
function changeLanguage(language: string): void {
  if (!isValidLanguage(language)) {
    console.warn(`Invalid language code "${language}", falling back to default`);
    language = DEFAULT_LANGUAGE;
  }
  
  // Proceed with valid language
  setCurrentLanguage(language as Language);
}

function isValidLanguage(lang: string): lang is Language {
  return lang === 'ar' || lang === 'en';
}
```

## Testing Strategy

### Unit Testing

Unit tests will verify specific behaviors and edge cases:

1. **Translation retrieval**: Test that specific translation keys return expected values
2. **Language switching**: Test that changing language updates the context state
3. **Local storage**: Test persistence and retrieval with mocked localStorage
4. **Fallback behavior**: Test that missing keys fall back to English
5. **Parameter interpolation**: Test specific examples of parameter substitution
6. **RTL/LTR switching**: Test that document direction changes correctly
7. **Format utilities**: Test specific date, number, and currency formatting examples

### Property-Based Testing

Property-based tests will verify universal properties across many inputs using the `fast-check` library (already available in the project):

1. **Translation consistency**: Generate random translation keys and verify they return consistent results
2. **State preservation**: Generate random application states and verify they're preserved during language switches
3. **Fallback behavior**: Generate random missing keys and verify English fallback works
4. **Parameter interpolation**: Generate random parameters and verify correct substitution
5. **Format utilities**: Generate random dates/numbers and verify locale-appropriate formatting
6. **Key structure validation**: Verify all translation keys follow the naming convention

Each property-based test will run a minimum of 100 iterations to ensure comprehensive coverage.

### Integration Testing

Integration tests will verify the i18n system works correctly with React components:

1. **Component re-rendering**: Verify components update when language changes
2. **Context propagation**: Verify translations are accessible throughout the component tree
3. **Language selector**: Verify the UI component correctly triggers language changes
4. **Initial load**: Verify the correct language is applied on application startup

## Implementation Notes

### RTL Support with Tailwind CSS

The application uses Tailwind CSS, which has built-in RTL support. Key considerations:

1. Use logical properties where possible: `ms-4` (margin-start) instead of `ml-4` (margin-left)
2. Tailwind automatically handles RTL when `dir="rtl"` is set on the HTML element
3. For custom CSS, use logical properties or RTL-aware utilities
4. Test all layouts in both RTL and LTR modes

### Performance Considerations

1. **Lazy loading**: Translation files are loaded dynamically using dynamic imports
2. **Caching**: Loaded translations are cached in memory to avoid repeated loads
3. **Memoization**: Translation function results can be memoized for frequently accessed keys
4. **Bundle size**: Keep translation files reasonably sized; consider code-splitting for large apps

### Developer Experience

1. **TypeScript support**: Provide type definitions for translation keys (optional enhancement)
2. **Development warnings**: Log warnings for missing translations in development mode
3. **Hot reload**: Ensure translation changes are reflected during development without full reload
4. **Clear naming**: Use descriptive, hierarchical key names for easy maintenance

### Migration Strategy

Since this is an existing application, the migration will be incremental:

1. **Phase 1**: Set up i18n infrastructure (context, provider, hooks)
2. **Phase 2**: Create translation files with all existing text
3. **Phase 3**: Migrate components one section at a time (auth, dashboard, profile, etc.)
4. **Phase 4**: Add language selector UI
5. **Phase 5**: Test and refine RTL layout

### Translation File Organization

```
frontend/src/
├── locales/
│   ├── ar.json          # Arabic translations
│   ├── en.json          # English translations
│   └── index.ts         # Type definitions and exports
├── contexts/
│   └── I18nContext.tsx  # Context and provider
├── hooks/
│   └── useTranslation.ts # Translation hook
├── components/
│   └── LanguageSelector.tsx # Language switcher UI
└── utils/
    └── i18n.ts          # Utility functions
```

## Security Considerations

1. **XSS Prevention**: Ensure translated strings are properly escaped when rendered
2. **Input Validation**: Validate language codes before using them
3. **Local Storage**: Don't store sensitive data in language preferences
4. **Translation Injection**: Sanitize any user-provided content before interpolation

## Accessibility Considerations

1. **Language Attribute**: Set the `lang` attribute on the HTML element to match the current language
2. **Screen Readers**: Ensure language changes are announced to screen readers
3. **Keyboard Navigation**: Language selector must be fully keyboard accessible
4. **Focus Management**: Maintain focus position when language changes
5. **ARIA Labels**: Provide appropriate ARIA labels for the language selector

## Future Enhancements

1. **Additional Languages**: Architecture supports easy addition of more languages
2. **Pluralization**: Add support for plural forms (e.g., "1 item" vs "2 items")
3. **Gender**: Add support for gendered translations where needed
4. **Translation Management**: Consider integration with translation management platforms
5. **Automatic Detection**: Detect user's preferred language from browser settings
6. **Translation Validation**: Build tools to validate translation file completeness
