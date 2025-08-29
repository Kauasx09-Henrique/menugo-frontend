import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaSignOutAlt } from 'react-icons/fa';
import { RiAdminFill } from 'react-icons/ri';
import logoImg from '../assets/Logo.png';
import './header.css'; // Importa o novo ficheiro de estilos

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const { totalItemsInCart, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="main-header">
      <div className="container header-container">
        <Link to="/" className="logo">
          <img src={logoImg} alt="Logo MenuGo" className="logo-img" />
        </Link>
        <nav className="header-nav">
          {isAuthenticated ? (
            <button onClick={handleLogout} className="nav-btn logout">
              <FaSignOutAlt />
              <span>Sair</span>
            </button>
          ) : (
            <>
              {!isAdminPage && (
                <button className="nav-btn cart" onClick={() => setIsCartOpen(true)}>
                  <FaShoppingCart />
                  {totalItemsInCart > 0 && <span className="cart-badge">{totalItemsInCart}</span>}
                </button>
              )}
              <Link to="/login" className="nav-btn admin">
                <RiAdminFill />
                <span>Admin</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
