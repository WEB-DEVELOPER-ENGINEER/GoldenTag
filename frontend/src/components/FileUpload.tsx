import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface FileUploadProps {
  type: 'avatar' | 'background' | 'pdf';
  onUploadSuccess?: (fileUrl: string) => void;
  currentFile?: string | null;
}

const FILE_CONFIGS = {
  avatar: {
    endpoint: '/api/profiles/me/avatar',
    fieldName: 'avatar',
    accept: 'image/jpeg,image/png,image/webp',
    maxSize: 5 * 1024 * 1024, // 5MB
    label: 'Profile Picture',
    description: 'Upload a profile picture (JPEG, PNG, or WebP, max 5MB)',
  },
  background: {
    endpoint: '/api/profiles/me/background',
    fieldName: 'background',
    accept: 'image/jpeg,image/png,image/webp',
    maxSize: 10 * 1024 * 1024, // 10MB
    label: 'Background Image',
    description: 'Upload a background image (JPEG, PNG, or WebP, max 10MB)',
  },
  pdf: {
    endpoint: '/api/files/upload',
    fieldName: 'pdf',
    accept: 'application/pdf',
    maxSize: 10 * 1024 * 1024, // 10MB
    label: 'PDF Document',
    description: 'Upload a PDF file (max 10MB)',
  },
};

export const FileUpload: React.FC<FileUploadProps> = ({ type, onUploadSuccess, currentFile }) => {
  const { token } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = FILE_CONFIGS[type];

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > config.maxSize) {
      return `File size exceeds ${config.maxSize / (1024 * 1024)}MB limit`;
    }

    // Check file type
    const acceptedTypes = config.accept.split(',');
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted types: ${config.accept}`;
    }

    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccessMessage(null);
    setSelectedFileName(file.name);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFileName(null);
      return;
    }
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setError('Please select a file first');
      return;
    }

    const file = fileInputRef.current.files[0];
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append(config.fieldName, file);

      // For PDF uploads, add title
      if (type === 'pdf') {
        formData.append('title', file.name.replace('.pdf', ''));
      }

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          setSuccessMessage('File uploaded successfully!');
          setSelectedFileName(null);
          
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }

          // Notify parent component
          if (onUploadSuccess) {
            // Handle different response structures
            let fileUrl: string;
            if (type === 'avatar') {
              fileUrl = response.avatarUrl;
            } else if (type === 'background') {
              fileUrl = response.backgroundImageUrl;
            } else {
              fileUrl = response.fileUrl;
            }
            onUploadSuccess(fileUrl);
          }

          // Clear success message after 3 seconds
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          const errorData = JSON.parse(xhr.responseText);
          throw new Error(errorData.error?.message || 'Upload failed');
        }
        setIsUploading(false);
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        setError('Network error occurred during upload');
        setIsUploading(false);
      });

      xhr.open('POST', `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${config.endpoint}`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {config.label}
        </label>
        <p className="text-xs text-gray-500 mb-3">{config.description}</p>

        {/* Current File Display */}
        {currentFile && type !== 'pdf' && (
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-1">Current:</p>
            <img
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${currentFile}`}
              alt="Current file"
              className="w-32 h-32 object-cover rounded-md border border-gray-200"
            />
          </div>
        )}

        {/* File Input */}
        <div className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={config.accept}
            onChange={handleFileSelect}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
        </div>

        {/* Selected File Name */}
        {selectedFileName && (
          <p className="text-sm text-gray-600 mt-2">
            Selected: {selectedFileName}
          </p>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{successMessage}</p>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={isUploading || !selectedFileName}
          className="mt-3 w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
};
