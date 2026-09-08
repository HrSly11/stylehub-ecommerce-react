import { applyDiscount } from '../../src/utils/discountLogic';

/**
 * PRUEBAS UNITARIAS: Lógica de Cupones y Descuentos
 * Objetivo: Validar el comportamiento de la función pura de forma aislada sin dependencias externas.
 */
describe('Pruebas Unitarias: discountLogic', () => {
  it('Debería descontar un 20% al total si el código es PROMO20', () => {
    const result = applyDiscount(100, 'PROMO20');
    expect(result).toBe(80);
  });

  it('Debería descontar un 10% al total si el código es STYLE10', () => {
    const result = applyDiscount(100, 'STYLE10');
    expect(result).toBe(90);
  });

  it('Debería descontar un 30% al total si el código es DESCUENTO30', () => {
    const result = applyDiscount(200, 'DESCUENTO30');
    expect(result).toBe(140);
  });

  it('Debería ser insensible a mayúsculas y espacios en el código', () => {
    const result = applyDiscount(100, '  promo20  ');
    expect(result).toBe(80);
  });

  it('Debería retornar el total original si el código es inválido o no existe', () => {
    const result = applyDiscount(100, 'CODIGO_INVALIDO');
    expect(result).toBe(100);
  });

  it('Debería retornar el total original si no se envía código o es undefined', () => {
    const result = applyDiscount(100, undefined);
    expect(result).toBe(100);
  });

  it('Debería manejar correctamente montos negativos o valores no numéricos', () => {
    expect(applyDiscount(-50, 'PROMO20')).toBe(0);
    expect(applyDiscount('invalido', 'PROMO20')).toBe(0);
    expect(applyDiscount(null, 'PROMO20')).toBe(0);
  });
});
