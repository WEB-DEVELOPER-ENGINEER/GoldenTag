import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const QRCodeGenerator: React.FC = () => {
  const { token } = useAuth();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch QR code on component mount
  useEffect(() => {
    fetchQRCode();
  }, []);

  const fetchQRCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/qrcode`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch QR code');
      }

      const data = await response.json();
      setQrCodeDataUrl(data.qrCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/qrcode/download`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to download QR code');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'profile-qrcode.png';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download QR code');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRefresh = () => {
    fetchQRCode();
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">QR Code</h2>
        <p className="text-sm text-gray-600 mb-4">
          Share your profile with a scannable QR code. Perfect for business cards, posters, or digital displays.
        </p>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Generating QR code...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* QR Code Display */}
        {qrCodeDataUrl && !isLoading && (
          <div className="space-y-4">
            <div className="flex justify-center p-6 bg-white rounded-lg border-2 border-gray-200">
              <img
                src={qrCodeDataUrl}
                alt="Profile QR Code"
                className="w-64 h-64"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    <span>Download QR Code</span>
                  </>
                )}
              </button>

              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                title="Refresh QR code"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>

            {/* Usage Instructions */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">How to use:</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Download the QR code and add it to your business cards or marketing materials</li>
                <li>Display it at events or on digital screens</li>
                <li>Anyone can scan it with their phone camera to visit your profile</li>
                <li>The QR code automatically updates when you change your profile URL</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
