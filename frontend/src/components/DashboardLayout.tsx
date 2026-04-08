import React, { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
  preview?: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, preview }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-ink-50 bg-gradient-mesh">
      {/* Refined Navigation Bar */}
      <nav className="sticky top-0 z-50 glass border-b border-ink-100/50 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-ink-900 flex items-center justify-center shadow-elevation-2 group hover:scale-105 transition-transform duration-200">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-ink-900 hidden sm:block tracking-tight">Profile Hub</h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Preview Toggle */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="lg:hidden btn-ghost py-2 px-3 text-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>

              {/* User Info */}
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-2 bg-ink-100 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ink-700 to-ink-900 flex items-center justify-center text-white text-xs font-bold shadow-elevation-1">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-ink-900">
                  {user?.username}
                </span>
              </div>

              {/* Admin Panel Button */}
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gold-100 text-gold-900 rounded-xl hover:bg-gold-200 transition-all duration-200 text-sm font-semibold shadow-elevation-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Admin
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="btn-ghost py-2 px-3 sm:px-4 text-sm"
              >
                <span className="hidden sm:inline">Logout</span>
                <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Editor Panel */}
          <div className={`space-y-6 ${showPreview ? 'hidden lg:block' : 'block'}`}>
            <div className="card-glass p-6 lg:p-10 animate-slide-up shadow-elevation-2">
              {children}
            </div>
          </div>

          {/* Preview Panel */}
          <div className={`lg:sticky lg:top-24 h-fit ${showPreview ? 'block' : 'hidden lg:block'}`}>
            <div className="card-glass p-6 lg:p-10 animate-slide-up shadow-elevation-2" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-ink-200">
                <div>
                  <h2 className="text-xl font-bold text-ink-900 tracking-tight">Live Preview</h2>
                  <p className="text-sm text-ink-500 mt-1">
                    Real-time updates
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="lg:hidden text-ink-400 hover:text-ink-700 transition-colors touch-target rounded-lg hover:bg-ink-100"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Mobile Frame */}
              <div className="relative mx-auto max-w-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 to-sage-500/10 rounded-3xl blur-2xl"></div>
                <div className="relative bg-ink-100 rounded-3xl p-3 shadow-elevation-3">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-elevation-2">
                    <div className="h-[600px] overflow-y-auto custom-scrollbar">
                      {preview || (
                        <div className="flex items-center justify-center h-full text-ink-400">
                          <div className="text-center">
                            <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm font-medium">Preview will appear here</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
