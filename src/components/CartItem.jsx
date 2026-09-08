import React from 'react';
import { Plus, Minus, Trash2, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  const handleIncrement = () => {
    updateQuantity(item.id, item.cantidad + 1);
  };

  const handleDecrement = () => {
    if (item.cantidad > 1) {
      updateQuantity(item.id, item.cantidad - 1);
    }
  };

  return (
    <article className="cart-item-card">
      <img
        src={item.imagen}
        alt={item.nombre}
        className="cart-thumb"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&auto=format&fit=crop&q=60';
        }}
      />

      <div className="cart-item-main">
        <h3>{item.nombre}</h3>
        <p className="sub-info">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Tag size={12} /> Talla: <strong>{item.talla}</strong>
          </span>
          <span style={{ margin: '0 8px' }}>•</span>
          <span>Categoría: <strong style={{ textTransform: 'capitalize' }}>{item.categoria === 'ninos' ? 'Niños' : item.categoria}</strong></span>
        </p>
        <p className="unit-price">Unitario: S/ {item.precio.toFixed(2)}</p>
      </div>

      <div className="qty-stepper">
        <button
          type="button"
          onClick={handleDecrement}
          title="Disminuir cantidad"
          aria-label="Disminuir cantidad"
          disabled={item.cantidad <= 1}
          style={{ opacity: item.cantidad <= 1 ? 0.4 : 1, cursor: item.cantidad <= 1 ? 'not-allowed' : 'pointer' }}
        >
          <Minus size={14} />
        </button>
        <span>{item.cantidad}</span>
        <button
          type="button"
          onClick={handleIncrement}
          title="Aumentar cantidad"
          aria-label="Aumentar cantidad"
        >
          <Plus size={14} />
        </button>
      </div>

      <div style={{ textAlign: 'right', minWidth: '100px' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
          S/ {(item.precio * item.cantidad).toFixed(2)}
        </p>
        <button
          type="button"
          className="boton-peligro"
          onClick={() => removeFromCart(item.id)}
          title="Eliminar producto"
        >
          <Trash2 size={13} /> Quitar
        </button>
      </div>
    </article>
  );
}

export default CartItem;
