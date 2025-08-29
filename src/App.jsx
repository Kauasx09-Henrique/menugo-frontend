import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

// Importação dos Componentes
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Cart from './pages/Cart'; // CORREÇÃO: O caminho para o componente Cart estava incorreto.

// Importação das Páginas
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import StatusPedidoPage from './pages/StatusPedidoPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminHomePage from './pages/admin/AdminHomePage';
import ManageCompaniesPage from './pages/admin/ManageCompaniesPage';
import ManageCategoriesPage from './pages/admin/ManageCategoriesPage';
import ManageProductsPage from './pages/admin/ManageProductsPage';

function App() {
  // Lógica para criar o session_id para cada visitante único
  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      localStorage.setItem('sessionId', uuidv4());
    }
  }, []); // O array vazio [] garante que isto só corre uma vez quando o app inicia

  return (
    <div>
      <Header />
      <Cart />
      <Routes>
        {/* === Rotas Públicas (para o Cliente) === */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/status/:pedidoId" element={<StatusPedidoPage />} />

        {/* === Rotas de Admin (Protegidas por Login) === */}
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

