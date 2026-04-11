import React, { useState, useEffect } from 'react';
import { UserDetail, AdminActionLog, EditForm, ProfileForm, ThemeForm, PopupForm } from './types';
import { AccountTab } from './AccountTab';
import { ProfileTab } from './ProfileTab';
import { ThemeTab } from './ThemeTab';
import { PopupTab } from './PopupTab';
import { ActivityTab } from './ActivityTab';

interface UserDetailModalProps {
  userId: string;
  token: string;
  onClose: () => void;
  onUserUpdated: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  userId,
  token,
  onClose,
  onUserUpdated,
}) => {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [logs, setLogs] = useState<AdminActionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'account' | 'profile' | 'theme' | 'popup' | 'logs'>('account');
  const [hasChanges, setHasChanges] = useState(false);
  
  const [editForm, setEditForm] = useState<EditForm>({
    email: '',
    username: '',
    role: 'user',
    isActive: true,
  });
  
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  
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

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchUserDetail();
    fetchAdminLogs();
  }, [userId]);

  useEffect(() => {
    if (user) {
      setEditForm({
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
      });
      
      if (user.profile) {
        setProfileForm({
          displayName: user.profile.displayName,
          bio: user.profile.bio || '',
          avatarUrl: user.profile.avatarUrl || '',
          backgroundType: user.profile.backgroundType,
          backgroundColor: user.profile.backgroundColor || '#ffffff',
          backgroundImageUrl: user.profile.backgroundImageUrl || '',
          isPublished: user.profile.isPublished,
        });
        
        if (user.profile.theme) {
          setThemeForm({
            mode: user.profile.theme.mode,
            primaryColor: user.profile.theme.primaryColor,
            secondaryColor: user.profile.theme.secondaryColor,
            textColor: user.profile.theme.textColor,
            fontFamily: user.profile.theme.fontFamily,
            layout: user.profile.theme.layout,
            buttonStyle: user.profile.theme.buttonStyle,
          });
        }
        
        if (user.profile.popup) {
          setPopupForm({
            isEnabled: user.profile.popup.isEnabled,
            message: user.profile.popup.message,
            duration: user.profile.popup.duration || 5000,
            backgroundColor: user.profile.popup.backgroundColor,
            textColor: user.profile.popup.textColor,
          });
        }
      }
    }
  }, [user]);

  const fetchUserDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/api/admin/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminLogs = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/logs?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin logs:', err);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Are you sure you want to deactivate this user account?')) return;

    try {
      setActionLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/api/admin/users/${userId}/deactivate`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to deactivate user');
      }

      await fetchUserDetail();
      await fetchAdminLogs();
      onUserUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!confirm('Are you sure you want to reactivate this user account?')) return;

    try {
      setActionLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/api/admin/users/${userId}/activate`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to reactivate user');
      }

      await fetchUserDetail();
      await fetchAdminLogs();
      onUserUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setActionLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: editForm.email,
          username: editForm.username,
          role: editForm.role.toUpperCase(),
          isActive: editForm.isActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update user');
      }

      await fetchUserDetail();
      await fetchAdminLogs();
      onUserUpdated();
      setHasChanges(false);
      alert('Account updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/api/admin/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to reset password');
      }

      await fetchAdminLogs();
      setShowPasswordReset(false);
      setNewPassword('');
      alert('Password reset successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setActionLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/api/admin/users/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update profile');
      }

      await fetchUserDetail();
      await fetchAdminLogs();
      setHasChanges(false);
      alert('Profile updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTheme = async () => {
    try {
      setActionLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/api/admin/users/${userId}/theme`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(themeForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update theme');
      }

      await fetchUserDetail();
      await fetchAdminLogs();
      setHasChanges(false);
      alert('Theme updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePopup = async () => {
    try {
      setActionLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/api/admin/users/${userId}/popup`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(popupForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update popup');
      }

      await fetchUserDetail();
      await fetchAdminLogs();
      setHasChanges(false);
      alert('Popup updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(false);
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

      const response = await fetch(`${apiUrl}/api/admin/users/${userId}/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const data = await response.json();
      setProfileForm({ ...profileForm, avatarUrl: data.avatarUrl });
      await fetchUserDetail();
      alert('Avatar uploaded successfully!');
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

      const response = await fetch(`${apiUrl}/api/admin/users/${userId}/background`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload background');
      }

      const data = await response.json();
      setProfileForm({ ...profileForm, backgroundImageUrl: data.backgroundImageUrl });
      await fetchUserDetail();
      alert('Background uploaded successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload background');
    } finally {
      setUploadingBackground(false);
    }
  };

  const renderTabContent = () => {
    if (!user) return null;

    switch (activeTab) {
      case 'account':
        return (
          <AccountTab
            user={user}
            editForm={editForm}
            setEditForm={setEditForm}
            setHasChanges={setHasChanges}
            showPasswordReset={showPasswordReset}
            setShowPasswordReset={setShowPasswordReset}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            handlePasswordReset={handlePasswordReset}
            handleDeactivate={handleDeactivate}
            handleReactivate={handleReactivate}
            actionLoading={actionLoading}
          />
        );
      case 'profile':
        return (
          <ProfileTab
            user={user}
            profileForm={profileForm}
            setProfileForm={setProfileForm}
            setHasChanges={setHasChanges}
            uploadingAvatar={uploadingAvatar}
            uploadingBackground={uploadingBackground}
            handleAvatarUpload={handleAvatarUpload}
            handleBackgroundUpload={handleBackgroundUpload}
          />
        );
      case 'theme':
        return (
          <ThemeTab
            user={user}
            themeForm={themeForm}
            setThemeForm={setThemeForm}
            setHasChanges={setHasChanges}
          />
        );
      case 'popup':
        return (
          <PopupTab
            user={user}
            popupForm={popupForm}
            setPopupForm={setPopupForm}
            setHasChanges={setHasChanges}
          />
        );
      case 'logs':
        return <ActivityTab logs={logs} />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'profile', label: 'Profile', icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'theme', label: 'Theme', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
    { id: 'popup', label: 'Popup', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
    { id: 'logs', label: 'Activity', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between text-white">
          <div>
            <h2 className="text-xl font-bold">Edit User</h2>
            {user && (
              <p className="text-sm text-blue-100 mt-1">
                {user.username} • {user.email}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
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
                    ? 'border-blue-600 text-blue-600'
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p className="text-gray-500 mt-4">Loading user details...</p>
              </div>
            </div>
          ) : user ? (
            <div className="max-w-3xl mx-auto">{renderTabContent()}</div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">User not found</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {user && activeTab !== 'logs' && (
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {hasChanges && (
                <span className="text-sm text-amber-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Unsaved changes
                </span>
              )}
            </div>
            <div className="flex gap-3">
              {activeTab === 'account' && (
                <>
                  <button
                    onClick={() => setShowPasswordReset(!showPasswordReset)}
                    className="px-4 py-2 bg-yellow-100 text-yellow-900 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={actionLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    {actionLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              )}
              {activeTab === 'profile' && (
                <button
                  onClick={handleUpdateProfile}
                  disabled={actionLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Save Profile
                    </>
                  )}
                </button>
              )}
              {activeTab === 'theme' && (
                <button
                  onClick={handleUpdateTheme}
                  disabled={actionLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Save Theme
                    </>
                  )}
                </button>
              )}
              {activeTab === 'popup' && (
                <button
                  onClick={handleUpdatePopup}
                  disabled={actionLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Save Popup
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
