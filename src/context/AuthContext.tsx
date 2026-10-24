import React, { createContext, useContext, useEffect, useState } from 'react';
import { AdminUser } from '../types';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, passwordAttempt: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/admin/me', { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session check failed', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    try {
      localStorage.removeItem('bk_admin_token');
      localStorage.removeItem('bk_admin_user');
    } catch (error) {
      console.error('Could not clear obsolete admin browser credentials', error);
    }
    void checkSession();
  }, []);

  const login = async (
    email: string,
    passwordAttempt: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email, password: passwordAttempt }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Identifiants invalides.' };
      }

      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('Login request failed', error);
      return { success: false, error: 'Erreur réseau de connexion.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const res = await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'same-origin',
    });
    if (!res.ok) {
      throw new Error('La session administrateur n’a pas pu être invalidée.');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
