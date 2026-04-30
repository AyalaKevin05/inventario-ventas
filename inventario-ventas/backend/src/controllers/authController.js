// ============================================================
// controllers/authController.js — Controlador de autenticación
// ============================================================
const authService = require('../services/authService');

const login = async (req, res) => {
  const { correo, contrasena } = req.body;
  if (!correo || !contrasena)
    return res.status(400).json({ error: 'Correo y contraseña requeridos.' });

  try {
    const data = await authService.autenticar(correo, contrasena);
    res.json(data);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

const register = async (req, res) => {
  const { nombre, correo, contrasena, id_rol } = req.body;
  if (!nombre || !correo || !contrasena || !id_rol)
    return res.status(400).json({ error: 'Todos los campos son requeridos.' });

  try {
    const usuario = await authService.registrar({ nombre, correo, contrasena, id_rol });
    res.status(201).json({ mensaje: 'Usuario registrado.', usuario });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const perfil = async (req, res) => {
  try {
    const data = await authService.obtenerPerfil(req.usuario.id_usuario);
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const cambiarContrasena = async (req, res) => {
  const { contrasena_actual, contrasena_nueva } = req.body;
  if (!contrasena_actual || !contrasena_nueva)
    return res.status(400).json({ error: 'Ambas contraseñas son requeridas.' });

  try {
    await authService.cambiarContrasena(req.usuario.id_usuario, contrasena_actual, contrasena_nueva);
    res.json({ mensaje: 'Contraseña actualizada.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { login, register, perfil, cambiarContrasena };
