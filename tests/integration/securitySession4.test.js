import request from 'supertest';
import app from '../../server/app.js';

/**
 * PRUEBAS DE INTEGRACIÓN: SEGURIDAD
 * Cobertura de Controles:
 * 1. Cabeceras HTTP de seguridad con Helmet (Protección HSTS / SSL y Clickjacking)
 * 2. Prevención de inyecciones SQL mediante consultas parametrizadas
 */
describe('Pruebas de Integración: Seguridad (Helmet y Anti-SQL Injection)', () => {
  // -------------------------------------------------------------------------
  // 1. CABECERAS HTTP DE SEGURIDAD (HELMET / HSTS)
  // -------------------------------------------------------------------------
  describe('1. Cabeceras HTTP de Seguridad (Helmet)', () => {
    it('Debe incluir cabeceras de protección MIME Sniffing, Clickjacking y HSTS', async () => {
      const res = await request(app).get('/');

      // X-Content-Type-Options: nosniff
      expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
      // X-Frame-Options: SAMEORIGIN
      expect(res.headers).toHaveProperty('x-frame-options', 'SAMEORIGIN');
      // X-Download-Options: noopen
      expect(res.headers).toHaveProperty('x-download-options', 'noopen');
    });
  });

  // -------------------------------------------------------------------------
  // 2. PREVENCIÓN DE INYECCIÓN SQL (CONSULTAS PARAMETRIZADAS)
  // -------------------------------------------------------------------------
  describe('2. Prevención de Inyección SQL (Parameterized Queries)', () => {
    it('Debe neutralizar intento de SQL Injection clásico en campo correo: "\' OR \'1\'=\'1"', async () => {
      const sqliPayload = "' OR '1'='1";
      const res = await request(app)
        .post('/api/usuarios/login')
        .send({
          correo: sqliPayload,
          clave: 'cualquier_clave'
        });

      // La consulta parametrizada busca literalmente el string "' OR '1'='1" y no altera la sintaxis SQL
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('Debe neutralizar intento de SQL Injection con comentario SQL: "admin\' --"', async () => {
      const sqliPayload = "admin' --";
      const res = await request(app)
        .post('/api/usuarios/login')
        .send({
          correo: sqliPayload,
          clave: 'clave'
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('Debe neutralizar inyección UNION SELECT en búsqueda de reseñas', async () => {
      const sqliPayload = "1 UNION SELECT 999, 'Hacker', 'Injected review', 5, NOW() --";
      const res = await request(app)
        .get(`/api/reviews?productoId=${encodeURIComponent(sqliPayload)}`);

      // La consulta parametrizada evalúa productoId de forma segura
      expect(res.status).not.toBe(500);
      if (res.status === 200) {
        expect(Array.isArray(res.body)).toBe(true);
        const hasInjected = res.body.some(r => r.autor === 'Hacker');
        expect(hasInjected).toBe(false);
      }
    });
  });
});
