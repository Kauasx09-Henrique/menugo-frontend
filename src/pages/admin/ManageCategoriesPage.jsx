import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAdmin } from '../../context/AdminContext';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Importando ícones

export default function ManageCategoriesPage() {
  const { selectedEmpresa } = useAdmin();
  const [categorias, setCategorias] = useState([]);
  const [formData, setFormData] = useState({ id: null, nome: '', ordem: 0 });
  const [isEditing, setIsEditing] = useState(false);

  const fetchCategorias = async () => {
    if (!selectedEmpresa) return;
    try {
      const response = await api.get(`/categorias/empresa/${selectedEmpresa.id}`);
      // Ordena as categorias pela ordem definida
      const sortedCategorias = response.data.sort((a, b) => a.ordem - b.ordem);
      setCategorias(sortedCategorias);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { nome: formData.nome, ordem: Number(formData.ordem), empresa_id: selectedEmpresa.id };
    try {
      if (isEditing) {
        await api.put(`/categorias/${formData.id}`, data);
        Swal.fire({
          toast: true,
          icon: 'success',
          title: 'Categoria atualizada!',
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      } else {
        await api.post('/categorias', data);
        Swal.fire({
          toast: true,
          icon: 'success',
          title: 'Categoria cadastrada!',
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      }
      resetForm();
      fetchCategorias();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Ocorreu um erro ao salvar a categoria.' });
      console.error(error);
    }
  };

  const handleEdit = (categoria) => {
    setIsEditing(true);
    setFormData({ id: categoria.id, nome: categoria.nome, ordem: categoria.ordem });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Isso pode apagar produtos associados. A ação não pode ser desfeita.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6e7881',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/categorias/${id}`);
        Swal.fire('Excluído!', 'A categoria foi excluída.', 'success');
        fetchCategorias();
      } catch (error) {
        Swal.fire('Erro!', 'Não foi possível excluir a categoria.', 'error');
        console.error(error);
      }
    }
  };

  if (!selectedEmpresa) {
    return <div className="alert-info">Por favor, selecione uma empresa na página "Gerenciar Empresas" para começar.</div>;
  }

  return (
    <div>
      <h2>Gerenciar Categorias de: <strong>{selectedEmpresa?.nome}</strong></h2>

      <form onSubmit={handleSubmit} className="admin-form">
        <fieldset>
          <legend>{isEditing ? 'Editar Categoria' : 'Cadastrar Nova Categoria'}</legend>
          <div className="form-grid-small">
            <div className="form-group span-2">
              <label htmlFor="nome">Nome da Categoria</label>
              <input type="text" id="nome" value={formData.nome} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="ordem">Ordem de Exibição</label>
              <input type="number" id="ordem" value={formData.ordem} onChange={handleInputChange} required />
            </div>
          </div>
        </fieldset>
        <button type="submit">{isEditing ? 'Atualizar Categoria' : 'Salvar Categoria'}</button>
        {isEditing && <button type="button" onClick={resetForm} className="cancel-btn">Cancelar</button>}
      </form>

      <div className="data-list">
        <h3>Categorias Existentes</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Ordem</th>
                <th className="actions-header">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categorias.length > 0 ? (
                categorias.map(cat => (
                  <tr key={cat.id} className={isEditing && cat.id === formData.id ? 'editing-row' : ''}>
                    <td>{cat.nome}</td>
                    <td>{cat.ordem}</td>
                    <td className="actions-cell">
                      <button onClick={() => handleEdit(cat)} className="edit-btn" title="Editar"><FaEdit /></button>
                      <button onClick={() => handleDelete(cat.id)} className="delete-btn" title="Excluir"><FaTrash /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="empty-cell">Nenhuma categoria cadastrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
