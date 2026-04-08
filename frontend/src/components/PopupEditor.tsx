import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface PopupSettings {
  id?: string;
  isEnabled: boolean;
  message: string;
  duration: number | null;
  backgroundColor: string;
  textColor: string;
}

interface PopupEditorProps {
  onPopupUpdate?: (popup: PopupSettings) => void;
}

export const PopupEditor: React.FC<PopupEditorProps> = ({ onPopupUpdate }) => {
  const { token } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState<number | null>(5000);
  const [backgroundColor, setBackgroundColor] = useState('#3b82f6');
  const [textColor, setTextColor] = useState('#ffffff');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch existing popup settings on mount
  useEffect(() => {
    const fetchPopupSettings = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/popup`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const popup = await response.json();
          if (popup) {
            setIsEnabled(popup.isEnabled);
            setMessage(popup.message || '');
            setDuration(popup.duration);
            setBackgroundColor(popup.backgroundColor || '#3b82f6');
            setTextColor(popup.textColor || '#ffffff');
          }
        }
      } catch (err) {
        console.error('Failed to fetch popup settings:', err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchPopupSettings();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/popup`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            isEnabled,
            message: message.trim(),
            duration,
            backgroundColor,
            textColor,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update popup settings');
      }

      const updatedPopup = await response.json();
      setSuccessMessage('Popup settings saved successfully!');
      
      // Notify parent component of update
      if (onPopupUpdate) {
        onPopupUpdate({
          isEnabled: updatedPopup.isEnabled,
          message: updatedPopup.message,
          duration: updatedPopup.duration,
          backgroundColor: updatedPopup.backgroundColor,
          textColor: updatedPopup.textColor,
        });
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading popup settings...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Popup Message</h2>
      <p className="text-sm text-gray-600 mb-6">
        Create a promotional message or announcement that appears when visitors open your profile.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <label htmlFor="isEnabled" className="block text-sm font-medium text-gray-700">
              Enable Popup
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Show this popup to visitors
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isEnabled}
            onClick={() => setIsEnabled(!isEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isEnabled ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Message Input */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Enter your promotional message or announcement..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {message.length}/500 characters
          </p>
        </div>

        {/* Duration Setting */}
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
            Display Duration
          </label>
          <select
            id="duration"
            value={duration === null ? 'persistent' : duration}
            onChange={(e) => {
              const value = e.target.value;
              setDuration(value === 'persistent' ? null : parseInt(value, 10));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="3000">3 seconds</option>
            <option value="5000">5 seconds</option>
            <option value="10000">10 seconds</option>
            <option value="15000">15 seconds</option>
            <option value="30000">30 seconds</option>
            <option value="persistent">Until dismissed</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            How long the popup should display before auto-dismissing
          </p>
        </div>

        {/* Color Customization */}
        <div className="grid grid-cols-2 gap-4">
          {/* Background Color */}
          <div>
            <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700 mb-1">
              Background Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                id="backgroundColor"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                placeholder="#3b82f6"
              />
            </div>
          </div>

          {/* Text Color */}
          <div>
            <label htmlFor="textColor" className="block text-sm font-medium text-gray-700 mb-1">
              Text Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                id="textColor"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        {message && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div
              className="p-4 rounded-lg shadow-lg"
              style={{
                backgroundColor,
                color: textColor,
              }}
            >
              <p className="text-sm">{message}</p>
            </div>
          </div>
        )}

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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save Popup Settings'}
        </button>
      </form>
    </div>
  );
};
