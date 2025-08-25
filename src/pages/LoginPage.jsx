// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
// Importando ícones para os campos de input
import { FaUserShield } from 'react-icons/fa';
import { RiLockPasswordFill, RiLoginBoxFill } from 'react-icons/ri';


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, senha);
      await Swal.fire({
        icon: 'success',
        title: 'Login Realizado!',
        text: 'Você será redirecionado para o painel.',
        timer: 2000,
        showConfirmButton: false,
      });
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // A MÁGICA VISUAL ACONTECE AQUI NO JSX
  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <div className="login-header">
          <FaUserShield size={40} />
          <h2>Acesso Administrativo</h2>
          <p>Faça login para gerenciar o MenuGo.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <RiLockPasswordFill className="input-icon" />
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <RiLockPasswordFill className="input-icon" />
            <input
              type="password"
              id="senha"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Entrando...' : (
              <>
                <RiLoginBoxFill />
                Entrar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}