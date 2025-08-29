import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAdmin } from '../../context/AdminContext';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaImage, FaEye, FaEyeSlash, FaBoxOpen } from 'react-icons/fa';

const initialFormState = {
  id: null,
  nome: '',
  descricao: '',
  preco: '',
  imagem_url: '',
  disponivel: true
};

export default function ManageProductsPage() {
  const { selectedEmpresa } = useAdmin();
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState('');
  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (!selectedEmpresa) return;

    const fetchCategorias = async () => {
      try {
        const response = await api.get(`/categorias/empresa/${selectedEmpresa.id}`);
        setCategorias(response.data);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };

    fetchCategorias();
  }, [selectedEmpresa]);

  const fetchProdutos = async () => {
    if (!selectedCategoriaId) {
      setProdutos([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.get(`/produtos/categoria/${selectedCategoriaId}`);
      setProdutos(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, [selectedCategoriaId]);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    const valor = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [id]: valor });
    if (id === 'imagem_url') {
      setImagePreview(value);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setFormData(initialFormState);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategoriaId) {
      Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Por favor, selecione uma categoria primeiro.' });
      return;
    }
    const data = {
      ...formData,
      preco: Number(formData.preco),
      categoria_id: Number(selectedCategoriaId)
    };
    try {
      if (isEditing) {
        await api.put(`/produtos/${formData.id}`, data);
        Swal.fire({ toast: true, icon: 'success', title: 'Produto atualizado!', position: 'top-end', showConfirmButton: false, timer: 2000, timerProgressBar: true });
      } else {
        await api.post('/produtos', data);
        Swal.fire({ toast: true, icon: 'success', title: 'Produto cadastrado!', position: 'top-end', showConfirmButton: false, timer: 2000, timerProgressBar: true });
      }
      resetForm();
      fetchProdutos();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Ocorreu um erro ao salvar o produto.' });
      console.error('Erro ao salvar produto:', error);
    }
  };

  const handleEdit = (produto) => {
    setIsEditing(true);
    setFormData({
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao || '',
      preco: produto.preco,
      imagem_url: produto.imagem_url || '',
      disponivel: produto.disponivel
    });
    setImagePreview(produto.imagem_url || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "A ação não pode ser desfeita.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6e7881',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/produtos/${id}`);
        Swal.fire('Excluído!', 'O produto foi excluído.', 'success');
        fetchProdutos();
      } catch (error) {
        Swal.fire('Erro!', 'Não foi possível excluir o produto.', 'error');
        console.error('Erro ao excluir produto:', error);
      }
    }
  };

  const toggleDisponibilidade = async (produto) => {
    try {
      const updatedProduct = { ...produto, disponivel: !produto.disponivel };
      await api.put(`/produtos/${produto.id}`, updatedProduct);
      Swal.fire({
        toast: true,
        icon: 'success',
        title: `Produto ${updatedProduct.disponivel ? 'ativado' : 'desativado'}!`,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      fetchProdutos();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Erro ao alterar disponibilidade.' });
      console.error('Erro ao alterar disponibilidade:', error);
    }
  };

  if (!selectedEmpresa) {
    return (
      <div className="alert-info">
        <p>Por favor, selecione uma empresa na página "Gerenciar Empresas" para começar.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Gerenciar Produtos de: <strong>{selectedEmpresa?.nome}</strong></h2>

      <div className="form-section">
        <div className="form-group">
          <label htmlFor="categoria-select">Selecione uma Categoria</label>
          <select
            id="categoria-select"
            onChange={(e) => setSelectedCategoriaId(e.target.value)}
            value={selectedCategoriaId}
            disabled={isLoading}
          >
            <option value="">-- Selecione uma categoria --</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedCategoriaId && (
        <>
          <form onSubmit={handleSubmit} className="admin-form">
            <fieldset>
              <legend>{isEditing ? 'Editar Produto' : 'Cadastrar Novo Produto'}</legend>
              <div className="form-grid">
                <div className="form-group span-2">
                  <label htmlFor="nome">Nome do Produto *</label>
                  <input type="text" id="nome" value={formData.nome} onChange={handleInputChange} required disabled={isLoading} />
                </div>
                <div className="form-group">
                  <label htmlFor="preco">Preço (R$) *</label>
                  <input type="number" step="0.01" min="0" id="preco" value={formData.preco} onChange={handleInputChange} required disabled={isLoading} />
                </div>
                <div className="form-group span-3">
                  <label htmlFor="descricao">Descrição</label>
                  <textarea id="descricao" value={formData.descricao} onChange={handleInputChange} rows="3" disabled={isLoading} />
                </div>
                <div className="form-group span-3">
                  <label htmlFor="imagem_url">URL da Imagem</label>
                  <div className="image-input-group">
                    <input type="text" id="imagem_url" value={formData.imagem_url} onChange={handleInputChange} placeholder="https://exemplo.com/imagem.jpg" disabled={isLoading} />
                    <span className="input-icon"><FaImage /></span>
                  </div>
                  {imagePreview && (
                    <div className="image-preview">
                      <p>Pré-visualização:</p>
                      <img src={imagePreview} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="disponivel" className="checkbox-label">
                    <input type="checkbox" id="disponivel" checked={formData.disponivel} onChange={handleInputChange} disabled={isLoading} />
                    <span className="checkmark"></span>
                    Produto Disponível
                  </label>
                </div>
              </div>
            </fieldset>
            <div className="form-actions">
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? 'Processando...' : (isEditing ? 'Atualizar Produto' : 'Salvar Produto')}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} disabled={isLoading} className="btn-secondary">
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="data-list">
            <div className="list-header">
              <h3>Produtos da Categoria</h3>
              <span className="badge">{produtos.length} produto(s)</span>
            </div>
            {isLoading ? (
              <div className="loading-state">Carregando produtos...</div>
            ) : produtos.length === 0 ? (
              <div className="empty-state">
                <FaBoxOpen />
                <p>Nenhum produto encontrado para esta categoria.</p>
              </div>
            ) : (
              <div className="products-grid-admin">
                {produtos.map(produto => (
                  <div key={produto.id} className={`product-card-admin ${!produto.disponivel ? 'disabled' : ''}`}>
                    <div className="product-image-admin">
                      <img src={produto.imagem_url || 'https://via.placeholder.com/150x100.png?text=MenuGo'} alt={produto.nome} onError={(e) => { e.target.src = 'https://via.placeholder.com/150x100.png?text=MenuGo'; }} />
                      <button className="availability-toggle" onClick={() => toggleDisponibilidade(produto)} title={produto.disponivel ? 'Desativar produto' : 'Ativar produto'}>
                        {produto.disponivel ? <FaEye /> : <FaEyeSlash />}
                      </button>
                    </div>
                    <div className="product-info-admin">
                      <h4>{produto.nome}</h4>
                      <p className="product-description-admin">{produto.descricao}</p>
                      <div className="product-price-admin">R$ {Number(produto.preco).toFixed(2)}</div>
                      <div className={`product-status ${produto.disponivel ? 'available' : 'unavailable'}`}>
                        {produto.disponivel ? 'Disponível' : 'Indisponível'}
                      </div>
                    </div>
                    <div className="product-actions-admin">
                      <button onClick={() => handleEdit(produto)} className="edit-btn" title="Editar produto"><FaEdit /></button>
                      <button onClick={() => handleDelete(produto.id)} className="delete-btn" title="Excluir produto"><FaTrash /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
