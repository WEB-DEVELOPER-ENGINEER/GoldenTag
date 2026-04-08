import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

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

interface LinkListProps {
  onEditLink?: (link: Link) => void;
  onLinksChange?: (links: Link[]) => void;
}

// Platform icons mapping
const PLATFORM_ICONS: Record<string, string> = {
  linkedin: '💼',
  youtube: '📺',
  medium: '📝',
  github: '💻',
  substack: '📰',
  twitter: '🐦',
  instagram: '📷',
  tiktok: '🎵',
};

export const LinkList: React.FC<LinkListProps> = ({ onEditLink, onLinksChange }) => {
  const { token } = useAuth();
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Fetch links on mount and when component updates
  useEffect(() => {
    fetchLinks();
  }, [token]);

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/links`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch links');
      }

      const data = await response.json();
      setLinks(data);
      
      if (onLinksChange) {
        onLinksChange(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this link?')) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/links/${linkId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete link');
      }

      // Refresh links after deletion
      await fetchLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete link');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) {
      return;
    }

    const newLinks = [...links];
    const draggedLink = newLinks[draggedIndex];
    
    // Remove from old position
    newLinks.splice(draggedIndex, 1);
    // Insert at new position
    newLinks.splice(index, 0, draggedLink);
    
    setLinks(newLinks);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) {
      return;
    }

    try {
      // Update order values based on new positions
      const linkOrders = links.map((link, index) => ({
        id: link.id,
        order: index,
      }));

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/links/reorder`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ linkOrders }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reorder links');
      }

      const updatedLinks = await response.json();
      setLinks(updatedLinks);
      
      if (onLinksChange) {
        onLinksChange(updatedLinks);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder links');
      // Refresh to restore correct order
      await fetchLinks();
    } finally {
      setDraggedIndex(null);
    }
  };

  const getPlatformIcon = (link: Link) => {
    if (link.type === 'PLATFORM' && link.platform) {
      return PLATFORM_ICONS[link.platform] || '🔗';
    }
    return link.icon || '🔗';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Loading links...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={fetchLinks}
          className="mt-2 text-sm text-red-700 underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No links yet. Add your first link to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {links.map((link, index) => (
        <div
          key={link.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`
            flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg
            hover:border-gray-300 transition-all cursor-move
            ${draggedIndex === index ? 'opacity-50' : 'opacity-100'}
          `}
        >
          {/* Drag Handle */}
          <div className="text-gray-400 cursor-grab active:cursor-grabbing">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8h16M4 16h16"
              />
            </svg>
          </div>

          {/* Icon */}
          <div className="text-2xl flex-shrink-0">
            {getPlatformIcon(link)}
          </div>

          {/* Link Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">
              {link.title}
            </h4>
            <p className="text-sm text-gray-500 truncate">
              {link.url}
            </p>
            {link.type === 'PLATFORM' && link.platform && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                {link.platform}
              </span>
            )}
          </div>

          {/* Visibility Toggle */}
          <div className="flex-shrink-0">
            {link.isVisible ? (
              <span className="text-green-600 text-sm">Visible</span>
            ) : (
              <span className="text-gray-400 text-sm">Hidden</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => onEditLink && onEditLink(link)}
              className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(link.id)}
              className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
