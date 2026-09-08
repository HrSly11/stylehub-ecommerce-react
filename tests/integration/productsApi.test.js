import request from 'supertest';
import app, { db } from '../../server/app.js';

/**
 * PRUEBAS DE INTEGRACIÓN: Catálogo de Productos y Healthcheck
 * Objetivo: Validar la integración con la base de datos PostgreSQL y respuestas JSON.
 */
describe('Pruebas de Integración: Endpoints de Catálogo y Salud', () => {
  it('Debería retornar 200 y el estado de la base de datos en GET /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('database', 'connected');
  });

  it('Debería retornar la lista completa de productos en GET /api/productos', async () => {
    const res = await request(app).get('/api/productos');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('nombre');
    expect(res.body[0]).toHaveProperty('precio');
    expect(res.body[0]).toHaveProperty('categoria');
  });

  it('Debería filtrar productos por la categoría "hombres"', async () => {
    const res = await request(app).get('/api/productos?categoria=hombres');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.every(p => p.categoria.toLowerCase() === 'hombres')).toBe(true);
  });

  it('Debería filtrar productos por la categoría "mujeres"', async () => {
    const res = await request(app).get('/api/productos?categoria=mujeres');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.every(p => p.categoria.toLowerCase() === 'mujeres')).toBe(true);
  });

  it('Debería filtrar productos por la categoría "ninos"', async () => {
    const res = await request(app).get('/api/productos?categoria=ninos');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.every(p => p.categoria.toLowerCase() === 'ninos')).toBe(true);
  });
});
