import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaTimes, FaPlus, FaMinus, FaTrash, FaCopy } from 'react-icons/fa';
import api from '../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

// Função auxiliar para gerar o payload do PIX
const generatePixPayload = (pixKey, merchantName, merchantCity, amount, txid = '***') => {
  const formatField = (id, value) => {
    const length = value.length.toString().padStart(2, '0');
    return `${id}${length}${value}`;
  };

  const payload = [
    formatField('00', '01'),
    formatField('26', formatField('00', 'br.gov.bcb.pix') + formatField('01', pixKey)),
    formatField('52', '0000'),
    formatField('53', '986'),
    formatField('54', amount.toFixed(2)),
    formatField('58', 'BR'),
    formatField('59', merchantName.substring(0, 25)),
    formatField('60', merchantCity.substring(0, 15)),
    formatField('62', formatField('05', txid)),
  ].join('');

  const fullPayload = `${payload}6304`;

  let crc = 0xFFFF;
  for (let i = 0; i < fullPayload.length; i++) {
    crc ^= fullPayload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  const crc16 = (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');

  return `${fullPayload}${crc16}`;
};

export default function Cart() {
  const navigate = useNavigate();
  const {
    cartItems, removeFromCart, updateQuantity, cartTotal,
    isCartOpen, setIsCartOpen, clearCart
  } = useCart();

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      Swal.fire({
        toast: true,
        icon: 'success',
        title: 'Código PIX copiado!',
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
      });
    }).catch(err => {
      console.error('Falha ao copiar texto: ', err);
    });
  };

  const handleCheckout = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Identificação do Pedido',
      html: `
        <input id="swal-input1" class="swal2-input" placeholder="O seu Nome Completo">
        <input id="swal-input2" class="swal2-input" placeholder="O seu WhatsApp para Contato">
      `,
      focusConfirm: false,
      confirmButtonText: 'Gerar PIX para Pagamento',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nome = document.getElementById('swal-input1').value;
        const contato = document.getElementById('swal-input2').value;
        if (!nome || !contato) {
          Swal.showValidationMessage(`Por favor, preencha os dois campos`);
        }
        return { nome, contato };
      }
    });

    if (!formValues) return;

    const pixCopiaECola = generatePixPayload(
      "07772321112",
      "Kaua Henrique S De A",
      "SAO PAULO",
      cartTotal
    );
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pixCopiaECola)}`;

    const { isConfirmed: paymentConfirmed } = await Swal.fire({
      title: 'Pague com PIX para confirmar',
      html: `
        <div class="pix-container">
          <p>Escaneie o QR Code ou copie o código abaixo.</p>
          <img src="${qrCodeUrl}" alt="PIX QR Code" class="pix-qrcode" />
          <div class="pix-copia-cola">
            <input id="pix-code" class="swal2-input" value="${pixCopiaECola}" readonly>
            <button id="copy-btn" class="swal2-confirm swal2-styled" style="margin-left: 10px;">
              <i class="fa fa-copy"></i> Copiar
            </button>
          </div>
        </div>
      `,
      confirmButtonText: 'Já Paguei, Finalizar Pedido!',
      showCancelButton: true,
      cancelButtonText: 'Cancelar Pedido',
      didOpen: () => {
        document.getElementById('copy-btn').addEventListener('click', () => {
          copyToClipboard(pixCopiaECola);
        });
      }
    });

    if (!paymentConfirmed) return;

    Swal.fire({
      title: 'A confirmar o pagamento...',
      text: 'Aguarde um instante.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    setTimeout(async () => {
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

        await Swal.fire({
          icon: 'success',
          title: 'Pagamento Confirmado!',
          text: 'O seu pedido foi enviado para a cozinha.',
          timer: 2000,
          showConfirmButton: false,
        });

        clearCart();
        setIsCartOpen(false);
        navigate(`/status/${response.data.pedidoId}`);

      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Não foi possível enviar o seu pedido. Por favor, tente novamente.',
        });
        console.error("Erro ao finalizar pedido:", error);
      }
    }, 2500);
  };

  return (
    <>
      <div
        className={`cart-overlay ${isCartOpen ? 'visible' : ''}`}
        onClick={() => setIsCartOpen(false)}
      ></div>
      <div className={`cart-panel ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>O seu Pedido</h3>
          <button onClick={() => setIsCartOpen(false)} title="Fechar carrinho"><FaTimes /></button>
        </div>
        <div className="cart-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <FaShoppingCart size={40} />
              <p>O seu carrinho está vazio.</p>
              <span>Adicione itens do cardápio!</span>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.imagem_url || 'https://via.placeholder.com/60x60.png?text=Item'}
                  alt={item.nome}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <h4>{item.nome}</h4>
                  <div className="cart-item-price-quantity">
                    <span>{item.quantity} x {formatCurrency(item.preco)}</span>
                    <strong>{formatCurrency(item.preco * item.quantity)}</strong>
                  </div>
                </div>
                <div className="cart-item-actions">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} title="Diminuir"><FaMinus /></button>
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
