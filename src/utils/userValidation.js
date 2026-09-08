/**
 * Lógica pura de validación de datos de usuario (Pruebas Unitarias)
 */

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') return false;
  return password.trim().length >= 4;
}

export function validateRegistrationData(data) {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Datos no proporcionados' };
  }

  const { nombres, apellidos, correo, ciudad, direccion, clave, clave2, terminos } = data;

  if (!nombres || !nombres.trim()) {
    return { isValid: false, error: 'El nombre es obligatorio' };
  }

  if (!apellidos || !apellidos.trim()) {
    return { isValid: false, error: 'El apellido es obligatorio' };
  }

  if (!validateEmail(correo)) {
    return { isValid: false, error: 'Formato de correo electrónico inválido' };
  }

  if (!ciudad || !ciudad.trim()) {
    return { isValid: false, error: 'La ciudad es obligatoria' };
  }

  if (!direccion || !direccion.trim()) {
    return { isValid: false, error: 'La dirección es obligatoria' };
  }

  if (!validatePassword(clave)) {
    return { isValid: false, error: 'La contraseña debe tener al menos 4 caracteres' };
  }

  if (clave !== clave2) {
    return { isValid: false, error: 'Las contraseñas no coinciden' };
  }

  if (terminos !== true) {
    return { isValid: false, error: 'Debe aceptar los términos y condiciones' };
  }

  return { isValid: true };
}
