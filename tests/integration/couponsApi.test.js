import request from 'supertest';
import app from '../../server/app.js';

/**
 * PRUEBAS DE INTEGRACIÓN: API de Cupones y Descuentos
 * Objetivo: Validar el enrutamiento HTTP, códigos de respuesta (200, 400, 404) y estructura JSON.
 */
describe('Pruebas de Integración: POST /api/coupons/validate', () => {
  it('Debería retornar 200 y el porcentaje de descuento para un cupón válido (PROMO20)', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: 'PROMO20' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('valid', true);
    expect(res.body).toHaveProperty('discountPercentage', 20);
    expect(res.body).toHaveProperty('code', 'PROMO20');
  });

  it('Debería retornar 200 para el cupón STYLE10 con 10% de descuento', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: 'style10' });

    expect(res.status).toBe(200);
    expect(res.body.discountPercentage).toBe(10);
  });

  it('Debería retornar 404 para un cupón inexistente o caducado', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: 'CUPON_FALSO_2026' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('valid', false);
    expect(res.body).toHaveProperty('message');
  });

  it('Debería retornar 400 si la petición no incluye el código de cupón', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
