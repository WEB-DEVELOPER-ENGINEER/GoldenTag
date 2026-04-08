import React from 'react';

interface ThemeSettings {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  fontFamily: string;
  layout: 'centered' | 'left' | 'right';
  buttonStyle: 'rounded' | 'square' | 'pill';
}

interface Link {
  id: string;
  type: 'platform' | 'custom';
  platform?: string;
  title: string;
  url: string;
  icon?: string;
  isVisible: boolean;
  order: number;
}

interface Contact {
  id: string;
  type: 'email' | 'phone';
  value: string;
  label?: string;
  order: number;
}

interface FileItem {
  id: string;
  title: string;
  filename: string;
  fileUrl: string;
  order: number;
}

interface Popup {
  isEnabled: boolean;
  message: string;
  duration?: number;
  backgroundColor: string;
  textColor: string;
}

interface ProfileData {
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  backgroundType: 'color' | 'image';
  backgroundColor: string | null;
  backgroundImageUrl: string | null;
}

interface PreviewPanelProps {
  profileData: ProfileData;
  theme: ThemeSettings;
  links: Link[];
  contacts: Contact[];
  files: FileItem[];
  popup: Popup | null;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  profileData,
  theme,
  links,
  contacts,
  files,
  popup,
}) => {
  const getButtonRadius = () => {
    switch (theme.buttonStyle) {
      case 'square':
        return '0px';
      case 'pill':
        return '9999px';
      case 'rounded':
      default:
        return '8px';
    }
  };

  const getLayoutAlignment = () => {
    switch (theme.layout) {
      case 'left':
        return 'flex-start';
      case 'right':
        return 'flex-end';
      case 'centered':
      default:
        return 'center';
    }
  };

  const getBackgroundStyle = () => {
    if (profileData.backgroundType === 'image' && profileData.backgroundImageUrl) {
      return {
        backgroundImage: `url(${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${profileData.backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    } else if (profileData.backgroundType === 'color' && profileData.backgroundColor) {
      return {
        backgroundColor: profileData.backgroundColor,
      };
    } else {
      return {
        backgroundColor: theme.mode === 'dark' ? '#1F2937' : '#F9FAFB',
      };
    }
  };

  const containerStyle: React.CSSProperties = {
    ...getBackgroundStyle(),
    color: theme.textColor,
    fontFamily: theme.fontFamily,
    minHeight: '500px',
    padding: '24px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: getLayoutAlignment(),
  };

  const visibleLinks = links.filter(link => link.isVisible).sort((a, b) => a.order - b.order);
  const sortedContacts = [...contacts].sort((a, b) => a.order - b.order);
  const sortedFiles = [...files].sort((a, b) => a.order - b.order);

  const hasContent = profileData.displayName || profileData.bio || profileData.avatarUrl || 
                     visibleLinks.length > 0 || sortedContacts.length > 0 || sortedFiles.length > 0;

  return (
    <div style={containerStyle}>
      {/* Popup Message */}
      {popup && popup.isEnabled && popup.message && (
        <div
          style={{
            backgroundColor: popup.backgroundColor,
            color: popup.textColor,
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '600px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <p style={{ fontSize: '14px', margin: 0, flex: 1 }}>{popup.message}</p>
            <button
              style={{
                marginLeft: '8px',
                background: 'none',
                border: 'none',
                color: 'inherit',
                opacity: 0.7,
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Profile Picture */}
      {profileData.avatarUrl && (
        <div style={{ marginBottom: '16px' }}>
          <img
            src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${profileData.avatarUrl}`}
            alt="Profile"
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid white',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          />
        </div>
      )}

      {/* Display Name */}
      {profileData.displayName && (
        <h3
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            margin: '0 0 8px 0',
            color: theme.textColor,
          }}
        >
          {profileData.displayName}
        </h3>
      )}

      {/* Bio */}
      {profileData.bio && (
        <p
          style={{
            fontSize: '14px',
            margin: '0 0 24px 0',
            color: theme.textColor,
            opacity: 0.8,
            maxWidth: '600px',
            textAlign: theme.layout === 'centered' ? 'center' : theme.layout,
          }}
        >
          {profileData.bio}
        </p>
      )}

      {/* Links */}
      {visibleLinks.length > 0 && (
        <div style={{ width: '100%', maxWidth: '600px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {visibleLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  backgroundColor: theme.primaryColor,
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: getButtonRadius(),
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {link.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Contacts */}
      {sortedContacts.length > 0 && (
        <div style={{ width: '100%', maxWidth: '600px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '8px', fontWeight: '500' }}>
            Contact Information
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sortedContacts.map((contact) => (
              <div
                key={contact.id}
                style={{
                  padding: '12px',
                  backgroundColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
              >
                <span style={{ fontWeight: '500' }}>
                  {contact.label || contact.type}:
                </span>{' '}
                {contact.value}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      {sortedFiles.length > 0 && (
        <div style={{ width: '100%', maxWidth: '600px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '8px', fontWeight: '500' }}>
            Downloads
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sortedFiles.map((file) => (
              <a
                key={file.id}
                href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${file.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: theme.secondaryColor,
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: getButtonRadius(),
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <span style={{ marginRight: '8px' }}>📄</span>
                {file.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasContent && (
        <div style={{ textAlign: 'center', opacity: 0.5, padding: '40px 0' }}>
          <p style={{ fontSize: '14px', margin: 0 }}>
            Start editing your profile to see a preview
          </p>
        </div>
      )}
    </div>
  );
};
