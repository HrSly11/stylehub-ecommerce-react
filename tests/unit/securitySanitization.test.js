import { sanitizeHtml } from '../../server/app.js';
import {
  reviewSchema,
  userProfileUpdateSchema
} from '../../server/schemas/validation.js';

describe('Pruebas Unitarias de Seguridad: Sanitización XSS y Validación Zod', () => {
  describe('Sanitización XSS y Prevención de Inyecciones', () => {
    it('Debería neutralizar etiquetas <script> maliciosas', () => {
      const payload = 'Gran producto <script>alert("XSS Vulnerability")</script> muy cómodo';
      const clean = sanitizeHtml(payload);
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('alert("XSS Vulnerability")');
      expect(clean).toBe('Gran producto  muy cómodo');
    });

    it('Debería eliminar atributos de ejecución inline como onerror u onclick', () => {
      const payload = 'Excelente tela <img src="invalid.jpg" onerror="alert(1)"> recomendada';
      const clean = sanitizeHtml(payload);
      expect(clean).not.toContain('onerror');
      expect(clean).toContain('Excelente tela');
    });

    it('Debería remover esquemas javascript: maliciosos', () => {
      const payload = '<a href="javascript:stealCookies()">Haz clic aquí</a>';
      const clean = sanitizeHtml(payload);
      expect(clean).not.toContain('javascript:');
    });

    it('Debería permitir formato básico seguro (negrita <b> y cursiva <i>)', () => {
      const payload = 'Prenda <b>excelente</b> y <i>duradera</i>';
      const clean = sanitizeHtml(payload);
      expect(clean).toBe('Prenda <b>excelente</b> y <i>duradera</i>');
    });

    it('Debería manejar entradas nulas o vacías sin fallar', () => {
      expect(sanitizeHtml('')).toBe('');
      expect(sanitizeHtml(null)).toBe('');
      expect(sanitizeHtml(undefined)).toBe('');
    });
  });

  describe('Esquemas Zod contra Mass Assignment y Asignación de Privilegios', () => {
    it('reviewSchema: Debería validar correctamente una reseña bien estructurada', () => {
      const validReview = {
        author: 'Mario Vargas',
        text: 'La calidad del algodón es sobresaliente.',
        rating: 5
      };

      const result = reviewSchema.safeParse(validReview);
      expect(result.success).toBe(true);
      expect(result.data.author).toBe('Mario Vargas');
    });

    it('reviewSchema: Debería rechazar autores con menos de 2 caracteres', () => {
      const invalid = { author: 'M', text: 'Excelente prenda' };
      const result = reviewSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('author');
    });

    it('reviewSchema: Debería rechazar campos inyectados no autorizados (.strict)', () => {
      const malicious = {
        author: 'Hacker',
        text: 'Review con inyección',
        isAdmin: true,
        rol: 'superadmin'
      };

      const result = reviewSchema.safeParse(malicious);
      expect(result.success).toBe(false);
    });

    it('userProfileUpdateSchema: Debería impedir la inyección del campo rol (pucp-edicion4-sesion3-privilegios)', () => {
      const privilegeEscalationPayload = {
        direccion: 'Calle Falsa 123',
        rol: 'admin' // Intento de escalamiento de privilegios
      };

      const result = userProfileUpdateSchema.safeParse(privilegeEscalationPayload);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].code).toBe('unrecognized_keys');
      expect(result.error.issues[0].keys).toContain('rol');
    });

    it('userProfileUpdateSchema: Debería permitir la actualización de campos de perfil legítimos', () => {
      const validPayload = {
        telefono: '987654321',
        ciudad: 'Arequipa',
        direccion: 'Av. Las Palmeras 500'
      };

      const result = userProfileUpdateSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      expect(result.data.ciudad).toBe('Arequipa');
    });
  });
});
