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
    <div>
      <h2 className="text-2xl font-bold text-ink-900 mb-3 tracking-tight">QR Code</h2>
      <p className="text-sm text-ink-600 mb-6 leading-relaxed">
        Share your profile with a scannable QR code. Perfect for business cards, posters, or digital displays.
      </p>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-12 bg-ink-50 rounded-2xl border border-ink-200">
          <div className="text-center">
            <div className="spinner w-12 h-12 mx-auto mb-4"></div>
            <p className="text-sm text-ink-600 font-medium">Generating QR code...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-sm text-red-700 font-medium mb-3">{error}</p>
          <button
            onClick={handleRefresh}
            className="btn-secondary text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* QR Code Display */}
      {qrCodeDataUrl && !isLoading && (
        <div className="space-y-6">
          <div className="flex justify-center p-8 bg-white rounded-2xl border border-ink-200 shadow-elevation-1">
            <img
              src={qrCodeDataUrl}
              alt="Profile QR Code"
              className="w-full max-w-[256px] h-auto"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isDownloading ? (
                <>
                  <div className="spinner w-4 h-4"></div>
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
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
              className="btn-secondary flex items-center justify-center gap-2 sm:w-auto"
              title="Refresh QR code"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="sm:hidden">Refresh</span>
            </button>
          </div>

          {/* Usage Instructions */}
          <div className="p-5 bg-gold-50 border border-gold-100 rounded-xl">
            <h3 className="text-sm font-bold text-ink-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How to use
            </h3>
            <ul className="text-sm text-ink-700 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-gold-600 mt-0.5">•</span>
                <span>Download and add to business cards or marketing materials</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-600 mt-0.5">•</span>
                <span>Display at events or on digital screens</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-600 mt-0.5">•</span>
                <span>Anyone can scan with their phone camera to visit your profile</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-600 mt-0.5">•</span>
                <span>Updates automatically when you change your profile URL</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
