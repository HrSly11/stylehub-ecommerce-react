/**
 * Lógica pura de cálculo de descuentos y cupones (Pruebas Unitarias)
 */

export const COUPONS = {
  'STYLE10': 0.10,
  'PROMO20': 0.20,
  'DESCUENTO30': 0.30,
};

export function applyDiscount(total, code) {
  if (typeof total !== 'number' || isNaN(total) || total < 0) {
    return 0;
  }

  if (!code || typeof code !== 'string') {
    return total;
  }

  const cleanCode = code.trim().toUpperCase();
  const discountRate = COUPONS[cleanCode];

  if (discountRate) {
    const discounted = total * (1 - discountRate);
    return Math.round(discounted * 100) / 100;
  }

  return total;
}

export function calculateCartTotals(items = [], baseShipping = 10, discountCode = '') {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
      totalItems: 0,
    };
  }

  const totalItems = items.reduce((sum, item) => sum + (parseInt(item.cantidad, 10) || 1), 0);
  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.precio) || 0;
    const qty = parseInt(item.cantidad, 10) || 1;
    return sum + (price * qty);
  }, 0);

  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const subtotalWithDiscount = applyDiscount(roundedSubtotal, discountCode);
  const discount = Math.round((roundedSubtotal - subtotalWithDiscount) * 100) / 100;
  const shipping = roundedSubtotal > 0 ? baseShipping : 0;
  const total = Math.round((subtotalWithDiscount + shipping) * 100) / 100;

  return {
    subtotal: roundedSubtotal,
    discount,
    shipping,
    total,
    totalItems,
  };
}
