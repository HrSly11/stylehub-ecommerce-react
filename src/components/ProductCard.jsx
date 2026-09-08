import React, { useState } from 'react';
import { ShoppingBag, Check, Tag, MessageSquare } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function ProductCard({ producto, onVerResenas = null }) {
  const { addToCart } = useCart();
  const [agregado, setAgregado] = useState(false);

  const handleAgregar = () => {
    addToCart(producto, 1);
    setAgregado(true);
    setTimeout(() => {
      setAgregado(false);
    }, 1500);
  };

  return (
    <article className="producto-card">
      <div className="producto-img-box">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&auto=format&fit=crop&q=60';
          }}
        />
        <span className="categoria-tag">
          {producto.categoria === 'ninos' ? 'Niños' : producto.categoria}
        </span>
      </div>

      <div className="producto-body">
        <h3>{producto.nombre}</h3>
        <p className="producto-desc">{producto.descripcion}</p>

        <span className="talla-badge">
          <Tag size={12} />
          Talla: {producto.talla}
        </span>

        <div className="producto-footer-row">
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', display: 'block' }}>Precio</span>
            <span className="precio-monto">S/ {producto.precio.toFixed(2)}</span>
          </div>
        </div>

        <div className="producto-card-botones">
          <button
            type="button"
            className={`btn-card-add ${agregado ? 'boton-acento' : 'boton'}`}
            onClick={handleAgregar}
          >
            {agregado ? (
              <>
                <Check size={16} /> ¡Agregado al Carrito!
              </>
            ) : (
              <>
                <ShoppingBag size={16} /> Agregar al carrito
              </>
            )}
          </button>

          {onVerResenas && (
            <button
              type="button"
              className="btn-card-opiniones"
              onClick={() => onVerResenas(producto)}
              title={`Ver y agregar opiniones para ${producto.nombre}`}
            >
              <MessageSquare size={15} />
              <span>Opiniones</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
