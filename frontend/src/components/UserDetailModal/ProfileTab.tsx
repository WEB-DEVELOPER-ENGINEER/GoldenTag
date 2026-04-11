import React from 'react';
import { UserDetail, ProfileForm } from './types';

interface ProfileTabProps {
  user: UserDetail;
  profileForm: ProfileForm;
  setProfileForm: (form: ProfileForm) => void;
  setHasChanges: (value: boolean) => void;
  uploadingAvatar: boolean;
  uploadingBackground: boolean;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBackgroundUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  profileForm,
  setProfileForm,
  setHasChanges,
  uploadingAvatar,
  uploadingBackground,
  handleAvatarUpload,
  handleBackgroundUpload,
}) => {
  if (!user?.profile) return null;

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Avatar</h3>
        <div className="flex items-center gap-6">
          {profileForm.avatarUrl && (
            <img 
              src={profileForm.avatarUrl} 
              alt="Avatar" 
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
            />
          )}
          <div className="flex-1">
            <label className="block">
              <span className="sr-only">Choose avatar</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">Upload a new avatar image (JPG, PNG, max 5MB)</p>
            {uploadingAvatar && <p className="text-sm text-blue-600 mt-2">Uploading...</p>}
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Or paste Avatar URL</label>
          <input
            type="url"
            value={profileForm.avatarUrl}
            onChange={(e) => {
              setProfileForm({ ...profileForm, avatarUrl: e.target.value });
              setHasChanges(true);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
            <input
              type="text"
              value={profileForm.displayName}
              onChange={(e) => {
                setProfileForm({ ...profileForm, displayName: e.target.value });
                setHasChanges(true);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              value={profileForm.bio}
              onChange={(e) => {
                setProfileForm({ ...profileForm, bio: e.target.value });
                setHasChanges(true);
              }}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="isPublished"
              checked={profileForm.isPublished}
              onChange={(e) => {
                setProfileForm({ ...profileForm, isPublished: e.target.checked });
                setHasChanges(true);
              }}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isPublished" className="ml-3 text-sm font-medium text-gray-700">
              Profile is published and visible to public
            </label>
          </div>
        </div>
      </div>

      {/* Background Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Background</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Type</label>
            <select
              value={profileForm.backgroundType}
              onChange={(e) => {
                setProfileForm({ ...profileForm, backgroundType: e.target.value as 'COLOR' | 'IMAGE' });
                setHasChanges(true);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="COLOR">Solid Color</option>
              <option value="IMAGE">Image</option>
            </select>
          </div>

          {profileForm.backgroundType === 'COLOR' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={profileForm.backgroundColor}
                  onChange={(e) => {
                    setProfileForm({ ...profileForm, backgroundColor: e.target.value });
                    setHasChanges(true);
                  }}
                  className="w-20 h-12 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={profileForm.backgroundColor}
                  onChange={(e) => {
                    setProfileForm({ ...profileForm, backgroundColor: e.target.value });
                    setHasChanges(true);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          ) : (
            <div>
              {profileForm.backgroundImageUrl && (
                <div className="mb-4">
                  <img 
                    src={profileForm.backgroundImageUrl} 
                    alt="Background" 
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                </div>
              )}
              <label className="block mb-2">
                <span className="sr-only">Choose background image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  disabled={uploadingBackground}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
              </label>
              <p className="text-xs text-gray-500 mb-4">Upload a background image (JPG, PNG, max 5MB)</p>
              {uploadingBackground && <p className="text-sm text-blue-600 mb-2">Uploading...</p>}
              <label className="block text-sm font-medium text-gray-700 mb-2">Or paste Background URL</label>
              <input
                type="url"
                value={profileForm.backgroundImageUrl}
                onChange={(e) => {
                  setProfileForm({ ...profileForm, backgroundImageUrl: e.target.value });
                  setHasChanges(true);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/background.jpg"
              />
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Profile Views</p>
            <p className="text-2xl font-bold text-gray-900">{user.profile.viewCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Created</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(user.profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
