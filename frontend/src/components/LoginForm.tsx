import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageSelector } from './LanguageSelector';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const validateEmail = (email: string): string | undefined => {
    if (!email) {
      return t('auth.login.email_required');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return t('auth.login.email_invalid');
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return t('auth.login.password_required');
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setErrors({});

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : t('auth.login.login_failed'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-ink-50 bg-gradient-mesh relative overflow-hidden">
      {/* Language Selector - Fixed position at top end (RTL-aware) */}
      <div 
        style={{ 
          position: 'fixed', 
          top: '1rem', 
          insetInlineEnd: '1rem',
          zIndex: 1000,
        }}
      >
        <LanguageSelector 
          variant="dropdown" 
          showFlags={true} 
          showLabels={false}
          compact={true}
        />
      </div>

      {/* Ambient elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-float"></div>
      </div>
      
      <div className="w-full max-w-md animate-slide-up relative z-10">
        {/* Refined Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-ink-900 shadow-elevation-3 mb-6 group hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <svg className="w-10 h-10 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-ink-900 mb-3 tracking-tight">
            {t('auth.login.welcome_back')}
          </h2>
          <p className="text-ink-600">
            {t('auth.login.new_here')}{' '}
            <Link to="/register" className="font-semibold text-ink-900 hover:text-gold-600 transition-colors">
              {t('auth.login.create_account')}
            </Link>
          </p>
        </div>
        
        {/* Form Card */}
        <div className="card-glass p-8 shadow-elevation-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl animate-slide-down">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-800 font-medium">{errors.general}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-ink-900 mb-2.5">
                {t('auth.login.email_label')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'input-error' : 'input'}
                placeholder={t('auth.login.email_placeholder')}
              />
              {errors.email && (
                <p className="mt-2.5 text-sm text-red-600 flex items-center gap-1.5 font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-ink-900 mb-2.5">
                {t('auth.login.password_label')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? 'input-error pe-12' : 'input pe-12'}
                  placeholder={t('auth.login.password_placeholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors touch-target rounded-lg hover:bg-ink-50"
                  aria-label={showPassword ? t('auth.login.hide_password') : t('auth.login.show_password')}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2.5 text-sm text-red-600 flex items-center gap-1.5 font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full touch-target"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner w-5 h-5"></span>
                  {t('auth.login.signing_in')}
                </span>
              ) : (
                t('auth.login.submit_button')
              )}
            </button>
          </form>
        </div>

        {/* Back to home */}
        <div className="text-center mt-8">
          <Link to="/" className="text-sm text-ink-600 hover:text-ink-900 transition-colors font-medium inline-flex items-center gap-2">
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('auth.login.back_to_home')}
          </Link>
        </div>
      </div>
    </div>
  );
};
