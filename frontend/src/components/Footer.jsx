import React from 'react';
import LogoIcon from './LogoIcon';
import { Code2, Award, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { t } = useAuth();

  return (
    <footer className="w-full bg-[var(--surface)] border-t-3 border-black text-[var(--text)] mt-auto py-8 px-5 md:px-12 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Developer Info */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <LogoIcon className="w-9 h-9 shrink-0" />
            <span className="text-xl font-black uppercase tracking-tight text-[var(--accent-pistachio)]">
              Nutrilib
            </span>
          </div>

          <div className="hidden sm:block h-6 w-0.5 bg-[var(--border-muted)]" />

          <div className="flex flex-col sm:flex-row items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
            <span className="text-[var(--text)] font-extrabold flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-[var(--accent-powder)]" /> Malo Martiniani
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1 bg-[var(--surface-raised)] border-2 border-black px-2 py-0.5 rounded-lg text-[10px] font-black text-black bg-[var(--accent-sand)] shadow-[1px_1px_0px_#000000]">
              <Award className="w-3 h-3 text-black" /> DWWM (Développeur Web & Web Mobile)
            </span>
          </div>
        </div>

        {/* GitHub Link & Session */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/malo-martiniani"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 py-2 px-3.5 border-2 border-black rounded-xl bg-[var(--surface-raised)] text-[var(--text)] shadow-[2px_2px_0px_#000000] hover:bg-[var(--accent-pistachio)] hover:text-black font-extrabold text-xs transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            aria-label="Profil GitHub de Malo Martiniani"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>

          <div className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider text-right">
            © 2026 Nutrilib · Session TP DWWM
          </div>
        </div>

      </div>
    </footer>
  );
}
