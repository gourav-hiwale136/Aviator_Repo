import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import useCurrentUser from '../hooks/useCurrentUser';
import { usePrivy } from '@privy-io/react-auth';
import { useQueryClient } from '@tanstack/react-query';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isUserLoading: false,
  setUser: () => {},
  login: () => {},
  logout: () => {},
  refreshFromStorage: () => {},
  refreshCurrentUser: () => {},
});

const readStoredUser = () => {
  try {
    const stored = localStorage.getItem('userLogin');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
};

const AuthProvider = ({ children }) => {
  const { logout: privyLogout } = usePrivy();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(readStoredUser());
  const isAuthenticated = Boolean(user?.isLoggedIn);
  const {
    data: currentUser,
    isFetching: isUserLoading,
    refetch: refreshCurrentUser,
  } = useCurrentUser({ enabled: isAuthenticated });

  const refreshFromStorage = useCallback(() => {
    setUser(readStoredUser());
  }, []);

  const login = useCallback((nextUser, token) => {
    if (token) {
      // localStorage.setItem('hybridtoken', token);
      localStorage.setItem('token', token);
    }
    if (nextUser) {
      localStorage.setItem('userLogin', JSON.stringify({ isLoggedIn: true, ...nextUser }));
      setUser({ isLoggedIn: true, ...nextUser });
    }
    window.dispatchEvent(new Event('auth-changed'));
  }, []);

  const logout = useCallback(async () => {
    try {
      await privyLogout();
    } catch (err) {
      console.error('Privy logout failed:', err);
    }
    queryClient.removeQueries({ queryKey: ['current-user'] });
    queryClient.clear();
    localStorage.removeItem('userLogin');
    // localStorage.removeItem('Aviatortoken');
    localStorage.removeItem('token');
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('privy') || key.startsWith('base-acc-sdk')) {
        localStorage.removeItem(key);
      }
    });
    setUser(null);
    window.dispatchEvent(new Event('auth-changed'));
  }, [privyLogout, queryClient]);
  useEffect(() => {
    const handleAuthChange = () => refreshFromStorage();
    const handleStorage = (event) => {
      if (event.key === 'userLogin') {
        refreshFromStorage();
      }
    };

    window.addEventListener('auth-changed', handleAuthChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [refreshFromStorage]);

  useEffect(() => {
    if (!currentUser) return;
    setUser((prev) => ({
      ...(prev || {}),
      ...currentUser,
      isLoggedIn: true,
    }));
  }, [currentUser]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isUserLoading,
      setUser,
      login,
      logout,
      refreshFromStorage,
      refreshCurrentUser,
    }),
    [user, isAuthenticated, isUserLoading, login, logout, refreshFromStorage, refreshCurrentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
