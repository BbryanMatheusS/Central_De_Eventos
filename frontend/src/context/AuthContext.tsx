'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface UserData {
  id: number;
  role: 'ROOT' | 'OWNER' | 'FREELANCER';
  companyId: number | null;
}

interface AuthContextData {
  user: UserData | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Restaura a sessão ao abrir a aba (Client-side único!)
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const response = await fetch(`http://${window.location.hostname}:8080/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      if (!response.ok) throw new Error('E-mail ou Senha estão incorretos!');
      
      const data = await response.json();
      
      const userData: UserData = {
        id: data.id,
        role: data.role,
        companyId: data.companyId
      };

      // Salva em "cache"
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(data.token);
      setUser(userData);

      // Redirecionamento blindado via objeto window absoluto (anti-flicker e anti-crash Mobile)
      if (data.role === 'FREELANCER') window.location.href = '/freelancer/dashboard';
      else if (data.role === 'OWNER') window.location.href = '/owner/dashboard';
      else window.location.href = '/root/dashboard';
      
    } catch (error: any) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
