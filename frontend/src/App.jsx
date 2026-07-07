import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import LoginRegister from './components/LoginRegister';
import Dashboard from './components/Dashboard';
import './App.css';

function MainApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--black)] flex flex-col items-center justify-center gap-6">
        <div className="brutal-spinner"></div>
        <p className="text-[var(--text-muted)] font-bold text-xs uppercase tracking-[0.2em]">
          Chargement
        </p>
      </div>
    );
  }

  return user ? <Dashboard /> : <LoginRegister />;
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainApp />
      </NotificationProvider>
    </AuthProvider>
  );
}
