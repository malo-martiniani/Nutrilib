import React, { createContext, useState, useContext, useCallback } from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const askConfirmation = useCallback((message, onConfirm) => {
    return new Promise((resolve) => {
      setConfirmConfig({
        message,
        onConfirm: () => {
          setConfirmConfig(null);
          if (onConfirm) onConfirm();
          resolve(true);
        },
        onCancel: () => {
          setConfirmConfig(null);
          resolve(false);
        }
      });
    });
  }, []);

  return (
    <NotificationContext.Provider value={{ showToast, askConfirmation }}>
      {children}
      
      {/* ===== TOASTS CONTAINER ===== */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-lg flex justify-between items-center transition-all duration-300 animate-slide-down ${
              t.type === 'error'
                ? 'bg-[rgba(229,152,155,0.15)] border-[var(--accent-magenta)] text-[var(--accent-magenta)]'
                : t.type === 'info'
                ? 'bg-[rgba(169,212,245,0.15)] border-[var(--accent-powder)] text-[var(--accent-powder)]'
                : 'bg-[rgba(210,240,192,0.15)] border-[var(--accent-pistachio)] text-[var(--accent-pistachio)]'
            }`}
          >
            <span className="text-xs font-black uppercase tracking-wide">{t.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
              className="ml-3 text-[10px] font-extrabold opacity-75 hover:opacity-100 cursor-pointer"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* ===== CUSTOM CONFIRM MODAL ===== */}
      {confirmConfig && (
        <div className="brutal-overlay z-[90]" onClick={confirmConfig.onCancel}>
          <div className="brutal-modal max-w-xs w-full z-[100]" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-[var(--border-muted)] flex justify-between items-center bg-[var(--surface-inset)]">
              <span className="text-xs font-black uppercase text-[var(--text)] tracking-wider">Confirmation</span>
              <button onClick={confirmConfig.onCancel} className="text-[10px] text-[var(--text-muted)] font-bold uppercase hover:text-[var(--text)]">Annuler</button>
            </div>
            
            <div className="p-5 space-y-5 text-center">
              <p className="text-xs font-semibold text-[var(--text-muted)] leading-relaxed">
                {confirmConfig.message}
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={confirmConfig.onCancel}
                  className="brutal-btn-ghost flex-1 py-2 text-xs font-black"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmConfig.onConfirm}
                  className="brutal-btn-accent flex-1 py-2 text-xs font-black bg-[var(--accent-magenta)] text-[var(--bg-dark-slate)] hover:bg-[#e5989b]/90"
                  style={{ boxShadow: '0 8px 20px rgba(229,152,155,0.1)' }}
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
