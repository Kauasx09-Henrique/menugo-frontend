// src/components/ProductCard.jsx

// Recebe dois "props": o objeto do produto e a função para adicionar ao carrinho
export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">
      <div className="product-info">
        <h4>{product.nome}</h4>
        <p className="product-description">{product.descricao}</p>
      </div>
      <div className="product-action">
        <p className="product-price">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.preco)}
        </p>
        <button className="add-to-cart-btn" onClick={() => onAddToCart(product)}>
          Adicionar
        </button>
      </div>
    </div>
  );
}