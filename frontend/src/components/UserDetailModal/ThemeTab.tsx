import React from 'react';
import { UserDetail, ThemeForm } from './types';

interface ThemeTabProps {
  user: UserDetail;
  themeForm: ThemeForm;
  setThemeForm: (form: ThemeForm) => void;
  setHasChanges: (value: boolean) => void;
}

export const ThemeTab: React.FC<ThemeTabProps> = ({
  user,
  themeForm,
  setThemeForm,
  setHasChanges,
}) => {
  if (!user?.profile?.theme) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No theme data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Theme Preview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme Preview</h3>
        <div 
          className="p-6 rounded-lg border-2"
          style={{
            backgroundColor: themeForm.mode === 'DARK' ? '#1f2937' : '#ffffff',
            color: themeForm.textColor,
            fontFamily: themeForm.fontFamily,
          }}
        >
          <h4 className="text-xl font-bold mb-2" style={{ color: themeForm.primaryColor }}>
            Sample Heading
          </h4>
          <p className="mb-4">This is how the profile will look with current theme settings.</p>
          <button 
            className="px-4 py-2 rounded font-medium"
            style={{
              backgroundColor: themeForm.primaryColor,
              color: '#ffffff',
              borderRadius: themeForm.buttonStyle === 'PILL' ? '9999px' : themeForm.buttonStyle === 'SQUARE' ? '0' : '0.5rem',
            }}
          >
            Sample Button
          </button>
        </div>
      </div>

      {/* Layout & Style */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Layout & Style</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme Mode</label>
            <select
              value={themeForm.mode}
              onChange={(e) => {
                setThemeForm({ ...themeForm, mode: e.target.value as 'LIGHT' | 'DARK' });
                setHasChanges(true);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LIGHT">☀️ Light Mode</option>
              <option value="DARK">🌙 Dark Mode</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content Layout</label>
            <select
              value={themeForm.layout}
              onChange={(e) => {
                setThemeForm({ ...themeForm, layout: e.target.value as any });
                setHasChanges(true);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CENTERED">⬛ Centered</option>
              <option value="LEFT">⬅️ Left Aligned</option>
              <option value="RIGHT">➡️ Right Aligned</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Style</label>
            <select
              value={themeForm.buttonStyle}
              onChange={(e) => {
                setThemeForm({ ...themeForm, buttonStyle: e.target.value as any });
                setHasChanges(true);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ROUNDED">🔘 Rounded</option>
              <option value="SQUARE">⬜ Square</option>
              <option value="PILL">💊 Pill</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
            <select
              value={themeForm.fontFamily}
              onChange={(e) => {
                setThemeForm({ ...themeForm, fontFamily: e.target.value });
                setHasChanges(true);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Inter">Inter</option>
              <option value="Poppins">Poppins</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
              <option value="Montserrat">Montserrat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Scheme</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
            <div className="flex gap-4 items-center">
              <input
                type="color"
                value={themeForm.primaryColor}
                onChange={(e) => {
                  setThemeForm({ ...themeForm, primaryColor: e.target.value });
                  setHasChanges(true);
                }}
                className="w-20 h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={themeForm.primaryColor}
                onChange={(e) => {
                  setThemeForm({ ...themeForm, primaryColor: e.target.value });
                  setHasChanges(true);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="#3b82f6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
            <div className="flex gap-4 items-center">
              <input
                type="color"
                value={themeForm.secondaryColor}
                onChange={(e) => {
                  setThemeForm({ ...themeForm, secondaryColor: e.target.value });
                  setHasChanges(true);
                }}
                className="w-20 h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={themeForm.secondaryColor}
                onChange={(e) => {
                  setThemeForm({ ...themeForm, secondaryColor: e.target.value });
                  setHasChanges(true);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="#8b5cf6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
            <div className="flex gap-4 items-center">
              <input
                type="color"
                value={themeForm.textColor}
                onChange={(e) => {
                  setThemeForm({ ...themeForm, textColor: e.target.value });
                  setHasChanges(true);
                }}
                className="w-20 h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={themeForm.textColor}
                onChange={(e) => {
                  setThemeForm({ ...themeForm, textColor: e.target.value });
                  setHasChanges(true);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="#1f2937"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
