import React, { useState, useEffect } from 'react';
import { ProfileForm, ThemeForm, PopupForm } from '../UserDetailModal/types';
import { ProfileTab } from '../UserDetailModal/ProfileTab';
import { ThemeTab } from '../UserDetailModal/ThemeTab';
import { PopupTab } from '../UserDetailModal/PopupTab';

interface CreateUserModalProps {
  token: string;
  onClose: () => void;
  onUserCreated: () => void;
}

interface AccountForm {
  email: string;
  username: string;
  password: string;
  role: 'user' | 'admin';
  isActive: boolean;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  token,
  onClose,
  onUserCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'account' | 'profile' | 'theme' | 'popup'>('account');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [accountForm, setAccountForm] = useState<AccountForm>({
    email: '',
    username: '',
    password: '',
    role: 'user',
    isActive: true,
  });

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    displayName: '',
    bio: '',
    avatarUrl: '',
    backgroundType: 'COLOR',
    backgroundColor: '#ffffff',
    backgroundImageUrl: '',
    isPublished: false,
  });

  const [themeForm, setThemeForm] = useState<ThemeForm>({
    mode: 'LIGHT',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    textColor: '#1f2937',
    fontFamily: 'Inter',
    layout: 'CENTERED',
    buttonStyle: 'ROUNDED',
  });

  const [popupForm, setPopupForm] = useState<PopupForm>({
    isEnabled: false,
    message: '',
    duration: 5000,
    backgroundColor: '#3b82f6',
    textColor: '#ffffff',
  });

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  
  // Track temporary file IDs for cleanup
  const [tempFileIds, setTempFileIds] = useState<string[]>([]);
  const [avatarTempId, setAvatarTempId] = useState<string | null>(null);
  const [backgroundTempId, setBackgroundTempId] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Auto-fill displayName when username changes
  useEffect(() => {
    if (accountForm.username && !profileForm.displayName) {
      setProfileForm(prev => ({ ...prev, displayName: accountForm.username }));
    }
  }, [accountForm.username]);

  // Cleanup temp files on unmount or cancel
  useEffect(() => {
    return () => {
      if (tempFileIds.length > 0) {
        cleanupTempFiles(tempFileIds);
      }
    };
  }, [tempFileIds]);

  const cleanupTempFiles = async (ids: string[]) => {
    if (ids.length === 0) return;
    
    try {
      await fetch(`${apiUrl}/api/admin/temp/cleanup`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tempIds: ids }),
      });
    } catch (error) {
      console.error('Failed to cleanup temp files:', error);
    }
  };

  const handleCreateUser = async () => {
    if (!accountForm.email || !accountForm.username || !accountForm.password) {
      setError('Email, username, and password are required');
      return;
    }

    if (accountForm.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Prepare comprehensive user data
      const userData: any = {
        ...accountForm,
        role: accountForm.role.toUpperCase(),
      };

      // Add profile data if any fields are filled
      if (profileForm.displayName || profileForm.bio || profileForm.avatarUrl || 
          profileForm.backgroundColor !== '#ffffff' || profileForm.backgroundImageUrl ||
          avatarTempId || backgroundTempId) {
        userData.profile = {
          displayName: profileForm.displayName,
          bio: profileForm.bio,
          avatarUrl: profileForm.avatarUrl,
          avatarTempId,
          backgroundType: profileForm.backgroundType,
          backgroundColor: profileForm.backgroundColor,
          backgroundImageUrl: profileForm.backgroundImageUrl,
          backgroundTempId,
          isPublished: profileForm.isPublished,
        };
      }

      // Add theme if customized
      const hasCustomTheme = 
        themeForm.mode !== 'LIGHT' ||
        themeForm.primaryColor !== '#3b82f6' ||
        themeForm.secondaryColor !== '#8b5cf6' ||
        themeForm.textColor !== '#1f2937' ||
        themeForm.fontFamily !== 'Inter' ||
        themeForm.layout !== 'CENTERED' ||
        themeForm.buttonStyle !== 'ROUNDED';

      if (hasCustomTheme) {
        userData.theme = themeForm;
      }

      // Add popup if enabled or has message
      if (popupForm.isEnabled || popupForm.message) {
        userData.popup = popupForm;
      }

      // Include temp file IDs for cleanup
      userData.tempIds = tempFileIds;

      // Create user with all data in one request
      const response = await fetch(`${apiUrl}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create user');
      }

      // Clear temp file tracking since they've been committed
      setTempFileIds([]);
      
      onUserCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      setError(null);

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${apiUrl}/api/admin/temp/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const data = await response.json();
      
      // Update form with temp URL for preview
      setProfileForm({ ...profileForm, avatarUrl: data.tempUrl });
      
      // Track temp file ID
      setAvatarTempId(data.tempId);
      setTempFileIds(prev => [...prev, data.tempId]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBackground(true);
      setError(null);

      const formData = new FormData();
      formData.append('background', file);

      const response = await fetch(`${apiUrl}/api/admin/temp/background`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload background');
      }

      const data = await response.json();
      
      // Update form with temp URL for preview
      setProfileForm({ ...profileForm, backgroundImageUrl: data.tempUrl });
      
      // Track temp file ID
      setBackgroundTempId(data.tempId);
      setTempFileIds(prev => [...prev, data.tempId]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload background');
    } finally {
      setUploadingBackground(false);
    }
  };

  const handleClose = () => {
    // Cleanup temp files before closing
    if (tempFileIds.length > 0) {
      cleanupTempFiles(tempFileIds);
    }
    onClose();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={accountForm.email}
                    onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountForm.username}
                    onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={accountForm.password}
                    onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Minimum 8 characters"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters required</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={accountForm.role}
                    onChange={(e) => setAccountForm({ ...accountForm, role: e.target.value as 'user' | 'admin' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={accountForm.isActive}
                    onChange={(e) => setAccountForm({ ...accountForm, isActive: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-3 text-sm font-medium text-gray-700">
                    Account is active
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Complete Setup</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Fill in the account details, then use the other tabs to customize the profile, theme, and popup settings. You can upload images directly!
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">Image Upload Enabled</p>
                  <p className="text-xs text-green-700 mt-1">
                    You can now upload images directly! Files are stored temporarily and will be committed when you create the user, or cleaned up if you cancel.
                  </p>
                </div>
              </div>
            </div>
            <ProfileTab
              user={{
                id: '',
                email: accountForm.email,
                username: accountForm.username,
                role: accountForm.role,
                isActive: accountForm.isActive,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLoginAt: null,
                profile: {
                  id: '',
                  displayName: profileForm.displayName,
                  bio: profileForm.bio,
                  avatarUrl: profileForm.avatarUrl,
                  backgroundType: profileForm.backgroundType,
                  backgroundColor: profileForm.backgroundColor,
                  backgroundImageUrl: profileForm.backgroundImageUrl,
                  isPublished: profileForm.isPublished,
                  viewCount: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              }}
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              setHasChanges={() => {}}
              uploadingAvatar={uploadingAvatar}
              uploadingBackground={uploadingBackground}
              handleAvatarUpload={handleAvatarUpload}
              handleBackgroundUpload={handleBackgroundUpload}
            />
          </div>
        );

      case 'theme':
        return (
          <ThemeTab
            user={{
              id: '',
              email: accountForm.email,
              username: accountForm.username,
              role: accountForm.role,
              isActive: accountForm.isActive,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLoginAt: null,
              profile: {
                id: '',
                displayName: profileForm.displayName,
                bio: profileForm.bio,
                avatarUrl: profileForm.avatarUrl,
                backgroundType: profileForm.backgroundType,
                backgroundColor: profileForm.backgroundColor,
                backgroundImageUrl: profileForm.backgroundImageUrl,
                isPublished: profileForm.isPublished,
                viewCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                theme: {
                  id: '',
                  mode: themeForm.mode,
                  primaryColor: themeForm.primaryColor,
                  secondaryColor: themeForm.secondaryColor,
                  textColor: themeForm.textColor,
                  fontFamily: themeForm.fontFamily,
                  layout: themeForm.layout,
                  buttonStyle: themeForm.buttonStyle,
                },
              },
            }}
            themeForm={themeForm}
            setThemeForm={setThemeForm}
            setHasChanges={() => {}}
          />
        );

      case 'popup':
        return (
          <PopupTab
            user={{
              id: '',
              email: accountForm.email,
              username: accountForm.username,
              role: accountForm.role,
              isActive: accountForm.isActive,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLoginAt: null,
              profile: {
                id: '',
                displayName: profileForm.displayName,
                bio: profileForm.bio,
                avatarUrl: profileForm.avatarUrl,
                backgroundType: profileForm.backgroundType,
                backgroundColor: profileForm.backgroundColor,
                backgroundImageUrl: profileForm.backgroundImageUrl,
                isPublished: profileForm.isPublished,
                viewCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            }}
            popupForm={popupForm}
            setPopupForm={setPopupForm}
            setHasChanges={() => {}}
          />
        );

      default:
        return null;
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'profile', label: 'Profile', icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'theme', label: 'Theme', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
    { id: 'popup', label: 'Popup', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4 flex items-center justify-between text-white">
          <div>
            <h2 className="text-xl font-bold">Create New User</h2>
            <p className="text-sm text-green-100 mt-1">
              Set up a complete user account with profile, theme, and popup
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50 px-6">
          <nav className="flex space-x-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">{renderTabContent()}</div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {activeTab === 'account' && <span>Required fields marked with *</span>}
            {activeTab !== 'account' && <span>Optional: Customize before creating</span>}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateUser}
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Create User
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
