import { validateEmail, validatePassword, validateRegistrationData } from '../../src/utils/userValidation';

/**
 * PRUEBAS UNITARIAS: Validaciones de Registro y Formulario de Usuario
 * Objetivo: Asegurar que las reglas de negocio de autenticación se cumplan antes de enviar al backend.
 */
describe('Pruebas Unitarias: Validaciones de Usuario (userValidation)', () => {
  describe('validateEmail', () => {
    it('Debería retornar true para correos válidos', () => {
      expect(validateEmail('usuario@stylehub.com')).toBe(true);
      expect(validateEmail('harry.rodriguez@pucp.edu.pe')).toBe(true);
    });

    it('Debería retornar false para correos mal formados o vacíos', () => {
      expect(validateEmail('sin-arroba.com')).toBe(false);
      expect(validateEmail('@dominio.com')).toBe(false);
      expect(validateEmail('usuario@')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail(null)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('Debería aceptar contraseñas de al menos 4 caracteres', () => {
      expect(validatePassword('1234')).toBe(true);
      expect(validatePassword('claveSegura2026')).toBe(true);
    });

    it('Debería rechazar contraseñas cortas o vacías', () => {
      expect(validatePassword('123')).toBe(false);
      expect(validatePassword('')).toBe(false);
      expect(validatePassword(null)).toBe(false);
    });
  });

  describe('validateRegistrationData', () => {
    const validData = {
      nombres: 'Harry Sly',
      apellidos: 'Rodríguez Sandoval',
      correo: 'usuario@stylehub.com',
      ciudad: 'Lima',
      direccion: 'Av. Universitaria 1801',
      clave: '1234',
      clave2: '1234',
      terminos: true
    };

    it('Debería validar correctamente un formulario completo y válido', () => {
      const result = validateRegistrationData(validData);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('Debería rechazar cuando falta el nombre o apellido', () => {
      const result = validateRegistrationData({ ...validData, nombres: '' });
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/nombre es obligatorio/i);
    });

    it('Debería rechazar cuando las contraseñas no coinciden', () => {
      const result = validateRegistrationData({ ...validData, clave2: '5678' });
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/contraseñas no coinciden/i);
    });

    it('Debería rechazar cuando no se aceptan los términos y condiciones', () => {
      const result = validateRegistrationData({ ...validData, terminos: false });
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/términos y condiciones/i);
    });
  });
});
