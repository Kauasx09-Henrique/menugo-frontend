// src/context/AdminContext.jsx
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';

const AdminContext = createContext({});

export function AdminProvider({ children }) {
  const [empresas, setEmpresas] = useState([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);

  const fetchEmpresas = useCallback(async () => {
    try {
      const response = await api.get('/empresas');
      setEmpresas(response.data);
    } catch (error) {
      console.error("Erro ao buscar empresas", error);
    }
  }, []);

  useEffect(() => {
    fetchEmpresas();
    const storedEmpresa = localStorage.getItem('@CardapioApp:selectedEmpresa');
    if (storedEmpresa) {
      setSelectedEmpresa(JSON.parse(storedEmpresa));
    }
  }, [fetchEmpresas]);

  const selectEmpresa = (empresa) => {
    setSelectedEmpresa(empresa);
    if (empresa) {
      localStorage.setItem('@CardapioApp:selectedEmpresa', JSON.stringify(empresa));
    } else {
      localStorage.removeItem('@CardapioApp:selectedEmpresa');
    }
  };

  return (
    <AdminContext.Provider value={{ empresas, fetchEmpresas, selectedEmpresa, selectEmpresa }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}