import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('@MenuGo:token');
    const storedUser = localStorage.getItem('@MenuGo:user');

    if (storedToken && storedUser) {
      api.defaults.headers.Authorization = `Bearer ${storedToken}`;
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  async function login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token: newSessionToken, user: loggedInUser } = response.data;

      localStorage.setItem('@MenuGo:token', newSessionToken);
      localStorage.setItem('@MenuGo:user', JSON.stringify(loggedInUser));

      api.defaults.headers.Authorization = `Bearer ${newSessionToken}`;

      setToken(newSessionToken);
      setUser(loggedInUser);

      return loggedInUser; // Retorna os dados do utilizador para a página de login
    } catch (error) {
      console.error("Falha no login", error);
      // Re-lança o erro para que a página de login o possa apanhar
      throw new Error(error.response?.data?.error || 'Falha no login.');
    }
  }

  function logout() {
    localStorage.removeItem('@MenuGo:token');
    localStorage.removeItem('@MenuGo:user');
    api.defaults.headers.Authorization = null;
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
