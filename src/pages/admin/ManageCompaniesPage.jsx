// src/pages/admin/ManageCompaniesPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import api from '../../services/api';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';

const initialFormState = {
  id: null, nome: '', cnpj: '', telefone: '', logo_url: '', cep: '',
  rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: ''
};

export default function ManageCompaniesPage() {
  const { empresas, fetchEmpresas, selectEmpresa, selectedEmpresa } = useAdmin();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [cepLoading, setCepLoading] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleCepBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (cep.length !== 8) return;

    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) {
        Swal.fire({ icon: 'error', title: 'CEP não encontrado' });
      } else {
        setFormData(prevData => ({
          ...prevData,
          rua: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          uf: data.uf
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP", error);
      Swal.fire({ icon: 'error', title: 'Erro ao buscar CEP' });
    } finally {
      setCepLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setMensagem('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    try {
      if (isEditing) {
        await api.put(`/empresas/${formData.id}`, formData);
        Swal.fire({ icon: 'success', title: 'Sucesso!', text: 'Empresa atualizada com sucesso.' });
      } else {
        await api.post('/empresas', formData);
        Swal.fire({ icon: 'success', title: 'Sucesso!', text: 'Empresa criada com sucesso.' });
      }
      resetForm();
      fetchEmpresas();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Erro ao salvar empresa.' });
      console.error(error);
    }
  };

  const handleEdit = (empresa) => {
    setFormData({ ...initialFormState, ...empresa });
    setIsEditing(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Você não poderá reverter esta ação!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/empresas/${id}`);
        Swal.fire('Excluído!', 'A empresa foi excluída.', 'success');
        fetchEmpresas();
      } catch (error) {
        Swal.fire('Erro!', 'Não foi possível excluir a empresa.', 'error');
        console.error(error);
      }
    }
  };

  const handleManageClick = (empresa) => {
    selectEmpresa(empresa);
    navigate('/admin/categorias');
  };

  return (
    <div>
      <h2>Gerenciar Empresas</h2>

      <form onSubmit={handleSubmit} className="admin-form">
        <h3>{isEditing ? 'Editar Empresa' : 'Cadastrar Nova Empresa'}</h3>

        <div className="form-grid">
          <div className="form-group span-2">
            <label htmlFor="nome">Nome da Empresa</label>
            <input type="text" id="nome" value={formData.nome} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="logo_url">URL da Logo</label>
            <input type="text" id="logo_url" value={formData.logo_url} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label htmlFor="cnpj">CNPJ</label>
            <input type="text" id="cnpj" value={formData.cnpj} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label htmlFor="telefone">Telefone</label>
            <input type="text" id="telefone" value={formData.telefone} onChange={handleInputChange} />
          </div>
          <div className="form-group cep-group">
            <label htmlFor="cep">CEP</label>
            <input type="text" id="cep" value={formData.cep} onChange={handleInputChange} onBlur={handleCepBlur} />
            {cepLoading && <div className="spinner"></div>}
          </div>
          <div className="form-group span-2">
            <label htmlFor="rua">Rua</label>
            <input type="text" id="rua" value={formData.rua} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label htmlFor="numero">Número</label>
            <input type="text" id="numero" value={formData.numero} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label htmlFor="complemento">Complemento</label>
            <input type="text" id="complemento" value={formData.complemento} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label htmlFor="bairro">Bairro</label>
            <input type="text" id="bairro" value={formData.bairro} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label htmlFor="cidade">Cidade</label>
            <input type="text" id="cidade" value={formData.cidade} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label htmlFor="uf">UF</label>
            <input type="text" id="uf" maxLength="2" value={formData.uf} onChange={handleInputChange} />
          </div>
        </div>
        <button type="submit">{isEditing ? 'Atualizar Empresa' : 'Cadastrar Empresa'}</button>
        {isEditing && <button type="button" onClick={resetForm} className="cancel-btn">Cancelar Edição</button>}
      </form>

      <div className="data-list">
        <h3>Empresas Cadastradas</h3>
        <div className="company-grid">
          {empresas.map(empresa => (
            <div key={empresa.id} className={`company-card ${selectedEmpresa?.id === empresa.id ? 'active' : ''}`}>
              <img
                src={empresa.logo_url || 'https://via.placeholder.com/200x100.png?text=MenuGo'}
                alt={`Logo de ${empresa.nome}`}
                className="company-card-logo"
              />
              <div className="company-card-info">
                <h4>{empresa.nome}</h4>
                <p>{empresa.cidade}, {empresa.uf}</p>
              </div>
              <div className="company-card-actions">
                <button onClick={() => handleManageClick(empresa)} title="Gerenciar Cardápio">Gerenciar</button>
                <button onClick={() => handleEdit(empresa)} title="Editar Empresa"><FaEdit /></button>
                <button onClick={() => handleDelete(empresa.id)} className="delete-btn" title="Excluir Empresa"><FaTrash /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}