import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './PublicProfile.css';

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

interface Profile {
  id: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  backgroundType: 'COLOR' | 'IMAGE';
  backgroundColor: string | null;
  backgroundImageUrl: string | null;
  theme: ThemeSettings;
  links: Link[];
  contacts: Contact[];
  files: FileItem[];
  popup: Popup | null;
}

interface ProfileData {
  username: string;
  profile: Profile;
}

export const PublicProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/profiles/${username}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Profile not found');
          }
          throw new Error('Failed to load profile');
        }

        const data = await response.json();
        setProfileData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  useEffect(() => {
    // Handle popup auto-dismiss based on duration
    if (profileData?.profile.popup?.isEnabled && profileData.profile.popup.duration) {
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, profileData.profile.popup.duration);

      return () => clearTimeout(timer);
    }
  }, [profileData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-4">{error || 'Profile not found'}</p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  const { profile } = profileData;
  const theme = profile.theme;

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

  const getBackgroundStyle = (): React.CSSProperties => {
    if (profile.backgroundType === 'IMAGE' && profile.backgroundImageUrl) {
      return {
        backgroundImage: `url(${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${profile.backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      };
    } else if (profile.backgroundType === 'COLOR' && profile.backgroundColor) {
      return {
        backgroundColor: profile.backgroundColor,
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
  };

  const visibleLinks = profile.links
    .filter(link => link.isVisible)
    .sort((a, b) => a.order - b.order);
  const sortedContacts = [...profile.contacts].sort((a, b) => a.order - b.order);
  const sortedFiles = [...profile.files].sort((a, b) => a.order - b.order);

  return (
    <div className="profile-container" style={containerStyle}>
      <div className="profile-content" style={{ textAlign: theme.layout === 'centered' ? 'center' : theme.layout }}>
        {/* Popup Message */}
        {profile.popup && profile.popup.isEnabled && showPopup && profile.popup.message && (
          <div
            className="popup-message"
            style={{
              backgroundColor: profile.popup.backgroundColor,
              color: profile.popup.textColor,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <p style={{ fontSize: '14px', margin: 0, flex: 1 }}>{profile.popup.message}</p>
              <button
                onClick={() => setShowPopup(false)}
                className="popup-close-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  opacity: 0.7,
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
                aria-label="Close popup"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Profile Picture */}
        {profile.avatarUrl && (
          <div style={{ marginBottom: '16px' }}>
            <img
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${profile.avatarUrl}`}
              alt={`${profile.displayName}'s profile picture`}
              className="profile-avatar"
            />
          </div>
        )}

        {/* Display Name */}
        {profile.displayName && (
          <h1
            className="profile-title"
            style={{
              color: theme.textColor,
            }}
          >
            {profile.displayName}
          </h1>
        )}

        {/* Bio */}
        {profile.bio && (
          <p
            className="profile-bio"
            style={{
              color: theme.textColor,
              opacity: 0.8,
            }}
          >
            {profile.bio}
          </p>
        )}

        {/* Links */}
        {visibleLinks.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {visibleLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-link"
                  style={{
                    backgroundColor: theme.primaryColor,
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: getButtonRadius(),
                    fontWeight: '500',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {link.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Contacts */}
        {sortedContacts.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2
              style={{
                fontSize: '14px',
                opacity: 0.6,
                marginBottom: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Contact Information
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sortedContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="profile-contact"
                  style={{
                    backgroundColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <span style={{ fontWeight: '600', marginRight: '8px' }}>
                    {contact.label || (contact.type === 'email' ? 'Email' : 'Phone')}:
                  </span>
                  {contact.type === 'email' ? (
                    <a
                      href={`mailto:${contact.value}`}
                      style={{ color: theme.primaryColor, textDecoration: 'none' }}
                    >
                      {contact.value}
                    </a>
                  ) : (
                    <a
                      href={`tel:${contact.value}`}
                      style={{ color: theme.primaryColor, textDecoration: 'none' }}
                    >
                      {contact.value}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        {sortedFiles.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2
              style={{
                fontSize: '14px',
                opacity: 0.6,
                marginBottom: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Downloads
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sortedFiles.map((file) => (
                <a
                  key={file.id}
                  href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${file.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="profile-file"
                  style={{
                    backgroundColor: theme.secondaryColor,
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: getButtonRadius(),
                    fontWeight: '500',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <span style={{ marginRight: '10px', fontSize: '18px' }}>📄</span>
                  {file.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
