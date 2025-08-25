// src/pages/admin/ManageProductsPage.jsx
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAdmin } from '../../context/AdminContext';

const initialFormState = {
  id: null, nome: '', descricao: '', preco: '', imagem_url: '', disponivel: true
};

export default function ManageProductsPage() {
  const { selectedEmpresa } = useAdmin();
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState('');
  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    if (!selectedEmpresa) return;
    api.get(`/categorias/empresa/${selectedEmpresa.id}`)
      .then(res => setCategorias(res.data))
      .catch(err => console.error(err));
  }, [selectedEmpresa]);

  const fetchProdutos = async () => {
    if (!selectedCategoriaId) {
      setProdutos([]);
      return;
    };
    api.get(`/produtos/categoria/${selectedCategoriaId}`)
      .then(res => setProdutos(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchProdutos();
  }, [selectedCategoriaId]);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    // Se for checkbox, usa 'checked', senão usa 'value'
    const valor = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [id]: valor });
  };

  const resetForm = () => {
    setIsEditing(false);
    setFormData(initialFormState);
    setMensagem('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategoriaId) {
      setMensagem('Por favor, selecione uma categoria primeiro.');
      return;
    }
    const data = { ...formData, preco: Number(formData.preco), categoria_id: Number(selectedCategoriaId) };
    try {
      if (isEditing) {
        await api.put(`/produtos/${formData.id}`, data);
        setMensagem('Produto atualizado com sucesso!');
      } else {
        await api.post('/produtos', data);
        setMensagem('Produto cadastrado com sucesso!');
      }
      resetForm();
      fetchProdutos(); // Atualiza a lista
    } catch (error) {
      setMensagem('Ocorreu um erro.');
      console.error(error);
    }
  };

  const handleEdit = (produto) => {
    setIsEditing(true);
    setFormData({
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      imagem_url: produto.imagem_url,
      disponivel: produto.disponivel
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await api.delete(`/produtos/${id}`);
        setMensagem('Produto excluído com sucesso!');
        fetchProdutos(); // Atualiza a lista
      } catch (error) {
        setMensagem('Ocorreu um erro ao excluir.');
        console.error(error);
      }
    }
  };

  if (!selectedEmpresa) {
    return <div className="alert-info">Por favor, selecione uma empresa na página "Gerenciar Empresas" para começar.</div>;
  }

  return (
    <div>
      <h2>Gerenciar Produtos de: <strong>{selectedEmpresa.nome}</strong></h2>
      <div className="form-group">
        <label>Selecione uma Categoria para ver os Produtos</label>
        <select onChange={(e) => setSelectedCategoriaId(e.target.value)} value={selectedCategoriaId}>
          <option value="">-- Selecione --</option>
          {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
        </select>
      </div>

      {selectedCategoriaId && (
        <>
          <form onSubmit={handleSubmit} className="admin-form">
            <h3>{isEditing ? 'Editar Produto' : 'Cadastrar Novo Produto'}</h3>
            {mensagem && <p className="mensagem-feedback">{mensagem}</p>}

            {/* === FORMULÁRIO ATUALIZADO === */}
            <div className="form-grid">
              <div className="form-group span-2">
                <label htmlFor="nome">Nome do Produto</label>
                <input type="text" id="nome" value={formData.nome} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="preco">Preço (ex: 49.90)</label>
                <input type="number" step="0.01" id="preco" value={formData.preco} onChange={handleInputChange} required />
              </div>
              <div className="form-group span-3">
                <label htmlFor="descricao">Descrição</label>
                <input type="text" id="descricao" value={formData.descricao} onChange={handleInputChange} />
              </div>
              <div className="form-group span-3">
                <label htmlFor="imagem_url">URL da Imagem</label>
                <input type="text" id="imagem_url" value={formData.imagem_url} onChange={handleInputChange} />
              </div>
              <div className="form-group checkbox-group">
                <input type="checkbox" id="disponivel" checked={formData.disponivel} onChange={handleInputChange} />
                <label htmlFor="disponivel">Produto Disponível</label>
              </div>
            </div>

            <button type="submit">{isEditing ? 'Atualizar Produto' : 'Salvar Produto'}</button>
            {isEditing && <button type="button" onClick={resetForm} className="cancel-btn">Cancelar</button>}
          </form>

          <div className="data-list">
            {/* ... (código da lista de produtos) ... */}
          </div>
        </>
      )}
    </div>
  );
}