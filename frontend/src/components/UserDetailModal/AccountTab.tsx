import React from 'react';
import { UserDetail, EditForm } from './types';

interface AccountTabProps {
  user: UserDetail;
  editForm: EditForm;
  setEditForm: (form: EditForm) => void;
  setHasChanges: (value: boolean) => void;
  showPasswordReset: boolean;
  setShowPasswordReset: (value: boolean) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  handlePasswordReset: () => void;
  handleDeactivate: () => void;
  handleReactivate: () => void;
  actionLoading: boolean;
}

export const AccountTab: React.FC<AccountTabProps> = ({
  user,
  editForm,
  setEditForm,
  setHasChanges,
  showPasswordReset,
  setShowPasswordReset,
  newPassword,
  setNewPassword,
  handlePasswordReset,
  handleDeactivate,
  handleReactivate,
  actionLoading,
}) => {
  return (
    <div className="space-y-6">
      {/* Account Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              checked={editForm.isActive}
              onChange={(e) => {
                setEditForm({ ...editForm, isActive: e.target.checked });
                setHasChanges(true);
              }}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="ml-3 text-sm font-medium text-gray-700">
              Account is active
            </label>
          </div>
        </div>
      </div>

      {/* Password Reset */}
      {showPasswordReset && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reset Password</h3>
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
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
            >
              {actionLoading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button
              onClick={() => {
                setShowPasswordReset(false);
                setNewPassword('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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
              className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              Deactivate Account
            </button>
          ) : (
            <button
              onClick={handleReactivate}
              disabled={actionLoading}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Reactivate Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
