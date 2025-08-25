// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext'; // 1. Importe o hook do carrinho
import Swal from 'sweetalert2'; // 2. Importe o SweetAlert para as notificações

export default function HomePage() {
  const EMPRESA_ID = 1;
  const { addToCart } = useCart(); // 3. Pegue a função addToCart do contexto

  const [empresa, setEmpresa] = useState(null);
  const [categoriasComProdutos, setCategoriasComProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Busca a empresa
        const empresaResponse = await api.get(`/empresas/${EMPRESA_ID}`);
        setEmpresa(empresaResponse.data);

        // Busca as categorias da empresa
        const categoriasResponse = await api.get(`/categorias/empresa/${EMPRESA_ID}`);
        const categorias = categoriasResponse.data;

        // Para cada categoria, busca seus produtos
        const categoriasComProdutosPromises = categorias.map(async (categoria) => {
          const produtosResponse = await api.get(`/produtos/categoria/${categoria.id}`);
          return { ...categoria, produtos: produtosResponse.data };
        });

        const resolvedCategoriasComProdutos = await Promise.all(categoriasComProdutosPromises);
        setCategoriasComProdutos(resolvedCategoriasComProdutos);

        setError('');
      } catch (err) {
        setError('Falha ao carregar o cardápio. Verifique se os dados foram cadastrados.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 4. Esta é a função que foi atualizada!
  const handleAddToCart = (product) => {
    addToCart(product); // Adiciona o produto ao estado global do carrinho

    // Mostra uma notificação "toast" bonita no canto da tela
    Swal.fire({
      toast: true,
      icon: 'success',
      title: `${product.nome} foi adicionado!`,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000, // A notificação some em 2 segundos
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
  };

  if (loading) return <div className="loading-message">Carregando cardápio...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="container">
      <header className="page-header">
        <h1>{empresa?.nome}</h1>
        <p>{empresa?.rua}, {empresa?.numero}</p>
      </header>

      <main>
        {categoriasComProdutos.map(categoria => (
          <section key={categoria.id} className="category">
            <h2>{categoria.nome}</h2>
            <div className="products-grid">
              {categoria.produtos.map(produto => (
                <ProductCard
                  key={produto.id}
                  product={produto}
                  onAddToCart={handleAddToCart} // Agora está conectado à função real!
                />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}