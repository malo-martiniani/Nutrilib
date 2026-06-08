import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Leaf, Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black p-4 text-slate-100">
      {/* Fond décoratif */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md glass-dark rounded-2xl p-8 shadow-2xl relative z-10 border border-slate-800">
        
        {/* Logo / Entête */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 mb-3 animate-pulse">
            <Leaf className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Nutrilib
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {isLogin ? 'Connectez-vous pour suivre votre nutrition' : 'Créez votre compte nutritionnel gratuit'}
          </p>
        </div>

        {/* Messages d'erreur */}
        {(error || validationError) && (
          <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0"></div>
            <p>{validationError || error}</p>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Ex: JeanDupont"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Adresse Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input
                type="email"
                placeholder="Ex: contact@nutrilib.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-lg hover:from-emerald-400 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : isLogin ? (
              <>
                <LogIn className="w-5 h-5" /> Connexion
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" /> Créer mon compte
              </>
            )}
          </button>
        </form>

        {/* Lien de bascule de mode */}
        <div className="mt-8 pt-6 border-t border-slate-900 text-center text-sm text-slate-400">
          {isLogin ? (
            <p>
              Pas encore de compte ?{' '}
              <button
                onClick={toggleMode}
                className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer underline decoration-emerald-500/30 underline-offset-4"
              >
                Inscrivez-vous
              </button>
            </p>
          ) : (
            <p>
              Vous avez déjà un compte ?{' '}
              <button
                onClick={toggleMode}
                className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer underline decoration-emerald-500/30 underline-offset-4"
              >
                Connectez-vous
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
