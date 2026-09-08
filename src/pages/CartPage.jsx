import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ArrowLeft, Trash2, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

export function CartPage() {
  const { items, subtotal, shippingCost, total, clearCart } = useCart();

  // Vista de carrito vacío
  if (items.length === 0) {
    return (
      <div className="empty-state-card">
        <div className="empty-icon-circle">
          <ShoppingBag size={38} />
        </div>
        <h2>Tu carrito está vacío</h2>
        <p style={{ maxWidth: '420px', margin: '8px auto 24px auto' }}>
          Todavía no has agregado prendas a tu bolsa de compras. Explora nuestro catálogo y encuentra tus favoritos.
        </p>
        <Link to="/" className="boton">
          <ArrowLeft size={16} /> Explorar Catálogo de Productos
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="titulo-seccion" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2>Mi Carrito de Compras</h2>
          <p>Revisa tus prendas seleccionadas, modifica cantidades o continúa hacia el pago.</p>
        </div>
        <button
          type="button"
          className="boton-peligro"
          onClick={clearCart}
          title="Eliminar todos los productos"
        >
          <Trash2 size={15} /> Vaciar Carrito
        </button>
      </div>

      <div className="cart-grid-layout">
        {/* Lista de productos en el carrito */}
        <div className="cart-items-container">
          {items.map(item => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Resumen del pedido */}
        <aside className="cart-summary-box">
          <h3>Resumen del Pedido</h3>

          <div className="summary-line">
            <span>Subtotal ({items.reduce((acc, i) => acc + i.cantidad, 0)} productos):</span>
            <span>S/ {subtotal.toFixed(2)}</span>
          </div>

          <div className="summary-line">
            <span>Costo de Envío a Domicilio:</span>
            <span>S/ {shippingCost.toFixed(2)}</span>
          </div>

          <div className="summary-line total">
            <span>Total:</span>
            <span style={{ color: 'var(--color-brand)' }}>S/ {total.toFixed(2)}</span>
          </div>

          <Link
            to="/finalizar-pedido"
            className="boton boton-acento"
            style={{ width: '100%', padding: '14px', boxSizing: 'border-box' }}
          >
            Proceder al Pago <ArrowRight size={17} />
          </Link>

          <Link
            to="/"
            className="boton boton-secundario"
            style={{ width: '100%', marginTop: '12px', boxSizing: 'border-box' }}
          >
            <ArrowLeft size={16} /> Continuar Comprando
          </Link>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={16} style={{ color: 'var(--status-success)' }} />
            <span>Compra protegida y encriptada SSL de 256 bits</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CartPage;
