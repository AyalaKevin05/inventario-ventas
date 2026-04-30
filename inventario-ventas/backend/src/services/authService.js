// ============================================================
// services/authService.js — Lógica de negocio de autenticación
// ============================================================
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { generarToken } = require('../utils/jwt');

/**
 * Autentica un usuario con correo y contraseña
 * Retorna token + datos del usuario si las credenciales son válidas
 */
const autenticar = async (correo, contrasena) => {
  const result = await pool.query(
    `SELECT u.*, r.nombre AS rol
     FROM usuarios u
     JOIN roles r ON u.id_rol = r.id_rol
     WHERE u.correo = $1 AND u.activo = TRUE`,
    [correo]
  );

  if (result.rows.length === 0) {
    throw new Error('Credenciales incorrectas.');
  }

  const usuario = result.rows[0];
  const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

  if (!contrasenaValida) {
    throw new Error('Credenciales incorrectas.');
  }

  const payload = {
    id_usuario: usuario.id_usuario,
    nombre: usuario.nombre,
    correo: usuario.correo,
    id_rol: usuario.id_rol,
    rol: usuario.rol,
  };

  const token = generarToken(payload);

  return {
    token,
    usuario: {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    },
  };
};

/**
 * Registra un nuevo usuario (solo admin puede invocar esto)
 */
const registrar = async ({ nombre, correo, contrasena, id_rol }) => {
  const existe = await pool.query(
    'SELECT id_usuario FROM usuarios WHERE correo = $1',
    [correo]
  );

  if (existe.rows.length > 0) {
    throw new Error('El correo ya está registrado.');
  }

  const hash = await bcrypt.hash(contrasena, 10);

  const result = await pool.query(
    `INSERT INTO usuarios (nombre, correo, contrasena, id_rol)
     VALUES ($1, $2, $3, $4)
     RETURNING id_usuario, nombre, correo, id_rol`,
    [nombre, correo, hash, id_rol]
  );

  return result.rows[0];
};

/**
 * Cambia la contraseña de un usuario
 */
const cambiarContrasena = async (id_usuario, contrasenaActual, contrasenaNueva) => {
  const result = await pool.query(
    'SELECT contrasena FROM usuarios WHERE id_usuario = $1',
    [id_usuario]
  );

  if (result.rows.length === 0) throw new Error('Usuario no encontrado.');

  const valida = await bcrypt.compare(contrasenaActual, result.rows[0].contrasena);
  if (!valida) throw new Error('Contraseña actual incorrecta.');

  const hash = await bcrypt.hash(contrasenaNueva, 10);
  await pool.query(
    'UPDATE usuarios SET contrasena = $1 WHERE id_usuario = $2',
    [hash, id_usuario]
  );
};

/**
 * Obtiene el perfil del usuario autenticado
 */
const obtenerPerfil = async (id_usuario) => {
  const result = await pool.query(
    `SELECT u.id_usuario, u.nombre, u.correo, r.nombre AS rol, u.creado_en
     FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol
     WHERE u.id_usuario = $1`,
    [id_usuario]
  );

  if (result.rows.length === 0) throw new Error('Usuario no encontrado.');
  return result.rows[0];
};

module.exports = { autenticar, registrar, cambiarContrasena, obtenerPerfil };
