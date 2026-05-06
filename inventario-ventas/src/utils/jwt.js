// ============================================================
// utils/jwt.js — Utilidad para generar y verificar JWT
// ============================================================
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_dev';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

/**
 * Genera un token JWT firmado
 * @param {Object} payload - Datos del usuario a incluir en el token
 * @returns {string} Token JWT
 */
const generarToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verifica y decodifica un token JWT
 * @param {string} token
 * @returns {Object} Payload decodificado
 * @throws {JsonWebTokenError|TokenExpiredError}
 */
const verificarToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Decodifica un token sin verificar firma (solo lectura)
 * @param {string} token
 * @returns {Object|null}
 */
const decodificarToken = (token) => {
  return jwt.decode(token);
};

module.exports = { generarToken, verificarToken, decodificarToken };
