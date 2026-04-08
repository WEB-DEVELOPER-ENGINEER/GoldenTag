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

  useEffect(() => {
    fetchUserDetail();
    fetchAdminLogs();
  }, [userId]);

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
                </div>
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
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                {user.isActive ? (
                  <button
                    onClick={handleDeactivate}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'Processing...' : 'Deactivate Account'}
                  </button>
                ) : (
                  <button
                    onClick={handleReactivate}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'Processing...' : 'Reactivate Account'}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
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
