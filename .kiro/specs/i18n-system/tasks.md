# Implementation Plan: i18n System

- [x] 1. Set up i18n infrastructure and core utilities
  - Create language configuration constants with RTL/LTR settings
  - Create translation file structure in frontend/src/locales/
  - Implement translation loading and caching utilities
  - Implement local storage persistence utilities
  - _Requirements: 1.5, 3.1, 3.2, 5.1, 5.5_

- [ ]* 1.1 Write property test for language persistence
  - **Property 4: Language persistence round-trip**
  - **Validates: Requirements 3.1, 3.2**

- [x] 2. Create I18nContext and Provider
  - Implement I18nContext with language state and translation function
  - Create I18nProvider component with initialization logic
  - Implement language change handler with RTL/LTR switching
  - Handle default language and stored preference retrieval
  - Update document direction attribute when language changes
  - _Requirements: 1.1, 1.3, 1.4, 2.3, 3.3, 3.4_

- [ ]* 2.1 Write property test for document direction
  - **Property 3: Document direction matches language**
  - **Validates: Requirements 2.3**

- [x] 3. Implement translation function with fallback logic
  - Create translation retrieval function with dot notation key support
  - Implement English fallback for missing keys
  - Add parameter interpolation support for dynamic values
  - Add development mode warnings for missing translations
  - _Requirements: 5.2, 5.3, 5.4, 8.3_

- [ ]* 3.1 Write property test for translation retrieval
  - **Property 1: Language selection updates translations**
  - **Validates: Requirements 1.2, 5.3**

- [ ]* 3.2 Write property test for fallback behavior
  - **Property 6: Fallback to English for missing keys**
  - **Validates: Requirements 5.4**

- [ ]* 3.3 Write property test for parameter interpolation
  - **Property 8: Parameter interpolation in translations**
  - **Validates: Requirements 8.3**

- [x] 4. Create useTranslation hook
  - Implement custom React hook that accesses I18nContext
  - Return translation function and current language state
  - Return isRTL flag for conditional rendering
  - Ensure hook triggers re-renders on language change
  - _Requirements: 8.1, 8.2, 8.4_

- [ ]* 4.1 Write property test for component re-rendering
  - **Property 9: Component re-render on language change**
  - **Validates: Requirements 8.4**

- [x] 5. Implement locale-aware formatting utilities
  - Create formatDate utility using Intl.DateTimeFormat
  - Create formatNumber utility using Intl.NumberFormat
  - Create formatCurrency utility using Intl.NumberFormat
  - Add utilities to I18nContext for component access
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ]* 5.1 Write property test for date formatting
  - **Property 10: Date formatting matches locale**
  - **Validates: Requirements 9.1**

- [ ]* 5.2 Write property test for number formatting
  - **Property 11: Number formatting matches locale**
  - **Validates: Requirements 9.2**

- [ ]* 5.3 Write property test for currency formatting
  - **Property 12: Currency formatting matches locale**
  - **Validates: Requirements 9.3**

- [x] 6. Create Arabic translation file
  - Extract all user-facing text from existing components
  - Create comprehensive ar.json with all translations
  - Organize keys by feature namespace (auth, dashboard, profile, etc.)
  - Ensure all keys follow dot notation convention
  - _Requirements: 5.1, 5.2, 6.1, 6.3_

- [ ] 7. Create English translation file
  - Create en.json with English translations for all keys
  - Ensure key structure matches ar.json exactly
  - Verify all namespaces and nested structures are consistent
  - _Requirements: 5.1, 5.2, 6.3, 6.4_

- [ ]* 7.1 Write property test for translation key consistency
  - **Property 7: Translation key consistency across languages**
  - **Validates: Requirements 6.3**

- [ ]* 7.2 Write property test for key format validation
  - **Property 5: Translation key format consistency**
  - **Validates: Requirements 5.2**

- [x] 8. Create LanguageSelector component
  - Implement responsive UI component for language switching
  - Add language options with native names and flags
  - Handle language change on user selection
  - Style for both desktop and mobile viewports
  - Ensure touch targets are minimum 44x44 pixels on mobile
  - Add keyboard navigation support
  - _Requirements: 4.1, 4.2, 4.3_

- [ ]* 8.1 Write unit tests for LanguageSelector component
  - Test rendering of language options
  - Test language change handler
  - Test mobile responsive behavior
  - Test keyboard accessibility
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 9. Integrate I18nProvider into application
  - Wrap App component with I18nProvider in main.tsx
  - Ensure provider is at root level for global access
  - Verify translations load before initial render
  - _Requirements: 1.1, 3.4_

- [x] 10. Migrate authentication components to use translations
  - Update LoginForm component to use useTranslation hook
  - Update RegisterForm component to use useTranslation hook
  - Replace all hardcoded text with translation keys
  - Test language switching in auth flows
  - _Requirements: 1.2, 2.1, 2.2_

- [ ]* 10.1 Write property test for state preservation
  - **Property 2: State preservation during language switch**
  - **Validates: Requirements 2.2**

- [x] 11. Migrate dashboard and profile components
  - Update Dashboard component to use translations
  - Update DashboardLayout component to use translations
  - Update ProfileEditor component to use translations
  - Update all dashboard-related components
  - _Requirements: 1.2, 2.1_

- [x] 12. Migrate remaining components
  - Update LinkManager and related components
  - Update ThemeCustomizer component
  - Update QRCodeGenerator component
  - Update all modal and form components
  - Update PublicProfile page
  - _Requirements: 1.2, 2.1_

- [x] 13. Add LanguageSelector to application header
  - Add LanguageSelector to DashboardLayout header
  - Add LanguageSelector to public pages
  - Position appropriately for both RTL and LTR layouts
  - Ensure visibility and accessibility on all pages
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 14. Implement RTL-aware styling
  - Review and update Tailwind classes to use logical properties
  - Test all layouts in RTL mode
  - Fix any layout issues specific to RTL
  - Ensure proper text alignment and spacing
  - Test navigation, forms, and modals in RTL
  - _Requirements: 1.3, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 14.1 Write integration tests for RTL layout
  - Test document direction changes
  - Test component layout in RTL mode
  - Test navigation and interaction in RTL
  - _Requirements: 1.3, 7.1_

- [x] 15. Add accessibility attributes
  - Set lang attribute on HTML element based on current language
  - Add ARIA labels to LanguageSelector
  - Ensure language changes are announced to screen readers
  - Test keyboard navigation throughout the app
  - _Requirements: 4.4_

- [x] 16. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
