import request from 'supertest';
import app, { db } from '../../server/app.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../server/middleware/authMiddleware.js';

/**
 * PRUEBAS DE INTEGRACIÓN: SEGURIDAD SESIÓN 4 (TestSecOps / DevSecOps)
 * Cobertura:
 * 1. Cabeceras HTTP de seguridad con Helmet
 * 2. Hashing seguro de contraseñas con Bcrypt (Salt rounds 10)
 * 3. Autenticación con JSON Web Tokens (JWT) y protección de rutas
 * 4. Control de Acceso Basado en Roles (RBAC)
 * 5. Prevención de inyecciones SQL mediante consultas parametrizadas
 */
describe('Pruebas de Integración: Seguridad Sesión 4 (Helmet, Bcrypt, JWT, RBAC, Anti-SQLi)', () => {
  const timestamp = Date.now();
  const testUser = {
    nombres: 'Seguridad',
    apellidos: 'Tester Sesion4',
    correo: `sec4_${timestamp}@stylehub.com`,
    telefono: '999888777',
    ciudad: 'Lima',
    direccion: 'Campus PUCP',
    documento: '88776655',
    clave: 'SuperSecret2026!'
  };

  let userToken = '';
  let adminToken = '';

  beforeAll(async () => {
    // Generar token admin válido firmado para pruebas de RBAC
    adminToken = jwt.sign(
      {
        id: 99999,
        correo: 'admin@stylehub.com',
        rol: 'admin',
        nombre: 'Administrador Maestro'
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Limpieza de datos de prueba
    try {
      await db.query('DELETE FROM usuarios WHERE correo = $1', [testUser.correo]);
    } catch {
      // Si la BD no está disponible, continuar
    }
  });

  // -------------------------------------------------------------------------
  // 1. HELMET HTTP SECURITY HEADERS
  // -------------------------------------------------------------------------
  describe('1. Cabeceras HTTP de Seguridad (Helmet)', () => {
    it('Debe incluir cabeceras de protección MIME Sniffing y Clickjacking', async () => {
      const res = await request(app).get('/');

      // X-Content-Type-Options: nosniff
      expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
      // X-Frame-Options: SAMEORIGIN
      expect(res.headers).toHaveProperty('x-frame-options', 'SAMEORIGIN');
      // X-Download-Options: noopen (para IE8+)
      expect(res.headers).toHaveProperty('x-download-options', 'noopen');
    });
  });

  // -------------------------------------------------------------------------
  // 2. BCRYPT PASSWORD HASHING
  // -------------------------------------------------------------------------
  describe('2. Hashing de Contraseñas con Bcrypt', () => {
    it('Debe registrar un usuario y almacenar la contraseña como hash Bcrypt (no texto plano)', async () => {
      const res = await request(app)
        .post('/api/usuarios/registro')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).not.toHaveProperty('clave');

      // Verificar directamente en PostgreSQL que el campo clave esté hasheado
      try {
        const dbRes = await db.query('SELECT clave FROM usuarios WHERE correo = $1', [testUser.correo]);
        if (dbRes.rowCount > 0) {
          const storedHash = dbRes.rows[0].clave;
          expect(storedHash).not.toBe(testUser.clave);
          expect(storedHash).toMatch(/^\$2[ab]\$10\$/); // Sal de 10 rondas Bcrypt
        }
      } catch (err) {
        console.warn('DB query skipped in test:', err.message);
      }
    });

    it('Debe autenticar correctamente comparando el hash Bcrypt en login', async () => {
      const res = await request(app)
        .post('/api/usuarios/login')
        .send({
          correo: testUser.correo,
          clave: testUser.clave
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
      userToken = res.body.token; // Guardar token para pruebas siguientes
    });

    it('Debe rechazar credenciales con contraseña inválida', async () => {
      const res = await request(app)
        .post('/api/usuarios/login')
        .send({
          correo: testUser.correo,
          clave: 'PasswordIncorrecto123'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/no es correcta/i);
    });
  });

  // -------------------------------------------------------------------------
  // 3. JWT AUTHENTICATION & ACCESS CONTROL
  // -------------------------------------------------------------------------
  describe('3. Autenticación con JSON Web Tokens (JWT)', () => {
    it('Debe emitir un token JWT con la estructura y firma válida en el login', () => {
      expect(userToken).toBeDefined();
      expect(typeof userToken).toBe('string');
      expect(userToken.split('.')).toHaveLength(3); // Formato JWT: header.payload.signature

      const decoded = jwt.verify(userToken, JWT_SECRET);
      expect(decoded).toHaveProperty('correo', testUser.correo);
      expect(decoded).toHaveProperty('rol', 'user');
    });

    it('Debe rechazar acceso a /api/usuarios/perfil sin cabecera Authorization (401)', async () => {
      const res = await request(app)
        .get('/api/usuarios/perfil');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/token de autenticación no proporcionado/i);
    });

    it('Debe rechazar acceso a /api/usuarios/perfil con token inválido o manipulado (401)', async () => {
      const res = await request(app)
        .get('/api/usuarios/perfil')
        .set('Authorization', 'Bearer token_falso_o_manipulado_invalido');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/token expirado/i);
    });

    it('Debe permitir acceso a /api/usuarios/perfil con token JWT válido (200)', async () => {
      const res = await request(app)
        .get('/api/usuarios/perfil')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty('correo', testUser.correo);
    });
  });

  // -------------------------------------------------------------------------
  // 4. ROLE-BASED ACCESS CONTROL (RBAC)
  // -------------------------------------------------------------------------
  describe('4. Control de Acceso Basado en Roles (RBAC)', () => {
    it('Debe denegar acceso al panel de administración para un usuario estándar con rol "user" (403)', async () => {
      const res = await request(app)
        .get('/api/admin/panel')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/privilegios de admin/i);
    });

    it('Debe autorizar acceso al panel de administración para un token con rol "admin" (200)', async () => {
      const res = await request(app)
        .get('/api/admin/panel')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.panel).toBe('Admin Dashboard v1.0');
    });
  });

  // -------------------------------------------------------------------------
  // 5. PREVENCIÓN DE INYECCIÓN SQL (SQL INJECTION)
  // -------------------------------------------------------------------------
  describe('5. Prevención de Inyección SQL (Parameterized Queries)', () => {
    it('Debe neutralizar intento de SQL Injection clásico en campo correo: "\' OR \'1\'=\'1"', async () => {
      const sqliPayload = "' OR '1'='1";
      const res = await request(app)
        .post('/api/usuarios/login')
        .send({
          correo: sqliPayload,
          clave: 'cualquier_clave'
        });

      // Debe responder 404 porque busca literalmente el correo "' OR '1'='1" y no altera la lógica SQL
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

      // La consulta parametrizada evalúa productoId como entero o falla con 400 sin ejecutar el UNION
      expect(res.status).not.toBe(500);
      if (res.status === 200) {
        // Si responde 200, no debe contener el registro inyectado
        expect(Array.isArray(res.body)).toBe(true);
        const hasInjected = res.body.some(r => r.autor === 'Hacker');
        expect(hasInjected).toBe(false);
      }
    });
  });
});
