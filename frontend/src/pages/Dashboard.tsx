import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { ProfileEditor } from '../components/ProfileEditor';
import { FileUpload } from '../components/FileUpload';
import { ThemeCustomizer } from '../components/ThemeCustomizer';
import { LinkManager } from '../components/LinkManager';
import { ContactManager } from '../components/ContactManager';
import { FileList } from '../components/FileList';
import { PopupEditor } from '../components/PopupEditor';
import { QRCodeGenerator } from '../components/QRCodeGenerator';
import { PreviewPanel } from '../components/PreviewPanel';

type TabType = 'profile' | 'uploads' | 'theme' | 'links' | 'contacts' | 'popup' | 'qrcode';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
    avatarUrl: null as string | null,
    backgroundType: 'color' as 'color' | 'image',
    backgroundColor: null as string | null,
    backgroundImageUrl: null as string | null,
  });
  const [theme, setTheme] = useState({
    mode: 'light' as 'light' | 'dark',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    textColor: '#1F2937',
    fontFamily: 'Inter, sans-serif',
    layout: 'centered' as 'centered' | 'left' | 'right',
    buttonStyle: 'rounded' as 'rounded' | 'square' | 'pill',
  });
  const [links, setLinks] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [popup, setPopup] = useState<any>(null);

  const handleProfileUpdate = (profile: { displayName: string; bio: string }) => {
    setProfileData(prev => ({ ...prev, ...profile }));
  };

  const handleAvatarUpload = (fileUrl: string) => {
    setProfileData(prev => ({ ...prev, avatarUrl: fileUrl }));
  };

  const handleBackgroundUpload = (fileUrl: string) => {
    setProfileData(prev => ({ ...prev, backgroundImageUrl: fileUrl, backgroundType: 'image' }));
  };

  const handleThemeUpdate = (updatedTheme: typeof theme) => {
    setTheme(updatedTheme);
  };

  const handleLinksChange = (updatedLinks: any[]) => {
    setLinks(updatedLinks);
  };

  const handleContactsChange = (updatedContacts: any[]) => {
    setContacts(updatedContacts);
  };

  const handleFilesChange = (updatedFiles: any[]) => {
    setFiles(updatedFiles);
  };

  const handlePopupUpdate = (updatedPopup: any) => {
    setPopup(updatedPopup);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileEditor onProfileUpdate={handleProfileUpdate} />;
      case 'uploads':
        return (
          <div className="space-y-8">
            <FileUpload 
              type="avatar" 
              onUploadSuccess={handleAvatarUpload}
              currentFile={profileData.avatarUrl}
            />
            <div className="border-t border-gray-200 pt-8">
              <FileUpload 
                type="background" 
                onUploadSuccess={handleBackgroundUpload}
                currentFile={profileData.backgroundImageUrl}
              />
            </div>
            <div className="border-t border-gray-200 pt-8">
              <FileUpload type="pdf" />
            </div>
          </div>
        );
      case 'theme':
        return <ThemeCustomizer currentTheme={theme} onThemeUpdate={handleThemeUpdate} />;
      case 'links':
        return <LinkManager onLinksChange={handleLinksChange} />;
      case 'contacts':
        return (
          <div className="space-y-8">
            <ContactManager onContactsChange={handleContactsChange} />
            <div className="border-t border-gray-200 pt-8">
              <FileList onFilesChange={handleFilesChange} />
            </div>
          </div>
        );
      case 'popup':
        return <PopupEditor onPopupUpdate={handlePopupUpdate} />;
      case 'qrcode':
        return <QRCodeGenerator />;
      default:
        return null;
    }
  };

  const renderPreview = () => {
    return (
      <PreviewPanel
        profileData={profileData}
        theme={theme}
        links={links}
        contacts={contacts}
        files={files}
        popup={popup}
      />
    );
  };

  return (
    <DashboardLayout preview={renderPreview()}>
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'links'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Links
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'contacts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Contacts & Files
          </button>
          <button
            onClick={() => setActiveTab('uploads')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'uploads'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Uploads
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'theme'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Theme
          </button>
          <button
            onClick={() => setActiveTab('popup')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'popup'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Popup
          </button>
          <button
            onClick={() => setActiveTab('qrcode')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'qrcode'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            QR Code
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </DashboardLayout>
  );
};
