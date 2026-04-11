import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

export const QRCodeGenerator: React.FC = () => {
  const { token, user } = useAuth();
  const { t } = useTranslation();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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
      setError(err instanceof Error ? err.message : t('qrcode.fetch_failed'));
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
      setError(err instanceof Error ? err.message : t('qrcode.download_failed'));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRefresh = () => {
    fetchQRCode();
  };

  const getProfileUrl = () => {
    const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    return `${baseUrl}/${user?.username}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getProfileUrl());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError(t('qrcode.share_failed'));
    }
  };

  const handleShare = async () => {
    const profileUrl = getProfileUrl();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user?.username}'s Profile`,
          text: `Check out my profile!`,
          url: profileUrl,
        });
      } catch (err) {
        // User cancelled or share failed
        if ((err as Error).name !== 'AbortError') {
          setError(t('qrcode.share_failed'));
        }
      }
    } else {
      // Fallback to copy
      handleCopyLink();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink-900 mb-3 tracking-tight">{t('qrcode.title')}</h2>
      <p className="text-sm text-ink-600 mb-6 leading-relaxed">
        {t('qrcode.description')}
      </p>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-12 bg-ink-50 rounded-2xl border border-ink-200">
          <div className="text-center">
            <div className="spinner w-12 h-12 mx-auto mb-4"></div>
            <p className="text-sm text-ink-600 font-medium">{t('qrcode.generating')}</p>
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
            {t('common.try_again')}
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

          {/* Profile Link Section */}
          <div className="p-5 bg-ink-50 border border-ink-200 rounded-xl">
            <h3 className="text-sm font-bold text-ink-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {t('qrcode.profile_link')}
            </h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={getProfileUrl()}
                readOnly
                className="flex-1 px-4 py-2.5 bg-white border border-ink-200 rounded-lg text-sm text-ink-700 font-mono focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="btn-secondary flex items-center justify-center gap-2 flex-1 sm:flex-initial"
                >
                  {copySuccess ? (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{t('qrcode.link_copied')}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>{t('qrcode.copy_link')}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="btn-primary flex items-center justify-center gap-2 flex-1 sm:flex-initial"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>{t('qrcode.share')}</span>
                </button>
              </div>
            </div>
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
                  <span>{t('qrcode.downloading')}</span>
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
                  <span>{t('qrcode.download')}</span>
                </>
              )}
            </button>

            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="btn-secondary flex items-center justify-center gap-2 sm:w-auto"
              title={t('qrcode.refresh')}
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
              <span className="sm:hidden">{t('qrcode.refresh')}</span>
            </button>
          </div>

          {/* Usage Instructions */}
          <div className="p-5 bg-gold-50 border border-gold-100 rounded-xl">
            <h3 className="text-sm font-bold text-ink-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('qrcode.how_to_use')}
            </h3>
            <ul className="text-sm text-ink-700 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-gold-600 mt-0.5">•</span>
                <span>{t('qrcode.usage_1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-600 mt-0.5">•</span>
                <span>{t('qrcode.usage_2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-600 mt-0.5">•</span>
                <span>{t('qrcode.usage_3')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-600 mt-0.5">•</span>
                <span>{t('qrcode.usage_4')}</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
