import React, { createContext, useContext, useState } from 'react';

const STORAGE_KEY = 'vantage:adminKey';

interface AdminContextValue {
  adminKey: string;
  setAdminKey: (key: string) => void;
  clearAdminKey: () => void;
  isAdmin: boolean;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [adminKey, setAdminKeyState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  });

  const setAdminKey = (key: string) => {
    const trimmed = key.trim();
    setAdminKeyState(trimmed);
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const clearAdminKey = () => {
    setAdminKeyState('');
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AdminContext.Provider value={{ adminKey, setAdminKey, clearAdminKey, isAdmin: Boolean(adminKey) }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
