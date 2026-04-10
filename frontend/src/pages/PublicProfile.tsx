import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSocialIcon } from '../utils/socialIcons';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageSelector } from '../components/LanguageSelector';
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
  const { t } = useTranslation();
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
            throw new Error(t('public_profile.profile_not_found'));
          }
          throw new Error(t('errors.general'));
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-brand-50/30 to-accent-50/20">
        <div className="text-center animate-fade-in">
          <div className="spinner w-14 h-14 mx-auto mb-4"></div>
          <p className="text-neutral-600 font-medium">{t('public_profile.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-brand-50/30 to-accent-50/20 px-4">
        <div className="text-center max-w-md animate-slide-up">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
            <svg className="w-10 h-10 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">{t('public_profile.not_found')}</h1>
          <p className="text-lg text-neutral-600 mb-8">{error || t('public_profile.profile_not_found')}</p>
          <a
            href="/"
            className="btn-primary inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {t('public_profile.go_home')}
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
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.02)), url(${profile.backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      };
    } else if (profile.backgroundType === 'COLOR' && profile.backgroundColor) {
      // Check if it's a gradient or solid color
      if (profile.backgroundColor.includes('gradient')) {
        return {
          background: profile.backgroundColor,
        };
      } else {
        return {
          background: `linear-gradient(135deg, ${profile.backgroundColor} 0%, ${adjustColor(profile.backgroundColor, 10)} 100%)`,
        };
      }
    } else {
      return {
        background: theme.mode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
      };
    }
  };

  // Helper to adjust color brightness
  const adjustColor = (color: string, percent: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
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
      {/* Language Selector - Fixed position at top end (RTL-aware) */}
      <div className="fixed top-4 end-4 z-50">
        <LanguageSelector 
          variant="dropdown" 
          showFlags={true} 
          showLabels={false}
        />
      </div>

      <div className="profile-content animate-fade-in" style={{ textAlign: theme.layout === 'centered' ? 'center' : theme.layout }}>
        {/* Premium Popup Message */}
        {profile.popup && profile.popup.isEnabled && showPopup && profile.popup.message && (
          <div
            className="popup-message"
            style={{
              backgroundColor: profile.popup.backgroundColor,
              color: profile.popup.textColor,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
              <p style={{ fontSize: '0.9375rem', margin: 0, flex: 1, lineHeight: 1.5 }}>{profile.popup.message}</p>
              <button
                onClick={() => setShowPopup(false)}
                className="popup-close-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  fontWeight: '600',
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
          <div style={{ marginBottom: '1.5rem' }}>
            <img
              src={profile.avatarUrl}
              alt={`${profile.displayName}'s profile`}
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
            }}
          >
            {profile.bio}
          </p>
        )}

        {/* Links */}
        {visibleLinks.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {visibleLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-link"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${adjustColor(theme.primaryColor, -10)} 100%)`,
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: getButtonRadius(),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getSocialIcon(link.platform)}
                  {link.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Contacts */}
        {sortedContacts.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2
              className="section-header"
              style={{ color: theme.textColor }}
            >
              {t('public_profile.contact_information')}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {sortedContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="profile-contact"
                  style={{
                    backgroundColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                    color: theme.textColor,
                  }}
                >
                  <span className="font-semibold me-2">
                    {contact.label || (contact.type === 'email' ? t('public_profile.email') : t('public_profile.phone'))}
                  </span>
                  {contact.type === 'email' ? (
                    <a
                      href={`mailto:${contact.value}`}
                      style={{ color: theme.primaryColor, textDecoration: 'none', fontWeight: '500' }}
                    >
                      {contact.value}
                    </a>
                  ) : (
                    <a
                      href={`tel:${contact.value}`}
                      style={{ color: theme.primaryColor, textDecoration: 'none', fontWeight: '500' }}
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
          <div style={{ marginBottom: '2rem' }}>
            <h2
              className="section-header"
              style={{ color: theme.textColor }}
            >
              {t('public_profile.downloads')}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {sortedFiles.map((file) => (
                <a
                  key={file.id}
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="profile-file"
                  style={{
                    background: `linear-gradient(135deg, ${theme.secondaryColor} 0%, ${adjustColor(theme.secondaryColor, -10)} 100%)`,
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: getButtonRadius(),
                  }}
                >
                  <span className="me-2.5 text-xl">📄</span>
                  {file.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Powered by badge */}
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}` }}>
          <a
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8125rem',
              color: theme.textColor,
              opacity: 0.5,
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
          >
            <span>{t('public_profile.powered_by')}</span>
            <span style={{ fontWeight: '600' }}>{t('public_profile.profile_hub')}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
