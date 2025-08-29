import { useState, useEffect } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';

export default function HomePage() {
  const EMPRESA_ID = 1;
  const { addToCart } = useCart();
  const [empresa, setEmpresa] = useState(null);
  const [categoriasComProdutos, setCategoriasComProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const empresaResponse = await api.get(`/empresas/${EMPRESA_ID}`);
        setEmpresa(empresaResponse.data);
        const categoriasResponse = await api.get(`/categorias/empresa/${EMPRESA_ID}`);
        const categorias = categoriasResponse.data;
        const categoriasComProdutosPromises = categorias.map(async (categoria) => {
          const produtosResponse = await api.get(`/produtos/categoria/${categoria.id}`);
          return { ...categoria, produtos: produtosResponse.data };
        });
        const resolvedCategoriasComProdutos = await Promise.all(categoriasComProdutosPromises);
        setCategoriasComProdutos(resolvedCategoriasComProdutos);
        setError('');
      } catch (err) {
        setError('Falha ao carregar o cardápio.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    Swal.fire({
      toast: true,
      icon: 'success',
      title: `${product.nome} foi adicionado!`,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });
  };

  const scrollToCategory = (categoryId) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) return <div className="loading-message">Carregando cardápio...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <>
      <div className="category-nav-wrapper">
        <nav className="category-nav container">
          {categoriasComProdutos.map(categoria => (
            <button key={categoria.id} onClick={() => scrollToCategory(categoria.id)}>
              {categoria.nome}
            </button>
          ))}
        </nav>
      </div>

      <div className="container">
        <header className="page-header">
          <img src={empresa?.logo_url} alt={`Logo de ${empresa?.nome}`} className="company-logo" />
          <h1>{empresa?.nome}</h1>
          <p>{empresa?.rua}, {empresa?.numero}</p>
        </header>

        <main>
          {categoriasComProdutos.map(categoria => (
            <section key={categoria.id} id={`category-${categoria.id}`} className="category">
              <h2>{categoria.nome}</h2>
              <div className="products-grid">
                {categoria.produtos.map(produto => (
                  <ProductCard
                    key={produto.id}
                    product={produto}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>
    </>
  );
}
