// src/pages/admin/ManageCategoriesPage.jsx
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAdmin } from '../../context/AdminContext';

export default function ManageCategoriesPage() {
  const { selectedEmpresa } = useAdmin();
  const [categorias, setCategorias] = useState([]);
  const [formData, setFormData] = useState({ id: null, nome: '', ordem: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const fetchCategorias = async () => {
    if (!selectedEmpresa) return;
    try {
      const response = await api.get(`/categorias/empresa/${selectedEmpresa.id}`);
      setCategorias(response.data);
    } catch (error) {
      console.error("Erro ao buscar categorias", error);
      setCategorias([]);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, [selectedEmpresa]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const resetForm = () => {
    setIsEditing(false);
    setFormData({ id: null, nome: '', ordem: 0 });
    setMensagem('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    const data = { nome: formData.nome, ordem: Number(formData.ordem), empresa_id: selectedEmpresa.id };
    try {
      if (isEditing) {
        await api.put(`/categorias/${formData.id}`, data);
        setMensagem('Categoria atualizada com sucesso!');
      } else {
        await api.post('/categorias', data);
        setMensagem('Categoria cadastrada com sucesso!');
      }
      resetForm();
      fetchCategorias();
    } catch (error) {
      setMensagem('Ocorreu um erro.');
      console.error(error);
    }
  };

  const handleEdit = (categoria) => {
    setIsEditing(true);
    setFormData({ id: categoria.id, nome: categoria.nome, ordem: categoria.ordem });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza? Isso pode apagar produtos associados.')) {
      try {
        await api.delete(`/categorias/${id}`);
        setMensagem('Categoria excluída com sucesso!');
        fetchCategorias();
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
      <h2>Gerenciar Categorias de: <strong>{selectedEmpresa.nome}</strong></h2>
      <form onSubmit={handleSubmit} className="admin-form">
        <h3>{isEditing ? 'Editar Categoria' : 'Cadastrar Nova Categoria'}</h3>
        {mensagem && <p className="mensagem-feedback">{mensagem}</p>}
        <div className="form-group">
          <label htmlFor="nome">Nome da Categoria</label>
          <input type="text" id="nome" value={formData.nome} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="ordem">Ordem de Exibição</label>
          <input type="number" id="ordem" value={formData.ordem} onChange={handleInputChange} required />
        </div>
        <button type="submit">{isEditing ? 'Atualizar Categoria' : 'Salvar Categoria'}</button>
        {isEditing && <button type="button" onClick={resetForm} className="cancel-btn">Cancelar</button>}
      </form>
      <div className="data-list">
        <h3>Categorias Existentes</h3>
        <ul>
          {categorias.map(cat => (
            <li key={cat.id} className="list-item-action">
              <span>{cat.nome} (Ordem: {cat.ordem})</span>
              <div>
                <button onClick={() => handleEdit(cat)}>Editar</button>
                <button onClick={() => handleDelete(cat.id)} className="delete-btn">Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}