/**
 * Example usage of LanguageSelector component
 * This file demonstrates different variants and configurations
 */

import { LanguageSelector } from './LanguageSelector';
import { I18nProvider } from '../contexts/I18nContext';

/**
 * Example 1: Default dropdown variant
 * Best for headers and navigation bars
 */
export function DropdownExample() {
  return (
    <I18nProvider>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Dropdown Variant (Default)</h3>
        <LanguageSelector />
      </div>
    </I18nProvider>
  );
}

/**
 * Example 2: Toggle variant
 * Compact switch for limited space
 */
export function ToggleExample() {
  return (
    <I18nProvider>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Toggle Variant</h3>
        <LanguageSelector variant="toggle" />
      </div>
    </I18nProvider>
  );
}

/**
 * Example 3: Buttons variant
 * Full button group for settings pages
 */
export function ButtonsExample() {
  return (
    <I18nProvider>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Buttons Variant</h3>
        <LanguageSelector variant="buttons" />
      </div>
    </I18nProvider>
  );
}

/**
 * Example 4: Without flags
 * Minimal text-only display
 */
export function NoFlagsExample() {
  return (
    <I18nProvider>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Without Flags</h3>
        <LanguageSelector showFlags={false} />
      </div>
    </I18nProvider>
  );
}

/**
 * Example 5: Without labels
 * Icon-only display
 */
export function NoLabelsExample() {
  return (
    <I18nProvider>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Without Labels</h3>
        <LanguageSelector showLabels={false} />
      </div>
    </I18nProvider>
  );
}

/**
 * Example 6: In a navigation bar
 * Real-world usage in a header
 */
export function NavigationExample() {
  return (
    <I18nProvider>
      <nav className="bg-white border-b border-ink-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">My App</div>
          <LanguageSelector />
        </div>
      </nav>
    </I18nProvider>
  );
}

/**
 * Example 7: Mobile responsive
 * Demonstrates responsive behavior
 */
export function MobileExample() {
  return (
    <I18nProvider>
      <div className="max-w-sm mx-auto p-4">
        <h3 className="text-lg font-semibold mb-4">Mobile View</h3>
        <LanguageSelector variant="buttons" />
      </div>
    </I18nProvider>
  );
}

/**
 * All examples in one view
 */
export function AllExamples() {
  return (
    <I18nProvider>
      <div className="space-y-8 p-8 bg-ink-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-8">LanguageSelector Examples</h1>
        
        <div className="card p-6">
          <DropdownExample />
        </div>
        
        <div className="card p-6">
          <ToggleExample />
        </div>
        
        <div className="card p-6">
          <ButtonsExample />
        </div>
        
        <div className="card p-6">
          <NoFlagsExample />
        </div>
        
        <div className="card p-6">
          <NoLabelsExample />
        </div>
        
        <div className="card p-6">
          <NavigationExample />
        </div>
        
        <div className="card p-6">
          <MobileExample />
        </div>
      </div>
    </I18nProvider>
  );
}
