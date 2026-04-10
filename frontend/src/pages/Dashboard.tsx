import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { ProfileEditor } from '../components/ProfileEditor';
import { FileUpload } from '../components/FileUpload';
import { ThemeCustomizer } from '../components/ThemeCustomizer';
import { LinkManager } from '../components/LinkManager';
import { ContactManager } from '../components/ContactManager';
import { FileList } from '../components/FileList';
import { PopupEditor } from '../components/PopupEditor';
import { QRCodeGenerator } from '../components/QRCodeGenerator';
import { BackgroundCustomizer } from '../components/BackgroundCustomizer';
import { PreviewPanel } from '../components/PreviewPanel';
import { useTranslation } from '../hooks/useTranslation';

type TabType = 'profile' | 'uploads' | 'background' | 'theme' | 'links' | 'contacts' | 'popup' | 'qrcode';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [loading, setLoading] = useState(true);
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

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('auth_token'); // Changed from 'token' to 'auth_token'
        console.log('Token from localStorage:', token ? 'exists' : 'missing');
        
        if (!token) {
          console.log('No token found, skipping profile fetch');
          setLoading(false);
          return;
        }

        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/profiles/me`;
        console.log('Fetching profile from:', url);

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Profile data received:', data);
          
          // Update profile data
          setProfileData({
            displayName: data.profile.displayName || '',
            bio: data.profile.bio || '',
            avatarUrl: data.profile.avatarUrl,
            backgroundType: data.profile.backgroundType?.toLowerCase() || 'color',
            backgroundColor: data.profile.backgroundColor,
            backgroundImageUrl: data.profile.backgroundImageUrl,
          });

          // Update theme
          if (data.profile.theme) {
            setTheme({
              mode: data.profile.theme.mode?.toLowerCase() || 'light',
              primaryColor: data.profile.theme.primaryColor || '#3B82F6',
              secondaryColor: data.profile.theme.secondaryColor || '#10B981',
              textColor: data.profile.theme.textColor || '#1F2937',
              fontFamily: data.profile.theme.fontFamily || 'Inter, sans-serif',
              layout: data.profile.theme.layout?.toLowerCase() || 'centered',
              buttonStyle: data.profile.theme.buttonStyle?.toLowerCase() || 'rounded',
            });
          }

          // Update links
          if (data.profile.links) {
            setLinks(data.profile.links);
          }

          // Update contacts
          if (data.profile.contacts) {
            setContacts(data.profile.contacts);
          }

          // Update files
          if (data.profile.files) {
            setFiles(data.profile.files);
          }

          // Update popup
          if (data.profile.popup) {
            setPopup(data.profile.popup);
          }
          
          console.log('Profile state updated successfully');
        } else {
          const errorData = await response.text();
          console.error('Failed to fetch profile:', response.status, errorData);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleProfileUpdate = (profile: { displayName: string; bio: string }) => {
    setProfileData(prev => ({ ...prev, ...profile }));
  };

  const handleAvatarUpload = (fileUrl: string) => {
    setProfileData(prev => ({ ...prev, avatarUrl: fileUrl }));
  };

  const handleBackgroundUpdate = (type: 'color' | 'image' | 'preset', value: string) => {
    if (type === 'image') {
      setProfileData(prev => ({ 
        ...prev, 
        backgroundImageUrl: value, 
        backgroundType: 'image',
        backgroundColor: null 
      }));
    } else {
      setProfileData(prev => ({ 
        ...prev, 
        backgroundColor: value, 
        backgroundType: 'color',
        backgroundImageUrl: null 
      }));
    }
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
        return (
          <ProfileEditor 
            onProfileUpdate={handleProfileUpdate}
            initialData={{
              displayName: profileData.displayName,
              bio: profileData.bio
            }}
          />
        );
      case 'uploads':
        return (
          <div className="space-y-8">
            <FileUpload 
              type="avatar" 
              onUploadSuccess={handleAvatarUpload}
              currentFile={profileData.avatarUrl}
            />
            <div className="border-t border-ink-200 pt-8">
              <FileUpload type="pdf" />
            </div>
          </div>
        );
      case 'background':
        return (
          <BackgroundCustomizer
            currentBackgroundType={profileData.backgroundType}
            currentBackgroundValue={profileData.backgroundColor}
            currentBackgroundImageUrl={profileData.backgroundImageUrl}
            onBackgroundUpdate={handleBackgroundUpdate}
          />
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
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="spinner w-12 h-12 mx-auto mb-4"></div>
            <p className="text-neutral-600 font-medium">{t('dashboard.loading_profile')}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Tab Navigation - Mobile Optimized */}
          <div className="mb-10 -mx-6 sm:mx-0">
            {/* Mobile: Horizontal Scroll */}
            <div className="sm:hidden overflow-x-auto scrollbar-hide">
              <nav className="flex gap-2 px-6 pb-4 border-b border-ink-200">
                {[
                  { id: 'profile', label: t('dashboard.tabs.profile'), icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                  { id: 'links', label: t('dashboard.tabs.links'), icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
                  { id: 'contacts', label: t('dashboard.tabs.contacts'), icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                  { id: 'uploads', label: t('dashboard.tabs.uploads'), icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' },
                  { id: 'background', label: t('dashboard.tabs.background'), icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
                  { id: 'theme', label: t('dashboard.tabs.theme'), icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
                  { id: 'popup', label: t('dashboard.tabs.popup'), icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
                  { id: 'qrcode', label: t('dashboard.tabs.qrcode'), icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all touch-target ${
                      activeTab === tab.id
                        ? 'bg-ink-900 text-white shadow-elevation-2'
                        : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                    </svg>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Desktop: Standard Tabs */}
            <nav className="hidden sm:flex gap-1 border-b border-ink-200 overflow-x-auto scrollbar-hide">
              {[
                { id: 'profile', label: t('dashboard.tabs.profile') },
                { id: 'links', label: t('dashboard.tabs.links') },
                { id: 'contacts', label: t('dashboard.tabs.contacts') },
                { id: 'uploads', label: t('dashboard.tabs.uploads') },
                { id: 'background', label: t('dashboard.tabs.background') },
                { id: 'theme', label: t('dashboard.tabs.theme') },
                { id: 'popup', label: t('dashboard.tabs.popup') },
                { id: 'qrcode', label: t('dashboard.tabs.qrcode') },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={activeTab === tab.id ? 'tab-active' : 'tab'}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

      {/* Tab Content */}
      {renderTabContent()}
        </>
      )}
    </DashboardLayout>
  );
};
