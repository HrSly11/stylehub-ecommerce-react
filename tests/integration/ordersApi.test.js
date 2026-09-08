import request from 'supertest';
import app, { db } from '../../server/app.js';

/**
 * PRUEBAS DE INTEGRACIÓN: Finalización de Pedidos y Checkout
 * Objetivo: Validar el guardado de órdenes de compra con múltiples productos en PostgreSQL.
 */
describe('Pruebas de Integración: Endpoint de Pedidos (POST /api/pedidos)', () => {
  afterAll(async () => {
    // Cerrar el pool de conexiones de PostgreSQL al finalizar la suite de integración
    await db.end();
  });

  const validOrderPayload = {
    comprador: {
      nombreCompleto: 'Harry Sly Rodríguez Sandoval',
      correo: 'usuario@stylehub.com',
      documento: '72345678',
      telefono: '987654321',
      direccion: 'Av. Universitaria 1801',
      ciudad: 'Lima'
    },
    productos: [
      { id: 1, nombre: 'Camisa Casual Azul', precio: 79.90, cantidad: 2 },
      { id: 3, nombre: 'Blusa Floral', precio: 69.90, cantidad: 1 }
    ],
    subtotal: 229.70,
    envio: 10.00,
    total: 239.70,
    metodoPago: 'tarjeta'
  };

  it('Debería crear una orden exitosamente y retornar status 201 con código de pedido', async () => {
    const res = await request(app)
      .post('/api/pedidos')
      .send(validOrderPayload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('pedido');
    expect(res.body.pedido).toHaveProperty('codigo');
    expect(res.body.pedido.codigo).toMatch(/^SH-\d{6}$/);
    expect(res.body.pedido).toHaveProperty('total', 239.70);
  });

  it('Debería rechazar un pedido si el carrito de productos está vacío (400 Bad Request)', async () => {
    const res = await request(app)
      .post('/api/pedidos')
      .send({
        ...validOrderPayload,
        productos: []
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success', false);
  });

  it('Debería rechazar un pedido sin datos del comprador (400 Bad Request)', async () => {
    const res = await request(app)
      .post('/api/pedidos')
      .send({
        ...validOrderPayload,
        comprador: null
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success', false);
  });
});
