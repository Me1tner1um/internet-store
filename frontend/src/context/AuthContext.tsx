import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { authApi, getAccessToken, removeTokens } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loginAsDemoUser: () => Promise<void>;
  loginAsDemoAdmin: () => Promise<void>;
  isBackendOnline: boolean;
  setIsBackendOnline: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAccessToken());
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_info');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        removeTokens();
      }
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    try {
      const res = await authApi.login(username, password);
      setUser({
        userId: res.userId,
        username: res.username,
        email: res.email,
        role: res.role,
      });
      setToken(res.accessToken);
    } catch (err) {
      // If server unreachable, check if credentials match test presets
      if (!isBackendOnline || (err as any).message?.includes('Failed to fetch')) {
        handleOfflineLogin(username, password);
        return;
      }
      throw err;
    }
  };

  const handleOfflineLogin = (username: string, password: string) => {
    if (username === 'admin' && password === 'password123') {
      const demoAdmin: User = {
        userId: 'a0000000-0000-0000-0000-000000000001',
        username: 'admin',
        email: 'admin@shop.local',
        role: 'ROLE_ADMIN',
      };
      setUser(demoAdmin);
      setToken('demo-jwt-admin-token');
      localStorage.setItem('user_info', JSON.stringify(demoAdmin));
      localStorage.setItem('access_token', 'demo-jwt-admin-token');
    } else if (username === 'testuser' && password === 'password123') {
      const demoUser: User = {
        userId: 'a0000000-0000-0000-0000-000000000002',
        username: 'testuser',
        email: 'testuser@shop.local',
        role: 'ROLE_USER',
      };
      setUser(demoUser);
      setToken('demo-jwt-user-token');
      localStorage.setItem('user_info', JSON.stringify(demoUser));
      localStorage.setItem('access_token', 'demo-jwt-user-token');
    } else {
      throw new Error('Неверное имя пользователя или пароль');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await authApi.register(username, email, password);
    setUser({
      userId: res.userId,
      username: res.username,
      email: res.email,
      role: res.role,
    });
    setToken(res.accessToken);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setToken(null);
  };

  const loginAsDemoUser = async () => {
    try {
      await login('testuser', 'password123');
    } catch {
      handleOfflineLogin('testuser', 'password123');
    }
  };

  const loginAsDemoAdmin = async () => {
    try {
      await login('admin', 'password123');
    } catch {
      handleOfflineLogin('admin', 'password123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ROLE_ADMIN',
        login,
        register,
        logout,
        loginAsDemoUser,
        loginAsDemoAdmin,
        isBackendOnline,
        setIsBackendOnline,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
