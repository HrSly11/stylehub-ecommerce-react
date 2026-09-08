import request from 'supertest';
import app from '../../server/app.js';

/**
 * PRUEBAS DE INTEGRACIÓN: Registro e Inicio de Sesión de Usuarios
 * Objetivo: Validar la persistencia en PostgreSQL, validación de credenciales y prevención de duplicados.
 */
describe('Pruebas de Integración: Endpoints de Usuarios y Autenticación', () => {
  const timestamp = Date.now();
  const testUser = {
    nombres: 'Estudiante',
    apellidos: 'PUCP Pruebas',
    correo: `test_${timestamp}@stylehub.com`,
    telefono: '912345678',
    ciudad: 'Lima',
    direccion: 'Av. Universitaria 1801',
    documento: '71829304',
    clave: 'claveTest2026'
  };

  it('Debería registrar exitosamente un nuevo usuario en POST /api/usuarios/registro', async () => {
    const res = await request(app)
      .post('/api/usuarios/registro')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('correo', testUser.correo);
    expect(res.body.user).not.toHaveProperty('clave'); // Seguridad: no exponer clave
  });

  it('Debería rechazar el registro con un correo electrónico duplicado (400 Bad Request)', async () => {
    const res = await request(app)
      .post('/api/usuarios/registro')
      .send(testUser);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.message).toMatch(/ya está registrado/i);
  });

  it('Debería autenticar con éxito en POST /api/usuarios/login con credenciales válidas', async () => {
    const res = await request(app)
      .post('/api/usuarios/login')
      .send({
        correo: testUser.correo,
        clave: testUser.clave
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.user).toHaveProperty('correo', testUser.correo);
  });

  it('Debería rechazar el login con una contraseña incorrecta (401 Unauthorized)', async () => {
    const res = await request(app)
      .post('/api/usuarios/login')
      .send({
        correo: testUser.correo,
        clave: 'contraseña_erronea_xyz'
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.message).toMatch(/no es correcta/i);
  });

  it('Debería rechazar el login si el usuario no existe (404 Not Found)', async () => {
    const res = await request(app)
      .post('/api/usuarios/login')
      .send({
        correo: 'no_existe_en_bd_2026@correo.com',
        clave: '1234'
      });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
  });
});
