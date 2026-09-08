import { calculateCartTotals } from '../../src/utils/discountLogic';

/**
 * PRUEBAS UNITARIAS: Cálculos Matemáticos del Carrito de Compras
 * Objetivo: Validar la suma de subtotales, cantidades, costo de envío fijo y descuentos.
 */
describe('Pruebas Unitarias: Cálculos del Carrito (Cart Calculations)', () => {
  it('Debería retornar ceros si el carrito está vacío', () => {
    const totals = calculateCartTotals([], 10);
    expect(totals).toEqual({
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
      totalItems: 0,
    });
  });

  it('Debería calcular el total correctamente para un único producto', () => {
    const items = [{ id: 1, nombre: 'Camisa Casual', precio: 79.90, cantidad: 1 }];
    const totals = calculateCartTotals(items, 10);

    expect(totals.totalItems).toBe(1);
    expect(totals.subtotal).toBe(79.90);
    expect(totals.shipping).toBe(10);
    expect(totals.discount).toBe(0);
    expect(totals.total).toBe(89.90);
  });

  it('Debería calcular subtotales correctamente con múltiples cantidades de varios productos', () => {
    const items = [
      { id: 1, nombre: 'Camisa Casual', precio: 79.90, cantidad: 2 }, // 159.80
      { id: 2, nombre: 'Pantalón Jean', precio: 99.90, cantidad: 1 },  // 99.90
    ];
    const totals = calculateCartTotals(items, 10);

    expect(totals.totalItems).toBe(3);
    expect(totals.subtotal).toBe(259.70);
    expect(totals.shipping).toBe(10);
    expect(totals.total).toBe(269.70);
  });

  it('Debería aplicar descuento del cupón correctamente sobre el subtotal', () => {
    const items = [
      { id: 2, nombre: 'Pantalón Jean', precio: 100.00, cantidad: 2 }, // 200.00
    ];
    const totals = calculateCartTotals(items, 10, 'PROMO20'); // 20% descuento = 40.00

    expect(totals.subtotal).toBe(200.00);
    expect(totals.discount).toBe(40.00);
    expect(totals.shipping).toBe(10.00);
    expect(totals.total).toBe(170.00); // 160.00 + 10.00
  });

  it('Debería redondear con precisión a 2 decimales para evitar problemas de coma flotante', () => {
    const items = [
      { id: 1, nombre: 'Producto 1', precio: 19.99, cantidad: 3 }, // 59.97
      { id: 2, nombre: 'Producto 2', precio: 9.95, cantidad: 1 },  // 9.95 -> 69.92
    ];
    const totals = calculateCartTotals(items, 10);

    expect(totals.subtotal).toBe(69.92);
    expect(totals.total).toBe(79.92);
  });
});
