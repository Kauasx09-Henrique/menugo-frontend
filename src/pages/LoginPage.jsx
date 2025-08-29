import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaKey, FaUserShield, FaEnvelope } from 'react-icons/fa';
import { RiLockPasswordFill, RiLoginBoxFill } from 'react-icons/ri';
import './login.css'; // Importa o novo ficheiro de estilos

export default function LoginPage() {
  const [loginType, setLoginType] = useState('empresa'); // 'empresa' ou 'admin'
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Prepara os dados de acordo com o tipo de login
    const credentials = loginType === 'empresa' ? { token } : { email, senha };

    try {
      const loggedInUser = await login(credentials);

      await Swal.fire({
        icon: 'success',
        title: `Bem-vindo, ${loggedInUser.nome}!`,
        text: 'A redirecionar para o painel de administração.',
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      });

      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Falha no login. Verifique as suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <div className="login-header">
          {loginType === 'empresa' ? <FaKey size={40} /> : <FaUserShield size={40} />}
          <h2>{loginType === 'empresa' ? 'Acesso Empresarial' : 'Acesso Super Admin'}</h2>
          <p>Insira as suas credenciais para gerir o MenuGo.</p>
        </div>

        <div className="login-tabs">
          <button
            className={`login-tab ${loginType === 'empresa' ? 'active' : ''}`}
            onClick={() => setLoginType('empresa')}
          >
            Acesso Empresa
          </button>
          <button
            className={`login-tab ${loginType === 'admin' ? 'active' : ''}`}
            onClick={() => setLoginType('admin')}
          >
            Super Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          {loginType === 'empresa' ? (
            <div className="input-group">
              <FaKey className="input-icon" />
              <input
                type="text"
                id="token"
                placeholder="Código de Acesso da Empresa"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>
          ) : (
            <>
              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  id="email"
                  placeholder="Email (admin@gmail.com)"
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
                  placeholder="Senha (1234)"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'A entrar...' : (
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
