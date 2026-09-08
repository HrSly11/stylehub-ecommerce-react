import request from 'supertest';
import app from '../../server/app.js';

describe('Pruebas de Integración: API de Reseñas y Seguridad de Privilegios', () => {
  describe('Endpoints de Reseñas / Opiniones (POST y GET /api/reviews)', () => {
    it('GET /api/reviews: Debería retornar el listado de reseñas con status 200', async () => {
      const res = await request(app).get('/api/reviews');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('author');
      expect(res.body[0]).toHaveProperty('text');
    });

    it('POST /api/reviews: Debería registrar una nueva reseña sanitizando contenido malicioso', async () => {
      const payload = {
        author: 'Lucía Fernández',
        text: '¡Hermoso vestido! <script>alert("xss")</script><b>100% recomendado</b>',
        rating: 5,
        productoId: 3
      };

      const res = await request(app)
        .post('/api/reviews')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.author).toBe('Lucía Fernández');
      // Verificación de sanitización: el script malicioso fue neutralizado
      expect(res.body.data.text).not.toContain('<script>');
      expect(res.body.data.text).toContain('<b>100% recomendado</b>');
    });

    it('POST /api/reviews: Debería rechazar mediante Zod si falta el autor o el texto (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .send({ author: 'Solo Autor' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty('error');
      expect(res.body).toHaveProperty('detalles');
    });

    it('POST /api/reviews: Debería rechazar campos no autorizados inyectados (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .send({
          author: 'Usuario Infiltrado',
          text: 'Comentario de prueba',
          campoInseguro: 'malicioso'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Mitigación de Escalamiento de Privilegios (pucp-edicion4-sesion3-privilegios)', () => {
    it('PUT /api/usuarios/:id: Debería rechazar un intento de inyectar rol de administrador (400 Bad Request)', async () => {
      const attackPayload = {
        direccion: 'Calle Nueva 456',
        rol: 'admin' // Intento de escalamiento malicioso
      };

      const res = await request(app)
        .put('/api/usuarios/1')
        .send(attackPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Error de validación');
    });

    it('PUT /api/usuarios/:id: Debería procesar exitosamente la actualización con campos legítimos (200 OK)', async () => {
      const validPayload = {
        ciudad: 'Cusco',
        telefono: '999888777'
      };

      const res = await request(app)
        .put('/api/usuarios/1')
        .send(validPayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/checkout/:id: Debería aplicar precio estándar a un usuario regular', async () => {
      const res = await request(app).get('/api/checkout/1');
      expect(res.status).toBe(200);
      expect(res.body.mensaje).toContain('$150.00');
    });

    it('GET /api/admin/panel: Debería bloquear accesos sin token administrativo (403 Forbidden)', async () => {
      const res = await request(app).get('/api/admin/panel');
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/admin/panel: Debería permitir acceso con token corporativo válido (200 OK)', async () => {
      const res = await request(app)
        .get('/api/admin/panel')
        .set('x-admin-token', 'admin-token-secret-2026');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
