import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileData {
  displayName: string;
  bio: string;
}

interface ProfileEditorProps {
  onProfileUpdate?: (profile: ProfileData) => void;
  initialData?: ProfileData;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ onProfileUpdate, initialData }) => {
  const { token } = useAuth();
  const [displayName, setDisplayName] = useState(initialData?.displayName || '');
  const [bio, setBio] = useState(initialData?.bio || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Update form when initialData changes
  React.useEffect(() => {
    if (initialData) {
      setDisplayName(initialData.displayName || '');
      setBio(initialData.bio || '');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/profiles/me`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            displayName: displayName.trim(),
            bio: bio.trim() || null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update profile');
      }

      const updatedProfile = await response.json();
      setSuccessMessage('Profile updated successfully!');
      
      // Notify parent component of update
      if (onProfileUpdate) {
        onProfileUpdate({
          displayName: updatedProfile.displayName,
          bio: updatedProfile.bio || '',
        });
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink-900 mb-6 tracking-tight">Profile Information</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Display Name Field */}
        <div>
          <label htmlFor="displayName" className="block text-sm font-semibold text-ink-900 mb-2.5">
            Display Name
          </label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input"
            placeholder="Your name"
            required
          />
        </div>

        {/* Bio Field */}
        <div>
          <label htmlFor="bio" className="block text-sm font-semibold text-ink-900 mb-2.5">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="input resize-none"
            placeholder="Tell visitors about yourself..."
          />
          <p className="text-xs text-ink-500 mt-2.5 font-medium">
            {bio.length} characters
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-sage-50 border border-sage-100 rounded-xl">
            <p className="text-sm text-sage-700 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !displayName.trim()}
          className="btn-primary w-full"
        >
          {isLoading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};
