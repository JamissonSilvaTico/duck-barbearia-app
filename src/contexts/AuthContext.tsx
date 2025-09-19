import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { api } from '../utils/api';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // Para verificar o token na inicialização

  useEffect(() => {
    // Verifica se existe um token no localStorage ao carregar o app
    const token = localStorage.getItem('authToken');
    if (token) {
      // Aqui você poderia adicionar uma chamada para validar o token no backend
      // Por simplicidade, vamos apenas assumir que se o token existe, está válido.
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (password: string) => {
    try {
      const response = await api<{ token: string }>('/auth/login', {
        method: 'POST',
        body: { password },
      });
      
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
