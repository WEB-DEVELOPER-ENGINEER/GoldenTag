import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

interface ThemeSettings {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  fontFamily: string;
  layout: 'centered' | 'left' | 'right';
  buttonStyle: 'rounded' | 'square' | 'pill';
}

interface ThemeCustomizerProps {
  currentTheme?: Partial<ThemeSettings>;
  onThemeUpdate?: (theme: ThemeSettings) => void;
}

const FONT_OPTIONS = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Lato, sans-serif', label: 'Lato' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
];

const LAYOUT_OPTIONS = [
  { value: 'centered', label: 'Centered' },
  { value: 'left', label: 'Left Aligned' },
  { value: 'right', label: 'Right Aligned' },
];

const BUTTON_STYLE_OPTIONS = [
  { value: 'rounded', label: 'Rounded' },
  { value: 'square', label: 'Square' },
  { value: 'pill', label: 'Pill' },
];

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ 
  currentTheme, 
  onThemeUpdate 
}) => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [theme, setTheme] = useState<ThemeSettings>({
    mode: currentTheme?.mode || 'light',
    primaryColor: currentTheme?.primaryColor || '#3B82F6',
    secondaryColor: currentTheme?.secondaryColor || '#10B981',
    textColor: currentTheme?.textColor || '#1F2937',
    fontFamily: currentTheme?.fontFamily || 'Inter, sans-serif',
    layout: currentTheme?.layout || 'centered',
    buttonStyle: currentTheme?.buttonStyle || 'rounded',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Update theme when currentTheme prop changes
  React.useEffect(() => {
    if (currentTheme) {
      setTheme({
        mode: currentTheme.mode || 'light',
        primaryColor: currentTheme.primaryColor || '#3B82F6',
        secondaryColor: currentTheme.secondaryColor || '#10B981',
        textColor: currentTheme.textColor || '#1F2937',
        fontFamily: currentTheme.fontFamily || 'Inter, sans-serif',
        layout: currentTheme.layout || 'centered',
        buttonStyle: currentTheme.buttonStyle || 'rounded',
      });
    }
  }, [currentTheme]);

  const handleThemeChange = (key: keyof ThemeSettings, value: string) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  const handleModeToggle = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/profiles/me/theme/toggle`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to toggle theme mode');
      }

      const updatedTheme = await response.json();
      setTheme(prev => ({ ...prev, mode: updatedTheme.mode }));
      setSuccessMessage(t('theme.theme_updated'));
      
      if (onThemeUpdate) {
        onThemeUpdate({ ...theme, mode: updatedTheme.mode });
      }

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('theme.toggle_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTheme = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Transform theme data to match backend expectations
      const themeData = {
        mode: theme.mode.toUpperCase(),
        primaryColor: theme.primaryColor,
        secondaryColor: theme.secondaryColor,
        textColor: theme.textColor,
        fontFamily: theme.fontFamily.split(',')[0].trim(), // Remove ', sans-serif' part
        layout: theme.layout.toUpperCase(),
        buttonStyle: theme.buttonStyle.toUpperCase(),
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/profiles/me/theme`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(themeData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update theme');
      }

      const updatedTheme = await response.json();
      setSuccessMessage(t('theme.theme_saved'));
      
      if (onThemeUpdate) {
        onThemeUpdate(updatedTheme);
      }

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('theme.save_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">{t('theme.title')}</h2>

      {/* Light/Dark Mode Toggle */}
      <div className="pb-4 border-b border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('theme.mode')}
        </label>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button
            onClick={handleModeToggle}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              theme.mode === 'light'
                ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('theme.light')}
          </button>
          <button
            onClick={handleModeToggle}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              theme.mode === 'dark'
                ? 'bg-gray-800 text-white border-2 border-gray-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('theme.dark')}
          </button>
        </div>
      </div>

      {/* Color Pickers */}
      <div className="space-y-4">
        <div>
          <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">
            {t('theme.primary_color')}
          </label>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <input
              type="color"
              id="primaryColor"
              value={theme.primaryColor}
              onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={theme.primaryColor}
              onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="#3B82F6"
            />
          </div>
        </div>

        <div>
          <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 mb-2">
            {t('theme.secondary_color')}
          </label>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <input
              type="color"
              id="secondaryColor"
              value={theme.secondaryColor}
              onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={theme.secondaryColor}
              onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="#10B981"
            />
          </div>
        </div>

        <div>
          <label htmlFor="textColor" className="block text-sm font-medium text-gray-700 mb-2">
            {t('theme.text_color')}
          </label>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <input
              type="color"
              id="textColor"
              value={theme.textColor}
              onChange={(e) => handleThemeChange('textColor', e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={theme.textColor}
              onChange={(e) => handleThemeChange('textColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="#1F2937"
            />
          </div>
        </div>
      </div>

      {/* Font Selection */}
      <div>
        <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-700 mb-2">
          {t('theme.font_family')}
        </label>
        <select
          id="fontFamily"
          value={theme.fontFamily}
          onChange={(e) => handleThemeChange('fontFamily', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {FONT_OPTIONS.map(font => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      {/* Layout Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('theme.layout')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {LAYOUT_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => handleThemeChange('layout', option.value)}
              className={`px-3 py-2 text-sm rounded-md border-2 transition-colors ${
                theme.layout === option.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t(`theme.layout_${option.value}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Button Style Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('theme.button_style')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {BUTTON_STYLE_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => handleThemeChange('buttonStyle', option.value)}
              className={`px-3 py-2 text-sm border-2 transition-colors ${
                option.value === 'rounded' ? 'rounded-md' : 
                option.value === 'square' ? 'rounded-none' : 'rounded-full'
              } ${
                theme.buttonStyle === option.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t(`theme.button_${option.value}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSaveTheme}
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? t('common.saving') : t('theme.save_theme')}
      </button>
    </div>
  );
};
