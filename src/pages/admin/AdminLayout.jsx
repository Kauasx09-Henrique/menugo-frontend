// src/pages/admin/AdminLayout.jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AdminProvider, useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext'; // Precisamos do auth para o logout
// 1. Importando os ícones que vamos usar
import { FaHome, FaBuilding, FaTags, FaBoxOpen, FaSignOutAlt } from 'react-icons/fa';
import './style/admin.css';

// Componente interno para o cabeçalho do conteúdo
function AdminHeader() {
  const { selectedEmpresa } = useAdmin();
  return (
    <div className="admin-header">
      <h1>Painel Administrativo</h1>
      {selectedEmpresa && (
        <span className="active-company">
          Gerenciando: <strong>{selectedEmpresa.nome}</strong>
        </span>
      )}
    </div>
  );
}

// Componente principal do Layout
export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redireciona para a home após o logout
  };

  return (
    <AdminProvider>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div> {/* Wrapper para conteúdo principal do sidebar */}
            <header>
              <h3>MenuGo Admin</h3>
            </header>
            <nav className="sidebar-nav">
              {/* 2. Adicionando os ícones aos links */}
              <NavLink to="/admin" end><FaHome /> Início</NavLink>
              <NavLink to="/admin/empresas"><FaBuilding /> Gerenciar Empresas</NavLink>
              <NavLink to="/admin/categorias"><FaTags /> Gerenciar Categorias</NavLink>
              <NavLink to="/admin/produtos"><FaBoxOpen /> Gerenciar Produtos</NavLink>
            </nav>
          </div>

          {/* 3. Adicionando uma seção de usuário/logout no final */}
          <div className="sidebar-footer">
            <div className="user-info">
              <span className="user-email">admin@gmail.com</span>
              <span className="user-role">Administrador</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <FaSignOutAlt />
            </button>
          </div>
        </aside>

        <main className="admin-content">
          <AdminHeader />
          <div className="content-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
    </AdminProvider>
  );
}