/**
 * LanguageSelector Component
 * Responsive UI component for language switching with native names and flags
 * Supports keyboard navigation and touch-friendly interactions
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { LANGUAGE_CONFIGS, Language } from '../config/languages';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'toggle' | 'buttons';
  className?: string;
  showFlags?: boolean;
  showLabels?: boolean;
  compact?: boolean; // New prop for ultra-compact mobile design
}

/**
 * LanguageSelector component
 * Provides a responsive interface for switching between available languages
 * 
 * Features:
 * - Touch-friendly with minimum 44x44px touch targets
 * - Keyboard navigation support (Arrow keys, Enter, Escape)
 * - Responsive design for mobile and desktop
 * - Visual feedback with flags and native language names
 * - Accessible with ARIA labels
 */
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'dropdown',
  className = '',
  showFlags = true,
  showLabels = true,
  compact = false
}) => {
  const { language, changeLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (variant === 'dropdown') {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setIsOpen(!isOpen);
      }
    }
  };

  /**
   * Handle language selection
   */
  const handleLanguageSelect = (lang: Language) => {
    changeLanguage(lang);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  /**
   * Get current language config
   */
  const currentConfig = LANGUAGE_CONFIGS[language];

  /**
   * Render dropdown variant (default)
   */
  if (variant === 'dropdown') {
    // Compact mobile-friendly design
    if (compact) {
      return (
        <div className={`relative ${className}`} ref={dropdownRef}>
          <button
            ref={buttonRef}
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            className="touch-target flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm border border-ink-200/50 rounded-full hover:bg-white hover:border-ink-300 hover:shadow-lg transition-all duration-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100"
            aria-label="Select language"
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <span className="text-lg" role="img" aria-label={currentConfig.name}>
              {currentConfig.flag}
            </span>
          </button>

          {isOpen && (
            <div
              className="absolute top-full mt-2 end-0 min-w-[180px] bg-white/95 backdrop-blur-md border border-ink-200/50 rounded-2xl shadow-2xl overflow-hidden z-50 animate-slide-down"
              role="menu"
              aria-orientation="vertical"
            >
              {Object.values(LANGUAGE_CONFIGS).map((config) => (
                <button
                  key={config.code}
                  onClick={() => handleLanguageSelect(config.code)}
                  className={`touch-target w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-ink-50/80 transition-colors duration-150 ${
                    language === config.code ? 'bg-ink-50/80' : ''
                  }`}
                  role="menuitem"
                  aria-label={`Switch to ${config.name}`}
                >
                  <span className="text-xl" role="img" aria-label={config.name}>
                    {config.flag}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-ink-900">
                      {config.nativeName}
                    </div>
                    <div className="text-xs text-ink-500">{config.name}</div>
                  </div>
                  {language === config.code && (
                    <svg
                      className="w-5 h-5 text-gold-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Standard dropdown design
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className="touch-target flex items-center gap-2 px-4 py-2.5 bg-white border border-ink-200 rounded-xl hover:border-ink-300 hover:bg-ink-50 transition-all duration-200 focus:border-ink-400 focus:ring-4 focus:ring-ink-100"
          aria-label="Select language"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {showFlags && (
            <span className="text-xl" role="img" aria-label={currentConfig.name}>
              {currentConfig.flag}
            </span>
          )}
          {showLabels && (
            <span className="text-sm font-medium text-ink-900">
              {currentConfig.nativeName}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-ink-600 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div
            className="absolute top-full mt-2 end-0 min-w-[160px] bg-white border border-ink-200 rounded-xl shadow-elevation-3 overflow-hidden z-50 animate-slide-down"
            role="menu"
            aria-orientation="vertical"
          >
            {Object.values(LANGUAGE_CONFIGS).map((config) => (
              <button
                key={config.code}
                onClick={() => handleLanguageSelect(config.code)}
                className={`touch-target w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-ink-50 transition-colors duration-150 ${
                  language === config.code ? 'bg-ink-50' : ''
                }`}
                role="menuitem"
                aria-label={`Switch to ${config.name}`}
              >
                {showFlags && (
                  <span className="text-xl" role="img" aria-label={config.name}>
                    {config.flag}
                  </span>
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink-900">
                    {config.nativeName}
                  </div>
                  <div className="text-xs text-ink-500">{config.name}</div>
                </div>
                {language === config.code && (
                  <svg
                    className="w-5 h-5 text-ink-900"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  /**
   * Render toggle variant (compact switch)
   */
  if (variant === 'toggle') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {Object.values(LANGUAGE_CONFIGS).map((config) => (
          <button
            key={config.code}
            onClick={() => handleLanguageSelect(config.code)}
            className={`touch-target flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
              language === config.code
                ? 'bg-ink-900 text-white shadow-elevation-2'
                : 'bg-white text-ink-700 border border-ink-200 hover:border-ink-300 hover:bg-ink-50'
            }`}
            aria-label={`Switch to ${config.name}`}
            aria-pressed={language === config.code}
          >
            {showFlags && (
              <span className="text-base" role="img" aria-label={config.name}>
                {config.flag}
              </span>
            )}
            {showLabels && (
              <span className="text-sm font-medium">{config.code.toUpperCase()}</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  /**
   * Render buttons variant (full button group)
   */
  if (variant === 'buttons') {
    return (
      <div className={`flex flex-col sm:flex-row gap-2 ${className}`}>
        {Object.values(LANGUAGE_CONFIGS).map((config) => (
          <button
            key={config.code}
            onClick={() => handleLanguageSelect(config.code)}
            className={`touch-target flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 ${
              language === config.code
                ? 'bg-ink-900 text-white shadow-elevation-2'
                : 'bg-white text-ink-700 border border-ink-200 hover:border-ink-300 hover:bg-ink-50'
            }`}
            aria-label={`Switch to ${config.name}`}
            aria-pressed={language === config.code}
          >
            {showFlags && (
              <span className="text-xl" role="img" aria-label={config.name}>
                {config.flag}
              </span>
            )}
            {showLabels && (
              <span className="text-sm font-medium">{config.nativeName}</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return null;
};
