// Tab render functions for UserDetailModal
import React from 'react';

export const renderAccountTabContent = (
  user: any,
  editForm: any,
  setEditForm: any,
  setHasChanges: any,
  showPasswordReset: boolean,
  setShowPasswordReset: any,
  newPassword: string,
  setNewPassword: any,
  handlePasswordReset: any,
  actionLoading: boolean,
  handleDeactivate: any,
  handleReactivate: any,
  handleDelete: any
) => {
  return (
    <div className="space-y-6">
      {/* Account Status Card */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            user.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {user.isActive ? '● Active' : '● Inactive'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">User ID</p>
            <p className="font-mono text-gray-900 mt-1">{user.id.slice(0, 8)}...</p>
          </div>
          <div>
            <p className="text-gray-500">Joined</p>
            <p className="text-gray-900 mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Last Login</p>
            <p className="text-gray-900 mt-1">
              {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Profile Views</p>
            <p className="text-gray-900 mt-1">{user.profile?.viewCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => {
                setEditForm({ ...editForm, email: e.target.value });
                setHasChanges(true);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={editForm.username}
              onChange={(e) => {
                setEditForm({ ...editForm, username: e.target.value });
                setHasChanges(true);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={editForm.role}
              onChange={(e) => {
                setEditForm({ ...editForm, role: e.target.value as 'user' | 'admin' });
                setHasChanges(true);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="user">👤 User</option>
              <option value="admin">👑 Administrator</option>
            </select>
          </div>

          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="isActive"
              checked={editForm.isActive}
              onChange={(e) => {
                setEditForm({ ...editForm, isActive: e.target.checked });
                setHasChanges(true);
              }}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="ml-3 text-sm font-medium text-gray-700">
              Account is active and can log in
            </label>
          </div>
        </div>
      </div>

      {/* Password Reset */}
      {showPasswordReset && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Reset Password
          </h3>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password (min 8 characters)"
            className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-4"
          />
          <div className="flex gap-3">
            <button
              onClick={handlePasswordReset}
              disabled={actionLoading}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors font-medium"
            >
              {actionLoading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button
              onClick={() => {
                setShowPasswordReset(false);
                setNewPassword('');
              }}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
        <div className="space-y-3">
          {user.isActive ? (
            <button
              onClick={handleDeactivate}
              disabled={actionLoading}
              className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Deactivate Account
            </button>
          ) : (
            <button
              onClick={handleReactivate}
              disabled={actionLoading}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Reactivate Account
            </button>
          )}
          
          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete User Permanently
          </button>
        </div>
        <p className="text-xs text-red-600 mt-3">⚠️ These actions cannot be undone. Proceed with caution.</p>
      </div>
    </div>
  );
};
