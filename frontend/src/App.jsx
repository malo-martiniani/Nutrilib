import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginRegister from './components/LoginRegister';
import Dashboard from './components/Dashboard';
import './App.css';

function MainApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-slate-950 rounded-full"></div>
          </div>
        </div>
        <p className="mt-4 text-slate-400 font-semibold tracking-wider text-sm">Chargement de Nutrilib...</p>
      </div>
    );
  }

  return user ? <Dashboard /> : <LoginRegister />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
