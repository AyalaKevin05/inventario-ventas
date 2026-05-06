// ============================================================
// middleware/auth.js — Middlewares de autenticación y roles
// ============================================================
const { verificarToken } = require('../utils/jwt');

/**
 * Middleware: verifica que el request tenga un JWT válido
 * Inyecta req.usuario con el payload del token
 */
const autenticado = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Token requerido. No autorizado.' });
  }

  try {
    req.usuario = verificarToken(token);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado. Inicia sesión nuevamente.' });
    }
    return res.status(403).json({ error: 'Token inválido.' });
  }
};

/**
 * Middleware: restringe acceso solo a Administradores (id_rol === 1)
 * Debe usarse DESPUÉS de `autenticado`
 */
const soloAdmin = (req, res, next) => {
  if (req.usuario.id_rol !== 1) {
    return res.status(403).json({ error: 'Acceso restringido. Se requiere rol Administrador.' });
  }
  next();
};

/**
 * Middleware factory: permite acceso a roles específicos
 * Uso: requiereRol([1, 2]) — permite Admin y Vendedor
 */
const requiereRol = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.id_rol)) {
      return res.status(403).json({
        error: `Acceso denegado. Roles permitidos: ${roles.join(', ')}`,
      });
    }
    next();
  };
};

module.exports = { autenticado, soloAdmin, requiereRol };
