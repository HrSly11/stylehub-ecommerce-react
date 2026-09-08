import { z } from 'zod';

/**
 * Zod Schema for Product Reviews
 * Strict schema prevents injection of arbitrary or hidden attributes.
 */
export const reviewSchema = z.object({
  author: z
    .string({ required_error: "El campo 'author' es obligatorio" })
    .trim()
    .min(2, "El nombre del autor debe tener al menos 2 caracteres")
    .max(50, "El nombre del autor no puede exceder 50 caracteres"),
  text: z
    .string({ required_error: "El campo 'text' es obligatorio" })
    .trim()
    .min(3, "La opinión debe tener al menos 3 caracteres")
    .max(1000, "La opinión no puede exceder 1000 caracteres"),
  rating: z
    .number()
    .int("La calificación debe ser un número entero")
    .min(1, "La calificación mínima es 1")
    .max(5, "La calificación máxima es 5")
    .optional()
    .default(5),
  productoId: z.union([z.number(), z.string()]).optional(),
}).strict("No se permiten campos adicionales en la reseña");

/**
 * Zod Schema for User Profile Updates
 * Defense against Mass Assignment & Privilege Escalation (pucp-edicion4-sesion3-privilegios).
 * Explicit whitelist: 'rol', 'admin', 'id', 'correo' cannot be manipulated by users.
 */
export const userProfileUpdateSchema = z.object({
  nombres: z.string().trim().min(2, "Nombres deben tener al menos 2 caracteres").max(100).optional(),
  apellidos: z.string().trim().min(2, "Apellidos deben tener al menos 2 caracteres").max(100).optional(),
  telefono: z.string().trim().max(50).optional(),
  ciudad: z.string().trim().max(100).optional(),
  direccion: z.string().trim().max(200).optional(),
  documento: z.string().trim().max(50).optional(),
}).strict("Acceso no autorizado: No se permite la modificación de privilegios ni campos no autorizados");

/**
 * Zod Schema for Coupon Validation
 */
export const couponSchema = z.object({
  code: z.string({ required_error: "El código de cupón es requerido" }).trim().min(1, "El código de cupón no puede estar vacío").max(30),
}).strict();

/**
 * Express Middleware for validating request bodies against Zod schemas
 * Adheres to Clean Code principles: descriptive context, standard error responses.
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.issues || result.error.errors || [];
      const detalles = issues.map(err => ({
        campo: err.path.join('.') || 'body',
        mensaje: err.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Error de validación en los datos enviados.',
        detalles
      });
    }

    req.validatedBody = result.data;
    next();
  };
};
