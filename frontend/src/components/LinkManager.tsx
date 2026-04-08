import React, { useState } from 'react';
import { LinkList } from './LinkList';
import { LinkCreationForm } from './LinkCreationForm';
import { LinkEditModal } from './LinkEditModal';

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

interface LinkManagerProps {
  onLinksChange?: (links: Link[]) => void;
}

export const LinkManager: React.FC<LinkManagerProps> = ({ onLinksChange }) => {
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEditLink = (link: Link) => {
    setEditingLink(link);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingLink(null);
  };

  const handleLinkCreated = () => {
    // Trigger refresh of link list
    setRefreshKey(prev => prev + 1);
  };

  const handleLinkUpdated = () => {
    // Trigger refresh of link list
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      {/* Link Creation Form */}
      <div>
        <LinkCreationForm onLinkCreated={handleLinkCreated} />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Link List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Links</h2>
        <LinkList
          key={refreshKey}
          onEditLink={handleEditLink}
          onLinksChange={onLinksChange}
        />
      </div>

      {/* Edit Modal */}
      <LinkEditModal
        link={editingLink}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onLinkUpdated={handleLinkUpdated}
      />
    </div>
  );
};
