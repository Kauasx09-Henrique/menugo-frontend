import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaTimes, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';

export default function Cart() {
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems, removeFromCart, updateQuantity, cartTotal, totalItemsInCart, clearCart } = useCart();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleCheckout = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Quase lá!',
      html: `
        <input id="swal-input1" class="swal2-input" placeholder="Seu Nome">
        <input id="swal-input2" class="swal2-input" placeholder="Seu WhatsApp (Contato)">
      `,
      focusConfirm: false,
      preConfirm: () => {
        const nome = document.getElementById('swal-input1').value;
        const contato = document.getElementById('swal-input2').value;
        if (!nome || !contato) {
          Swal.showValidationMessage(`Por favor, preencha os dois campos`);
        }
        return { nome, contato };
      }
    });

    if (formValues) {
      const pedidoData = {
        empresa_id: 1,
        session_id: localStorage.getItem('sessionId'),
        nome_cliente: formValues.nome,
        contato_cliente: formValues.contato,
        valor_total: cartTotal,
        itens: cartItems,
      };

      try {
        const response = await api.post('/pedidos', pedidoData);
        Swal.fire({
          icon: 'success',
          title: 'Pedido Enviado!',
          text: `Seu pedido #${response.data.pedidoId} foi recebido pela cozinha!`,
        });
        clearCart();
        setIsOpen(false);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Não foi possível enviar seu pedido. Tente novamente.',
        });
        console.error("Erro ao finalizar pedido:", error);
      }
    }
  };

  if (isAdminPage) {
    return null;
  }

  return (
    <>
      <button className="cart-fab" onClick={() => setIsOpen(true)} title="Ver carrinho">
        <FaShoppingCart />
        {totalItemsInCart > 0 && <span className="cart-badge">{totalItemsInCart}</span>}
      </button>

      <div className={`cart-overlay ${isOpen ? 'visible' : ''}`} onClick={() => setIsOpen(false)}></div>

      <div className={`cart-panel ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>Seu Pedido</h3>
          <button onClick={() => setIsOpen(false)} title="Fechar carrinho"><FaTimes /></button>
        </div>
        <div className="cart-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <FaShoppingCart size={40} />
              <p>Seu carrinho está vazio.</p>
              <span>Adicione itens do cardápio!</span>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <h4>{item.nome}</h4>
                  <span>{formatCurrency(item.preco)}</span>
                </div>
                <div className="cart-item-actions">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} title="Diminuir"><FaMinus /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} title="Aumentar"><FaPlus /></button>
                  <button onClick={() => removeFromCart(item.id)} className="remove-btn" title="Remover item"><FaTrash /></button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="cart-footer">
          <div className="cart-total">
            <span>Total</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>
          <button className="checkout-btn" disabled={cartItems.length === 0} onClick={handleCheckout}>
            Finalizar Pedido
          </button>
        </div>
      </div>
    </>
  );
}
