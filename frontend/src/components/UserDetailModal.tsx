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
    isPublished: boolean;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
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
                        <p className="text-xs font-medium text-gray-500 uppercase">Profile Created</p>
                        <p className="text-sm text-gray-900 mt-1">
                          {new Date(user.profile.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {user.profile.bio && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Bio</p>
                        <p className="text-sm text-gray-900 mt-1">{user.profile.bio}</p>
                      </div>
                    )}
                  </div>
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
