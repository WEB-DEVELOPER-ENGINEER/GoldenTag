import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LinkCreationFormProps {
  onLinkCreated?: () => void;
}

type LinkType = 'PLATFORM' | 'CUSTOM';

const SUPPORTED_PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/in/username' },
  { id: 'youtube', name: 'YouTube', icon: '📺', placeholder: 'https://youtube.com/@channel' },
  { id: 'medium', name: 'Medium', icon: '📝', placeholder: 'https://medium.com/@username' },
  { id: 'github', name: 'GitHub', icon: '💻', placeholder: 'https://github.com/username' },
  { id: 'substack', name: 'Substack', icon: '📰', placeholder: 'https://username.substack.com' },
  { id: 'twitter', name: 'Twitter/X', icon: '🐦', placeholder: 'https://twitter.com/username' },
  { id: 'instagram', name: 'Instagram', icon: '📷', placeholder: 'https://instagram.com/username' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', placeholder: 'https://tiktok.com/@username' },
];

export const LinkCreationForm: React.FC<LinkCreationFormProps> = ({ onLinkCreated }) => {
  const { token } = useAuth();
  const [linkType, setLinkType] = useState<LinkType>('PLATFORM');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [customIcon, setCustomIcon] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePlatformChange = (platformId: string) => {
    setSelectedPlatform(platformId);
    const platform = SUPPORTED_PLATFORMS.find(p => p.id === platformId);
    if (platform) {
      setTitle(platform.name);
    }
  };

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL (must start with http:// or https://)');
      return;
    }

    if (linkType === 'PLATFORM' && !selectedPlatform) {
      setError('Please select a platform');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/links`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: linkType,
            platform: linkType === 'PLATFORM' ? selectedPlatform : null,
            title: title.trim(),
            url: url.trim(),
            icon: linkType === 'CUSTOM' && customIcon ? customIcon : null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create link');
      }

      setSuccessMessage('Link created successfully!');
      
      // Reset form
      setTitle('');
      setUrl('');
      setCustomIcon('');
      setSelectedPlatform('');
      
      // Notify parent component
      if (onLinkCreated) {
        onLinkCreated();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholder = () => {
    if (linkType === 'PLATFORM' && selectedPlatform) {
      const platform = SUPPORTED_PLATFORMS.find(p => p.id === selectedPlatform);
      return platform?.placeholder || 'Enter URL';
    }
    return 'https://example.com';
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Link</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Link Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link Type
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                setLinkType('PLATFORM');
                setTitle('');
                setUrl('');
              }}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                linkType === 'PLATFORM'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">Platform Link</div>
              <div className="text-xs mt-1">Social media & popular platforms</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setLinkType('CUSTOM');
                setSelectedPlatform('');
                setTitle('');
                setUrl('');
              }}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                linkType === 'CUSTOM'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">Custom Link</div>
              <div className="text-xs mt-1">Any website or URL</div>
            </button>
          </div>
        </div>

        {/* Platform Selection (only for PLATFORM type) */}
        {linkType === 'PLATFORM' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Platform
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORTED_PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => handlePlatformChange(platform.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedPlatform === platform.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{platform.icon}</span>
                  <span className="font-medium text-sm">{platform.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={linkType === 'PLATFORM' ? 'Auto-filled from platform' : 'My Website'}
            required
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">
            {title.length}/100 characters
          </p>
        </div>

        {/* URL Field */}
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={getPlaceholder()}
            required
          />
        </div>

        {/* Custom Icon (only for CUSTOM type) */}
        {linkType === 'CUSTOM' && (
          <div>
            <label htmlFor="customIcon" className="block text-sm font-medium text-gray-700 mb-1">
              Icon (optional)
            </label>
            <input
              type="text"
              id="customIcon"
              value={customIcon}
              onChange={(e) => setCustomIcon(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="🔗 (emoji or icon)"
              maxLength={2}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use an emoji to represent your link
            </p>
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
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Creating...' : 'Create Link'}
        </button>
      </form>
    </div>
  );
};
