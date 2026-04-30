const pool = require('../config/db');

// CATEGORÍAS
const obtenerCategorias = async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM categorias ORDER BY nombre')).rows); }
  catch { res.status(500).json({ error: 'Error al obtener categorías.' }); }
};
const crearCategoria = async (req, res) => {
  const { nombre, descripcion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Nombre requerido.' });
  try { res.status(201).json((await pool.query('INSERT INTO categorias (nombre,descripcion) VALUES ($1,$2) RETURNING *', [nombre, descripcion])).rows[0]); }
  catch (err) { res.status(err.code === '23505' ? 400 : 500).json({ error: err.code === '23505' ? 'Categoría ya existe.' : 'Error al crear.' }); }
};
const actualizarCategoria = async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    const r = await pool.query('UPDATE categorias SET nombre=$1,descripcion=$2 WHERE id_categoria=$3 RETURNING *', [nombre, descripcion, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'No encontrada.' });
    res.json(r.rows[0]);
  } catch { res.status(500).json({ error: 'Error al actualizar.' }); }
};
const eliminarCategoria = async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM categorias WHERE id_categoria=$1 RETURNING id_categoria', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'No encontrada.' });
    res.json({ mensaje: 'Eliminada.' });
  } catch (err) { res.status(err.code === '23503' ? 400 : 500).json({ error: err.code === '23503' ? 'Tiene productos asociados.' : 'Error al eliminar.' }); }
};

// PROVEEDORES
const obtenerProveedores = async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM proveedores ORDER BY nombre')).rows); }
  catch { res.status(500).json({ error: 'Error al obtener proveedores.' }); }
};
const crearProveedor = async (req, res) => {
  const { nombre, telefono, email } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Nombre requerido.' });
  try { res.status(201).json((await pool.query('INSERT INTO proveedores (nombre,telefono,email) VALUES ($1,$2,$3) RETURNING *', [nombre, telefono, email])).rows[0]); }
  catch { res.status(500).json({ error: 'Error al crear.' }); }
};
const actualizarProveedor = async (req, res) => {
  const { nombre, telefono, email } = req.body;
  try {
    const r = await pool.query('UPDATE proveedores SET nombre=$1,telefono=$2,email=$3 WHERE id_proveedor=$4 RETURNING *', [nombre, telefono, email, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'No encontrado.' });
    res.json(r.rows[0]);
  } catch { res.status(500).json({ error: 'Error al actualizar.' }); }
};
const eliminarProveedor = async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM proveedores WHERE id_proveedor=$1 RETURNING id_proveedor', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'No encontrado.' });
    res.json({ mensaje: 'Eliminado.' });
  } catch (err) { res.status(err.code === '23503' ? 400 : 500).json({ error: err.code === '23503' ? 'Tiene productos asociados.' : 'Error al eliminar.' }); }
};

// CLIENTES
const obtenerClientes = async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM clientes ORDER BY nombre')).rows); }
  catch { res.status(500).json({ error: 'Error al obtener clientes.' }); }
};
const crearCliente = async (req, res) => {
  const { nombre, documento, telefono, email, direccion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Nombre requerido.' });
  try { res.status(201).json((await pool.query('INSERT INTO clientes (nombre,documento,telefono,email,direccion) VALUES ($1,$2,$3,$4,$5) RETURNING *', [nombre, documento, telefono, email, direccion])).rows[0]); }
  catch (err) { res.status(err.code === '23505' ? 400 : 500).json({ error: err.code === '23505' ? 'Documento ya registrado.' : 'Error al crear.' }); }
};
const actualizarCliente = async (req, res) => {
  const { nombre, documento, telefono, email, direccion } = req.body;
  try {
    const r = await pool.query('UPDATE clientes SET nombre=$1,documento=$2,telefono=$3,email=$4,direccion=$5 WHERE id_cliente=$6 RETURNING *', [nombre, documento, telefono, email, direccion, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'No encontrado.' });
    res.json(r.rows[0]);
  } catch { res.status(500).json({ error: 'Error al actualizar.' }); }
};
const eliminarCliente = async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM clientes WHERE id_cliente=$1 RETURNING id_cliente', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'No encontrado.' });
    res.json({ mensaje: 'Eliminado.' });
  } catch (err) { res.status(err.code === '23503' ? 400 : 500).json({ error: err.code === '23503' ? 'Tiene ventas asociadas.' : 'Error al eliminar.' }); }
};

// USUARIOS Y ROLES
const obtenerUsuarios = async (req, res) => {
  try { res.json((await pool.query('SELECT u.id_usuario,u.nombre,u.correo,r.nombre AS rol,u.activo,u.creado_en FROM usuarios u JOIN roles r ON u.id_rol=r.id_rol ORDER BY u.nombre')).rows); }
  catch { res.status(500).json({ error: 'Error al obtener usuarios.' }); }
};
const obtenerRoles = async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM roles ORDER BY id_rol')).rows); }
  catch { res.status(500).json({ error: 'Error al obtener roles.' }); }
};

module.exports = {
  obtenerCategorias, crearCategoria, actualizarCategoria, eliminarCategoria,
  obtenerProveedores, crearProveedor, actualizarProveedor, eliminarProveedor,
  obtenerClientes, crearCliente, actualizarCliente, eliminarCliente,
  obtenerUsuarios, obtenerRoles,
};
