import React, { useState, useEffect } from 'react';

interface UserDetail {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  profile?: {
    id: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    backgroundType: 'COLOR' | 'IMAGE';
    backgroundColor: string | null;
    backgroundImageUrl: string | null;
    isPublished: boolean;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
    theme?: {
      id: string;
      mode: 'LIGHT' | 'DARK';
      primaryColor: string;
      secondaryColor: string;
      textColor: string;
      fontFamily: string;
      layout: 'CENTERED' | 'LEFT' | 'RIGHT';
      buttonStyle: 'ROUNDED' | 'SQUARE' | 'PILL';
    };
    popup?: {
      id: string;
      isEnabled: boolean;
      message: string;
      duration: number | null;
      backgroundColor: string;
      textColor: string;
    };
  };
}

interface AdminActionLog {
  adminId: string;
  action: string;
  targetUserId: string;
  timestamp: string;
}

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
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    email: '',
    username: '',
    role: 'user' as 'user' | 'admin',
    isActive: true,
  });
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [editingSection, setEditingSection] = useState<'account' | 'profile' | 'theme' | 'popup' | null>(null);
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    bio: '',
    avatarUrl: '',
    backgroundType: 'COLOR' as 'COLOR' | 'IMAGE',
    backgroundColor: '#ffffff',
    backgroundImageUrl: '',
    isPublished: false,
  });
  const [themeForm, setThemeForm] = useState({
    mode: 'LIGHT' as 'LIGHT' | 'DARK',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    textColor: '#1f2937',
    fontFamily: 'Inter',
    layout: 'CENTERED' as 'CENTERED' | 'LEFT' | 'RIGHT',
    buttonStyle: 'ROUNDED' as 'ROUNDED' | 'SQUARE' | 'PILL',
  });
  const [popupForm, setPopupForm] = useState({
    isEnabled: false,
    message: '',
    duration: 5000,
    backgroundColor: '#3b82f6',
    textColor: '#ffffff',
  });

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

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/users/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/logs?userId=${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin logs:', err);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Are you sure you want to deactivate this user account?')) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/users/${userId}/deactivate`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

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
    if (!confirm('Are you sure you want to reactivate this user account?')) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/users/${userId}/activate`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

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

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/users/${userId}`,
        {
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
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update user');
      }

      await fetchUserDetail();
      await fetchAdminLogs();
      onUserUpdated();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to PERMANENTLY DELETE this user? This action cannot be undone!')) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to delete user');
      }

      onUserUpdated();
      onClose();
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

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/users/${userId}/password`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password: newPassword }),
        }
      );

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

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/users/${userId}/profile`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileForm),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update profile');
      }

      await fetchUserDetail();
      await fetchAdminLogs();
      setEditingSection(null);
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

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/users/${userId}/theme`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(themeForm),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update theme');
      }

      await fetchUserDetail();
      await fetchAdminLogs();
      setEditingSection(null);
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

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/users/${userId}/popup`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(popupForm),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update popup');
      }

      await fetchUserDetail();
      await fetchAdminLogs();
      setEditingSection(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">Loading user details...</p>
            </div>
          ) : user ? (
            <div className="space-y-6">
              {/* User Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                {isEditing ? (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'user' | 'admin' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={editForm.isActive}
                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                        Account Active
                      </label>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={handleUpdate}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {actionLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            email: user!.email,
                            username: user!.username,
                            role: user!.role,
                            isActive: user!.isActive,
                          });
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Username</p>
                        <p className="text-sm text-gray-900 mt-1">{user.username}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                        <p className="text-sm text-gray-900 mt-1">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Role</p>
                        <span className={`inline-flex mt-1 px-2 text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
                        <span className={`inline-flex mt-1 px-2 text-xs leading-5 font-semibold rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Joined</p>
                        <p className="text-sm text-gray-900 mt-1">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Last Login</p>
                        <p className="text-sm text-gray-900 mt-1">
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString()
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit User Information
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Information */}
              {user.profile && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                  {editingSection === 'profile' ? (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                        <input
                          type="text"
                          value={profileForm.displayName}
                          onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                        <input
                          type="url"
                          value={profileForm.avatarUrl}
                          onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Background Type</label>
                        <select
                          value={profileForm.backgroundType}
                          onChange={(e) => setProfileForm({ ...profileForm, backgroundType: e.target.value as 'COLOR' | 'IMAGE' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="COLOR">Color</option>
                          <option value="IMAGE">Image</option>
                        </select>
                      </div>
                      {profileForm.backgroundType === 'COLOR' ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                          <input
                            type="color"
                            value={profileForm.backgroundColor}
                            onChange={(e) => setProfileForm({ ...profileForm, backgroundColor: e.target.value })}
                            className="w-full h-10 border border-gray-300 rounded-md"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Background Image URL</label>
                          <input
                            type="url"
                            value={profileForm.backgroundImageUrl}
                            onChange={(e) => setProfileForm({ ...profileForm, backgroundImageUrl: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isPublished"
                          checked={profileForm.isPublished}
                          onChange={(e) => setProfileForm({ ...profileForm, isPublished: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="isPublished" className="ml-2 text-sm font-medium text-gray-700">
                          Profile Published
                        </label>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={handleUpdateProfile}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {actionLoading ? 'Saving...' : 'Save Profile'}
                        </button>
                        <button
                          onClick={() => setEditingSection(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Display Name</p>
                          <p className="text-sm text-gray-900 mt-1">{user.profile.displayName || 'Not set'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Published</p>
                          <span className={`inline-flex mt-1 px-2 text-xs leading-5 font-semibold rounded-full ${
                            user.profile.isPublished
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.profile.isPublished ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">View Count</p>
                          <p className="text-sm text-gray-900 mt-1">{user.profile.viewCount}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Background</p>
                          <p className="text-sm text-gray-900 mt-1">{user.profile.backgroundType}</p>
                        </div>
                      </div>
                      {user.profile.bio && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Bio</p>
                          <p className="text-sm text-gray-900 mt-1">{user.profile.bio}</p>
                        </div>
                      )}
                      {user.profile.avatarUrl && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Avatar</p>
                          <img src={user.profile.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full mt-1" />
                        </div>
                      )}
                      <div className="pt-2">
                        <button
                          onClick={() => setEditingSection('profile')}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit Profile
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Theme Settings */}
              {user.profile?.theme && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Theme Settings</h3>
                  {editingSection === 'theme' ? (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                          <select
                            value={themeForm.mode}
                            onChange={(e) => setThemeForm({ ...themeForm, mode: e.target.value as 'LIGHT' | 'DARK' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="LIGHT">Light</option>
                            <option value="DARK">Dark</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Layout</label>
                          <select
                            value={themeForm.layout}
                            onChange={(e) => setThemeForm({ ...themeForm, layout: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="CENTERED">Centered</option>
                            <option value="LEFT">Left</option>
                            <option value="RIGHT">Right</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Button Style</label>
                          <select
                            value={themeForm.buttonStyle}
                            onChange={(e) => setThemeForm({ ...themeForm, buttonStyle: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="ROUNDED">Rounded</option>
                            <option value="SQUARE">Square</option>
                            <option value="PILL">Pill</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                          <input
                            type="text"
                            value={themeForm.fontFamily}
                            onChange={(e) => setThemeForm({ ...themeForm, fontFamily: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                          <input
                            type="color"
                            value={themeForm.primaryColor}
                            onChange={(e) => setThemeForm({ ...themeForm, primaryColor: e.target.value })}
                            className="w-full h-10 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                          <input
                            type="color"
                            value={themeForm.secondaryColor}
                            onChange={(e) => setThemeForm({ ...themeForm, secondaryColor: e.target.value })}
                            className="w-full h-10 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                          <input
                            type="color"
                            value={themeForm.textColor}
                            onChange={(e) => setThemeForm({ ...themeForm, textColor: e.target.value })}
                            className="w-full h-10 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={handleUpdateTheme}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {actionLoading ? 'Saving...' : 'Save Theme'}
                        </button>
                        <button
                          onClick={() => setEditingSection(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Mode</p>
                          <p className="text-sm text-gray-900 mt-1">{user.profile.theme.mode}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Layout</p>
                          <p className="text-sm text-gray-900 mt-1">{user.profile.theme.layout}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Button Style</p>
                          <p className="text-sm text-gray-900 mt-1">{user.profile.theme.buttonStyle}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Font</p>
                          <p className="text-sm text-gray-900 mt-1">{user.profile.theme.fontFamily}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Primary Color</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-6 h-6 rounded border" style={{ backgroundColor: user.profile.theme.primaryColor }}></div>
                            <span className="text-sm text-gray-900">{user.profile.theme.primaryColor}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Secondary Color</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-6 h-6 rounded border" style={{ backgroundColor: user.profile.theme.secondaryColor }}></div>
                            <span className="text-sm text-gray-900">{user.profile.theme.secondaryColor}</span>
                          </div>
                        </div>
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={() => setEditingSection('theme')}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit Theme
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Popup Settings */}
              {user.profile && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Popup Settings</h3>
                  {editingSection === 'popup' ? (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="popupEnabled"
                          checked={popupForm.isEnabled}
                          onChange={(e) => setPopupForm({ ...popupForm, isEnabled: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="popupEnabled" className="ml-2 text-sm font-medium text-gray-700">
                          Popup Enabled
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea
                          value={popupForm.message}
                          onChange={(e) => setPopupForm({ ...popupForm, message: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (ms)</label>
                        <input
                          type="number"
                          value={popupForm.duration}
                          onChange={(e) => setPopupForm({ ...popupForm, duration: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                          <input
                            type="color"
                            value={popupForm.backgroundColor}
                            onChange={(e) => setPopupForm({ ...popupForm, backgroundColor: e.target.value })}
                            className="w-full h-10 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                          <input
                            type="color"
                            value={popupForm.textColor}
                            onChange={(e) => setPopupForm({ ...popupForm, textColor: e.target.value })}
                            className="w-full h-10 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={handleUpdatePopup}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {actionLoading ? 'Saving...' : 'Save Popup'}
                        </button>
                        <button
                          onClick={() => setEditingSection(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {user.profile.popup ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
                              <span className={`inline-flex mt-1 px-2 text-xs leading-5 font-semibold rounded-full ${
                                user.profile.popup.isEnabled
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.profile.popup.isEnabled ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase">Duration</p>
                              <p className="text-sm text-gray-900 mt-1">{user.profile.popup.duration}ms</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Message</p>
                            <p className="text-sm text-gray-900 mt-1">{user.profile.popup.message || 'No message'}</p>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">No popup configured</p>
                      )}
                      <div className="pt-2">
                        <button
                          onClick={() => setEditingSection('popup')}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit Popup
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Admin Action Log */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Action Log</h3>
                {logs.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500">No admin actions recorded</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {logs.map((log, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {log.action.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-gray-500">
                            Admin ID: {log.adminId}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                {/* Password Reset Section */}
                {showPasswordReset ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Reset Password</h4>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 8 characters)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handlePasswordReset}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 text-sm"
                      >
                        {actionLoading ? 'Resetting...' : 'Reset Password'}
                      </button>
                      <button
                        onClick={() => {
                          setShowPasswordReset(false);
                          setNewPassword('');
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPasswordReset(true)}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 bg-yellow-100 text-yellow-900 rounded-md hover:bg-yellow-200 disabled:opacity-50 text-sm font-medium"
                  >
                    Reset Password
                  </button>
                )}

                {/* Primary Actions */}
                <div className="flex flex-wrap gap-2">
                  {user.isActive ? (
                    <button
                      onClick={handleDeactivate}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 text-sm"
                    >
                      {actionLoading ? 'Processing...' : 'Deactivate Account'}
                    </button>
                  ) : (
                    <button
                      onClick={handleReactivate}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                    >
                      {actionLoading ? 'Processing...' : 'Reactivate Account'}
                    </button>
                  )}
                  
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
                  >
                    {actionLoading ? 'Deleting...' : 'Delete User'}
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm ml-auto"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">User not found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
