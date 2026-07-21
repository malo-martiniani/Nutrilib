import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight, UserPlus } from 'lucide-react';

export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { login, register, error, setError, t } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setError(null);
    setSubmitting(true);

    try {
      if (isLogin) {
        if (!email || !password) {
          throw new Error(t('validation_fill_fields'));
        }
        await login(email, password);
      } else {
        if (!gdprConsent) {
          throw new Error(t('gdpr_consent_error'));
        }
        if (!username || !email || !password) {
          throw new Error(t('validation_fill_fields'));
        }
        if (username.length < 3) {
          throw new Error(t('validation_username_len'));
        }
        if (password.length < 8) {
          throw new Error(t('validation_password_len'));
        }
        if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
          throw new Error(t('validation_password_complexity'));
        }
        await register(username, email, password);
      }
    } catch (err) {
      console.error(err);
      setValidationError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setUsername('');
    setEmail('');
    setPassword('');
    setGdprConsent(false);
    setValidationError('');
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-[28px] overflow-hidden shadow-[var(--shadow-soft)] transition-transform duration-300">
        
        {/* Solid Matte Header */}
        <div className="h-32 bg-gradient-to-br from-[var(--surface-raised)] to-[var(--surface)] border-b border-[var(--border-muted)] relative flex items-end pb-4 pl-6">
          <div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-[var(--accent-pistachio)]">
              Nutrilib
            </h1>
            <p className="text-[var(--text-muted)] text-xs font-medium mt-1">
              {isLogin ? t('login_title_login') : t('login_title_register')}
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          
          {/* Error Display */}
          {(error || validationError) && (
            <div 
              role="alert" 
              aria-live="assertive" 
              className="p-4 border border-[var(--accent-magenta)]/20 bg-[var(--accent-magenta)]/10 text-[var(--accent-magenta)] text-sm font-semibold flex items-start gap-3 rounded-2xl"
            >
              <span className="shrink-0 mt-0.5" aria-hidden="true">✕</span>
              <p>{validationError || error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              
              {!isLogin && (
                <div>
                  <label htmlFor="reg-username" className="brutal-label">{t('username')}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" aria-hidden="true" />
                    <input
                      id="reg-username"
                      type="text"
                      placeholder="Ex: JeanDupont"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="brutal-input pr-8 py-2 text-xs"
                      style={{ paddingLeft: '2.5rem' }}
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="auth-email" className="brutal-label">{t('email')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" aria-hidden="true" />
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="contact@nutrilib.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="brutal-input pr-8 py-2 text-xs"
                    style={{ paddingLeft: '2.5rem' }}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="auth-password" className="brutal-label">{t('password')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" aria-hidden="true" />
                  <input
                    id="auth-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="brutal-input pr-8 py-2 text-xs"
                    style={{ paddingLeft: '2.5rem' }}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                  />
                </div>
              </div>
              
              {!isLogin && (
                <div className="flex items-start gap-2.5 pt-2">
                  <input
                    id="auth-gdpr-consent"
                    type="checkbox"
                    checked={gdprConsent}
                    onChange={(e) => setGdprConsent(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--border-muted)] bg-[var(--surface-inset)] accent-[var(--accent-pistachio)] mt-0.5 cursor-pointer"
                    required
                  />
                  <label htmlFor="auth-gdpr-consent" className="text-[10px] text-[var(--text-muted)] font-medium leading-relaxed cursor-pointer select-none">
                    {t('gdpr_consent_text')}
                  </label>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="brutal-btn-accent w-full mt-2"
              style={{ backgroundColor: 'var(--accent-pistachio)', color: 'var(--bg-dark-slate)' }}
            >
              {submitting ? (
                <div className="brutal-spinner-sm" aria-label={t('loading')}></div>
              ) : isLogin ? (
                <>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" /> {t('login')}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" aria-hidden="true" /> {t('create_account')}
                </>
              )}
            </button>
          </form>

          {/* Toggle Register/Login */}
          <div className="pt-4 border-t border-[var(--border-muted)] text-center">
            {isLogin ? (
              <p className="text-xs text-[var(--text-muted)]">
                {t('no_account_yet')}{' '}
                <button
                  onClick={toggleMode}
                  className="text-[var(--accent-pistachio)] font-bold uppercase text-xs tracking-wider underline underline-offset-4 decoration-1 cursor-pointer hover:text-[var(--text)] transition-colors duration-200"
                >
                  {t('sign_up_action')}
                </button>
              </p>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">
                {t('already_account_link')}{' '}
                <button
                  onClick={toggleMode}
                  className="text-[var(--accent-pistachio)] font-bold uppercase text-xs tracking-wider underline underline-offset-4 decoration-1 cursor-pointer hover:text-[var(--text)] transition-colors duration-200"
                >
                  {t('sign_in_action')}
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
