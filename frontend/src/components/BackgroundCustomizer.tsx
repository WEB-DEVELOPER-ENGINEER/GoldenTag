import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BackgroundPresets, BackgroundPreset, BACKGROUND_PRESETS } from './BackgroundPresets';
import { FileUpload } from './FileUpload';

interface BackgroundCustomizerProps {
  currentBackgroundType?: 'color' | 'image' | 'preset';
  currentBackgroundValue?: string | null;
  currentBackgroundImageUrl?: string | null;
  onBackgroundUpdate?: (type: 'color' | 'image' | 'preset', value: string) => void;
}

export const BackgroundCustomizer: React.FC<BackgroundCustomizerProps> = ({
  currentBackgroundType = 'color',
  currentBackgroundValue,
  currentBackgroundImageUrl,
  onBackgroundUpdate,
}) => {
  const { token } = useAuth();
  const [backgroundType, setBackgroundType] = useState<'preset' | 'color' | 'image'>(
    currentBackgroundType === 'image' ? 'image' : 'preset'
  );
  const [selectedPreset, setSelectedPreset] = useState<string | null>(currentBackgroundValue || null);
  const [customColor, setCustomColor] = useState<string>('#ffffff');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentBackgroundType === 'image' && currentBackgroundImageUrl) {
      setBackgroundType('image');
    } else if (currentBackgroundValue) {
      // Check if current value matches a preset
      const matchingPreset = BACKGROUND_PRESETS.find(p => p.value === currentBackgroundValue);
      if (matchingPreset) {
        setBackgroundType('preset');
        setSelectedPreset(currentBackgroundValue);
      } else if (currentBackgroundType === 'color') {
        setBackgroundType('color');
        setCustomColor(currentBackgroundValue);
      }
    }
  }, [currentBackgroundValue, currentBackgroundType, currentBackgroundImageUrl]);

  const handlePresetSelect = async (preset: BackgroundPreset) => {
    setSelectedPreset(preset.value);
    await saveBackground('preset', preset.value);
  };

  const handleCustomColorChange = async (color: string) => {
    setCustomColor(color);
  };

  const handleCustomColorSave = async () => {
    await saveBackground('color', customColor);
  };

  const handleImageUpload = (fileUrl: string) => {
    setSuccessMessage('Background image uploaded successfully!');
    if (onBackgroundUpdate) {
      onBackgroundUpdate('image', fileUrl);
    }
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleImageDelete = async () => {
    if (!window.confirm('Are you sure you want to remove the background image?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/profiles/me/background`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to delete background');
      }

      setSuccessMessage('Background image removed successfully!');
      
      if (onBackgroundUpdate) {
        onBackgroundUpdate('color', '#ffffff');
      }

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const saveBackground = async (type: 'preset' | 'color', value: string) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/profiles/me/background`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            backgroundType: 'COLOR', // Both presets and colors use COLOR type
            backgroundColor: value,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update background');
      }

      setSuccessMessage('Background updated successfully!');
      
      if (onBackgroundUpdate) {
        onBackgroundUpdate(type, value);
      }

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-ink-900 mb-3 tracking-tight">Background</h2>
        <p className="text-sm text-ink-600 leading-relaxed">
          Customize your profile's visual appearance with premium backgrounds
        </p>
      </div>

      {/* Background Type Selector */}
      <div className="flex gap-3">
        <button
          onClick={() => setBackgroundType('preset')}
          className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
            backgroundType === 'preset'
              ? 'bg-ink-900 text-white shadow-elevation-2'
              : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
          }`}
        >
          ✨ Curated Presets
        </button>
        <button
          onClick={() => setBackgroundType('color')}
          className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
            backgroundType === 'color'
              ? 'bg-ink-900 text-white shadow-elevation-2'
              : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
          }`}
        >
          🎨 Custom Color
        </button>
        <button
          onClick={() => setBackgroundType('image')}
          className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
            backgroundType === 'image'
              ? 'bg-ink-900 text-white shadow-elevation-2'
              : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
          }`}
        >
          🖼️ Custom Image
        </button>
      </div>

      {/* Preset Selection */}
      {backgroundType === 'preset' && (
        <BackgroundPresets
          currentBackground={selectedPreset || undefined}
          onBackgroundSelect={handlePresetSelect}
        />
      )}

      {/* Custom Color Selection */}
      {backgroundType === 'color' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-ink-900 mb-3 tracking-tight">Custom Color</h3>
            <p className="text-sm text-ink-600 mb-4 leading-relaxed">
              Choose any color for your background
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="h-16 w-16 rounded-xl border-2 border-ink-200 cursor-pointer shadow-elevation-1"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    className="input font-mono"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="p-8 rounded-2xl border-2 border-ink-200 shadow-elevation-1" style={{ backgroundColor: customColor }}>
                <div className="text-center">
                  <p className="text-sm font-semibold" style={{ 
                    color: parseInt(customColor.slice(1), 16) > 0xffffff / 2 ? '#000000' : '#ffffff' 
                  }}>
                    Preview
                  </p>
                </div>
              </div>

              <button
                onClick={handleCustomColorSave}
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? 'Saving...' : 'Apply Custom Color'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Image Upload */}
      {backgroundType === 'image' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-ink-900 mb-3 tracking-tight">Custom Image</h3>
            <p className="text-sm text-ink-600 mb-4 leading-relaxed">
              Upload your own background image for a personalized look
            </p>
            
            {/* Show current image with delete option */}
            {currentBackgroundImageUrl && (
              <div className="mb-6 p-4 bg-ink-50 rounded-xl border border-ink-200">
                <div className="flex items-start gap-4">
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${currentBackgroundImageUrl}`}
                    alt="Current background"
                    className="w-32 h-32 object-cover rounded-lg shadow-elevation-1"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink-900 mb-2">Current Background</p>
                    <p className="text-xs text-ink-600 mb-3">You can upload a new image to replace this one</p>
                    <button
                      onClick={handleImageDelete}
                      disabled={isLoading}
                      className="btn-secondary text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {isLoading ? 'Removing...' : 'Remove Background'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <FileUpload 
              type="background" 
              onUploadSuccess={handleImageUpload}
              currentFile={currentBackgroundImageUrl}
            />

            <div className="mt-6 p-4 bg-gold-50 border border-gold-100 rounded-xl">
              <p className="text-xs text-ink-700 leading-relaxed">
                <span className="font-bold text-ink-900">Pro Tip:</span> For best results, use high-resolution images (1920x1080 or larger). 
                Images will be optimized automatically for fast loading.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-sage-50 border border-sage-100 rounded-xl">
          <p className="text-sm text-sage-700 font-medium">{successMessage}</p>
        </div>
      )}
    </div>
  );
};
