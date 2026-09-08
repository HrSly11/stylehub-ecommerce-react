import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { calculateCartTotals } from '../utils/discountLogic';

const CartContext = createContext();

// Costo fijo de envío en soles
const ENVIO_COSTO = 10.00;

export function CartProvider({ children }) {
  // Inicializamos el carrito desde localStorage
  const [items, setItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem('carrito-stylehub');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch {
      return [];
    }
  });

  const [lastNotification, setLastNotification] = useState('');
  const [discountCode, setDiscountCode] = useState('');

  // Sincronizamos con localStorage cuando cambie el carrito
  useEffect(() => {
    localStorage.setItem('carrito-stylehub', JSON.stringify(items));
  }, [items]);

  // Agregar producto al carrito
  const addToCart = (product, quantity = 1) => {
    setItems(current => {
      const existingIndex = current.findIndex(item => item.id === product.id);
      if (existingIndex >= 0) {
        const updated = [...current];
        updated[existingIndex] = {
          ...updated[existingIndex],
          cantidad: updated[existingIndex].cantidad + quantity
        };
        return updated;
      }
      return [
        ...current,
        {
          ...product,
          cantidad: quantity
        }
      ];
    });

    setLastNotification(`"${product.nombre}" fue agregado al carrito.`);
  };

  // Eliminar un producto del carrito
  const removeFromCart = (productId) => {
    setItems(current => current.filter(item => item.id !== productId));
  };

  // Modificar la cantidad de un producto
  const updateQuantity = (productId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    if (isNaN(qty) || qty < 1) return;

    setItems(current =>
      current.map(item =>
        item.id === productId ? { ...item, cantidad: qty } : item
      )
    );
  };

  // Vaciar todo el carrito
  const clearCart = () => {
    setItems([]);
  };

  // Cálculos matemáticos mediante la función pura testeada
  const cartSummary = useMemo(() => {
    return calculateCartTotals(items, ENVIO_COSTO, discountCode);
  }, [items, discountCode]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems: cartSummary.totalItems,
        subtotal: cartSummary.subtotal,
        discount: cartSummary.discount,
        shippingCost: cartSummary.shipping,
        total: cartSummary.total,
        discountCode,
        setDiscountCode,
        lastNotification,
        setLastNotification
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
}

export default CartContext;
