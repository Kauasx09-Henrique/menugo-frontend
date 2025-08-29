export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">
      <div className="product-info">
        <h4>{product.nome}</h4>
        <p className="product-description">{product.descricao}</p>
        <p className="product-price">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.preco)}
        </p>
        <button className="add-to-cart-btn" onClick={() => onAddToCart(product)}>
          Adicionar
        </button>
      </div>
      {product.imagem_url && (
        <div className="product-image-wrapper">
          <img src={product.imagem_url} alt={product.nome} />
        </div>
      )}
    </div>
  );
}
