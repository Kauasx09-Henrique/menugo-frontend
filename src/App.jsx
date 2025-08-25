import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

// Importação dos Componentes
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Cart from './pages/Cart.jsx'; // <-- CAMINHO CORRIGIDO AQUI

// Importação das Páginas
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminHomePage from './pages/admin/AdminHomePage';
import ManageCompaniesPage from './pages/admin/ManageCompaniesPage';
import ManageCategoriesPage from './pages/admin/ManageCategoriesPage';
import ManageProductsPage from './pages/admin/ManageProductsPage';

function App() {
  useEffect(() => {
    // Garante que cada cliente anônimo tenha um ID único
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      localStorage.setItem('sessionId', uuidv4());
    }
  }, []);

  return (
    <div>
      <Header />
      <Cart />
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Rotas de Admin (Protegidas) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHomePage />} />
            <Route path="empresas" element={<ManageCompaniesPage />} />
            <Route path="categorias" element={<ManageCategoriesPage />} />
            <Route path="produtos" element={<ManageProductsPage />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
