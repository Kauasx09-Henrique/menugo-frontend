// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('@CardapioApp:token');
    if (storedToken) {
      api.defaults.headers.Authorization = `Bearer ${storedToken}`;
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  async function login(email, senha) {
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { token: newToken } = response.data;

      localStorage.setItem('@CardapioApp:token', newToken);
      api.defaults.headers.Authorization = `Bearer ${newToken}`;
      setToken(newToken);
    } catch (error) {
      console.error("Falha no login", error);
      throw new Error('Email ou senha inválidos.');
    }
  }

  function logout() {
    localStorage.removeItem('@CardapioApp:token');
    api.defaults.headers.Authorization = null;
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// O ERRO PROVAVELMENTE ESTÁ NA LINHA ABAIXO
// Garanta que a palavra "export" está antes de "function useAuth"
export function useAuth() {
  return useContext(AuthContext);
}