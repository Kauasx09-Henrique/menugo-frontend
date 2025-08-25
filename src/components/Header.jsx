// src/components/Header.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// 1. Corrigimos o caminho para buscar a logo de dentro de 'src/assets'
import logoImg from '../assets/Logo.png';

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="main-header">
      <div className="container header-container">

        {/* 2. Usamos a tag <img> para mostrar a logo importada */}
        <Link to="/" className="logo">
          <img src={logoImg} alt="Logo MenuGo" style={{ height: '45px' }} />
        </Link>

        <nav>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="admin-btn">Sair</button>
          ) : (
            <Link to="/login" className="admin-btn">Admin</Link>
          )}
        </nav>
      </div>
    </header>
  );
}