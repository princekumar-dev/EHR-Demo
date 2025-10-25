'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('ehr_token');
    const storedUser = localStorage.getItem('ehr_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem('ehr_token', nextToken);
    localStorage.setItem('ehr_user', JSON.stringify(nextUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ehr_token');
    localStorage.removeItem('ehr_user');
  };

  const value = useMemo(
    () => ({ user, token, loading, login, logout }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
