// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Carregando autenticação...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}