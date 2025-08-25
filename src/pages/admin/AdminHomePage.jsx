// src/pages/admin/AdminHomePage.jsx
import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Link } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import api from '../../services/api';

// Importando ícones para os cards
import { FaTags, FaBoxOpen, FaPlusCircle } from 'react-icons/fa';

export default function AdminHomePage() {
  const { selectedEmpresa } = useAdmin();
  const [stats, setStats] = useState({ categoryCount: 0, productCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedEmpresa) {
      setLoading(false);
      return;
    }

    async function fetchStats() {
      setLoading(true);
      try {
        // Busca as categorias
        const categoriasRes = await api.get(`/categorias/empresa/${selectedEmpresa.id}`);
        const categoryCount = categoriasRes.data.length;

        // Busca todos os produtos de todas as categorias da empresa
        let productCount = 0;
        if (categoryCount > 0) {
          const productPromises = categoriasRes.data.map(cat =>
            api.get(`/produtos/categoria/${cat.id}`)
          );
          const productResults = await Promise.all(productPromises);
          productCount = productResults.reduce((total, res) => total + res.data.length, 0);
        }

        setStats({ categoryCount, productCount });
      } catch (error) {
        console.error("Erro ao buscar estatísticas", error);
        setStats({ categoryCount: '?', productCount: '?' });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [selectedEmpresa]);

  if (!selectedEmpresa) {
    return (
      <div className="alert-info">
        Nenhuma empresa selecionada. Por favor, vá para "Gerenciar Empresas" para escolher uma e ver o dashboard.
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-grid">
        <StatCard
          icon={<FaTags />}
          title="Categorias Cadastradas"
          value={loading ? '...' : stats.categoryCount}
          color="#198754" // Verde
        />
        <StatCard
          icon={<FaBoxOpen />}
          title="Produtos no Cardápio"
          value={loading ? '...' : stats.productCount}
          color="#dc3545" // Vermelho
        />
      </div>

      <div className="quick-actions">
        <h3>Ações Rápidas</h3>
        <div className="actions-grid">
          <Link to="/admin/categorias" className="action-card">
            <FaTags size={24} />
            <span>Gerenciar Categorias</span>
          </Link>
          <Link to="/admin/produtos" className="action-card">
            <FaBoxOpen size={24} />
            <span>Gerenciar Produtos</span>
          </Link>
          <Link to="/admin/produtos" className="action-card">
            <FaPlusCircle size={24} />
            <span>Adicionar Novo Produto</span>
          </Link>
        </div>
      </div>
    </div>
  );
}