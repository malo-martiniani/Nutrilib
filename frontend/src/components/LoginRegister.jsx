import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight, UserPlus } from 'lucide-react';

export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { login, register, error, setError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setError(null);
    setSubmitting(true);

    try {
      if (isLogin) {
        if (!email || !password) {
          throw new Error('Veuillez remplir tous les champs.');
        }
        await login(email, password);
      } else {
        if (!username || !email || !password) {
          throw new Error('Veuillez remplir tous les champs.');
        }
        if (username.length < 3) {
          throw new Error('Le nom d\'utilisateur doit faire au moins 3 caractères.');
        }
        if (password.length < 6) {
          throw new Error('Le mot de passe doit faire au moins 6 caractères.');
        }
        await register(username, email, password);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setUsername('');
    setEmail('');
    setPassword('');
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
              {isLogin ? 'Connectez-vous pour accéder à votre journal.' : 'Créez votre compte nutritionnel.'}
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          
          {/* Error Display */}
          {(error || validationError) && (
            <div className="p-4 border border-[var(--accent-magenta)]/20 bg-[var(--accent-magenta)]/10 text-[var(--accent-magenta)] text-sm font-semibold flex items-start gap-3 rounded-2xl">
              <span className="shrink-0 mt-0.5">✕</span>
              <p>{validationError || error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              
              {!isLogin && (
                <div>
                  <label className="brutal-label">Nom d'utilisateur</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                    <input
                      type="text"
                      placeholder="Ex: JeanDupont"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="brutal-input pr-8 py-2 text-xs"
                      style={{ paddingLeft: '2.5rem' }}
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="brutal-label">Adresse Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                  <input
                    type="email"
                    placeholder="contact@nutrilib.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="brutal-input pr-8 py-2 text-xs"
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="brutal-label">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="brutal-input pr-8 py-2 text-xs"
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="brutal-btn-accent w-full mt-2"
              style={{ backgroundColor: 'var(--accent-pistachio)', color: 'var(--bg-dark-slate)' }}
            >
              {submitting ? (
                <div className="brutal-spinner-sm"></div>
              ) : isLogin ? (
                <>
                  <ArrowRight className="w-4 h-4" /> Connexion
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Créer mon compte
                </>
              )}
            </button>
          </form>

          {/* Toggle Register/Login */}
          <div className="pt-4 border-t border-[var(--border-muted)] text-center">
            {isLogin ? (
              <p className="text-xs text-[var(--text-muted)]">
                Pas encore de compte ?{' '}
                <button
                  onClick={toggleMode}
                  className="text-[var(--accent-pistachio)] font-bold uppercase text-xs tracking-wider underline underline-offset-4 decoration-1 cursor-pointer hover:text-[var(--text)] transition-colors duration-200"
                >
                  Inscrivez-vous
                </button>
              </p>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">
                Vous avez déjà un compte ?{' '}
                <button
                  onClick={toggleMode}
                  className="text-[var(--accent-pistachio)] font-bold uppercase text-xs tracking-wider underline underline-offset-4 decoration-1 cursor-pointer hover:text-[var(--text)] transition-colors duration-200"
                >
                  Connectez-vous
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
