import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'stylehub_secret_jwt_key_2026_pucp';

/**
 * Middleware: Autenticación basada en JSON Web Tokens (JWT)
 * (Sesión 4: Seguridad en Desarrollo Web - Diapositiva 8 & 14)
 * Verifica que las solicitudes protegidas contengan un token válido en la cabecera Authorization.
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : (authHeader || req.cookies?.token);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Acceso no autorizado: Token de autenticación no proporcionado.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(401).json({
        success: false,
        error: 'Sesión no válida o token expirado. Por favor, inicia sesión nuevamente.'
      });
    }

    req.user = decodedUser;
    next();
  });
};

/**
 * Middleware: Control de acceso basado en roles (RBAC)
 * (Sesión 4: Seguridad en Desarrollo Web - Diapositiva 19)
 * Valida que el usuario autenticado cuente con el rol requerido (ej. 'admin').
 */
export const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado.'
      });
    }

    if (req.user.rol !== requiredRole) {
      return res.status(403).json({
        success: false,
        error: `Acceso denegado: Se requieren privilegios de ${requiredRole}.`
      });
    }

    next();
  };
};
