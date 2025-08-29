import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AdminProvider, useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import { FaHome, FaBuilding, FaTags, FaBoxOpen, FaSignOutAlt, FaUser } from 'react-icons/fa';
import logoImg from '../../assets/Logo.png'; // Importando a logo
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
          <div>
            <header className="sidebar-header">
              <img src={logoImg} alt="MenuGo Logo" className="sidebar-logo" />
              <h3>Admin</h3>
            </header>
            <nav className="sidebar-nav">
              <NavLink to="/admin" end><FaHome /> Início</NavLink>
              <NavLink to="/admin/empresas"><FaBuilding /> Empresas</NavLink>
              <NavLink to="/admin/categorias"><FaTags /> Categorias</NavLink>
              <NavLink to="/admin/produtos"><FaBoxOpen /> Produtos</NavLink>
            </nav>
          </div>

          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">
                <FaUser size={18} />
              </div>
              <div className="user-details">
                <span className="user-email">Administrador</span>
                <span className="user-role">Nível de Acesso Total</span>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn" title="Sair">
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
