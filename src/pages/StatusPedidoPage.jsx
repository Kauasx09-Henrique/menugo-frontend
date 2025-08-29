import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { FaCheckCircle, FaHourglassHalf, FaReceipt, FaTimesCircle } from 'react-icons/fa';

const statusSteps = {
  recebido: { text: 'Pedido Recebido', icon: <FaReceipt />, step: 1 },
  em_preparo: { text: 'Em Preparo', icon: <FaHourglassHalf />, step: 2 },
  pronto: { text: 'Pronto para Retirada', icon: <FaCheckCircle />, step: 3 },
  finalizado: { text: 'Pedido Finalizado', icon: <FaCheckCircle />, step: 4 },
  cancelado: { text: 'Pedido Cancelado', icon: <FaTimesCircle />, step: 0 },
};

export default function StatusPedidoPage() {
  const { pedidoId } = useParams();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const response = await api.get(`/pedidos/${pedidoId}`);
        setPedido(response.data);
      } catch (err) {
        setError('Não foi possível encontrar o seu pedido.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPedido();

    // Atualiza o status a cada 10 segundos
    const interval = setInterval(fetchPedido, 10000);

    // Limpa o intervalo quando o componente é desmontado
    return () => clearInterval(interval);
  }, [pedidoId]);

  if (loading) return <div className="loading-message">A carregar o seu pedido...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!pedido) return null; // Não renderiza nada se o pedido ainda não foi carregado

  const currentStepInfo = statusSteps[pedido.status] || { step: 0 };

  return (
    <div className="container status-page-container">
      <div className="status-header">
        <h1>Acompanhe o seu Pedido</h1>
        <p>Pedido <strong>#{pedido.id}</strong> para <strong>{pedido.nome_cliente}</strong></p>
        <p className="company-name">Vendido por: {pedido.nome_empresa}</p>
      </div>

      <div className="status-tracker">
        {Object.values(statusSteps).filter(s => s.step > 0 && s.step < 4).map(statusInfo => (
          <div
            key={statusInfo.step}
            className={`status-step ${currentStepInfo.step >= statusInfo.step ? 'completed' : ''}`}
          >
            <div className="status-icon">{statusInfo.icon}</div>
            <div className="status-text">{statusInfo.text}</div>
          </div>
        ))}
      </div>

      {pedido.status === 'finalizado' && (
        <div className="alert-info">O seu pedido já foi finalizado. Bom apetite!</div>
      )}
      {pedido.status === 'cancelado' && (
        <div className="error-message">O seu pedido foi cancelado.</div>
      )}

      <div className="back-to-home">
        <Link to="/" className="btn-secondary">Voltar para o Cardápio</Link>
      </div>
    </div>
  );
}
