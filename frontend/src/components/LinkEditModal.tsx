import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

interface Link {
  id: string;
  type: 'PLATFORM' | 'CUSTOM';
  platform: string | null;
  title: string;
  url: string;
  icon: string | null;
  order: number;
  isVisible: boolean;
}

interface LinkEditModalProps {
  link: Link | null;
  isOpen: boolean;
  onClose: () => void;
  onLinkUpdated?: () => void;
}

const SUPPORTED_PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'youtube', name: 'YouTube', icon: '📺' },
  { id: 'medium', name: 'Medium', icon: '📝' },
  { id: 'github', name: 'GitHub', icon: '💻' },
  { id: 'substack', name: 'Substack', icon: '📰' },
  { id: 'twitter', name: 'Twitter/X', icon: '🐦' },
  { id: 'instagram', name: 'Instagram', icon: '📷' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
];

export const LinkEditModal: React.FC<LinkEditModalProps> = ({
  link,
  isOpen,
  onClose,
  onLinkUpdated,
}) => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form when link changes
  useEffect(() => {
    if (link) {
      setTitle(link.title);
      setUrl(link.url);
      setIcon(link.icon || '');
      setIsVisible(link.isVisible);
      setError(null);
    }
  }, [link]);

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
    
    if (!link) return;

    setError(null);

    // Validation
    if (!title.trim()) {
      setError(t('links.title_required'));
      return;
    }

    if (!url.trim()) {
      setError(t('links.url_required'));
      return;
    }

    if (!validateUrl(url)) {
      setError(t('links.url_invalid'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/links/${link.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            url: url.trim(),
            icon: link.type === 'CUSTOM' && icon ? icon : null,
            isVisible,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update link');
      }

      // Notify parent component
      if (onLinkUpdated) {
        onLinkUpdated();
      }

      // Close modal
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('links.update_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen || !link) {
    return null;
  }

  const getPlatformInfo = () => {
    if (link.type === 'PLATFORM' && link.platform) {
      return SUPPORTED_PLATFORMS.find(p => p.id === link.platform);
    }
    return null;
  };

  const platformInfo = getPlatformInfo();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('common.edit')} {t('links.title')}
            </h3>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Platform Badge (if applicable) */}
          {platformInfo && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
              <span className="text-xl">{platformInfo.icon}</span>
              <span className="text-sm font-medium text-blue-700">
                {t(`platforms.${platformInfo.id}`)} {t('links.title')}
              </span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title Field */}
            <div>
              <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                {t('links.title_label')}
              </label>
              <input
                type="text"
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('links.title_placeholder')}
                required
                maxLength={100}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('links.character_count', { count: title.length })}
              </p>
            </div>

            {/* URL Field */}
            <div>
              <label htmlFor="edit-url" className="block text-sm font-medium text-gray-700 mb-1">
                {t('links.url_label')}
              </label>
              <input
                type="url"
                id="edit-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('links.url_placeholder')}
                required
                disabled={isLoading}
              />
            </div>

            {/* Custom Icon (only for CUSTOM type) */}
            {link.type === 'CUSTOM' && (
              <div>
                <label htmlFor="edit-icon" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('links.icon_label')}
                </label>
                <input
                  type="text"
                  id="edit-icon"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('links.icon_placeholder')}
                  maxLength={2}
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('links.icon_hint')}
                </p>
              </div>
            )}

            {/* Visibility Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <label htmlFor="edit-visible" className="text-sm font-medium text-gray-700">
                  {t('links.visible')}
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t('links.visible')}
                </p>
              </div>
              <button
                type="button"
                id="edit-visible"
                onClick={() => setIsVisible(!isVisible)}
                disabled={isLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isVisible ? 'bg-blue-600' : 'bg-gray-300'
                } disabled:opacity-50`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isVisible ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
