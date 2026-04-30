const pool = require('../config/db');

const obtenerProductos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.nombre AS categoria, pr.nombre AS proveedor
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id_categoria
      JOIN proveedores pr ON p.id_proveedor = pr.id_proveedor
      ORDER BY p.nombre
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos.' });
  }
};

const obtenerProductoPorId = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.nombre AS categoria, pr.nombre AS proveedor
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id_categoria
      JOIN proveedores pr ON p.id_proveedor = pr.id_proveedor
      WHERE p.id_producto = $1
    `, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener producto.' });
  }
};

const crearProducto = async (req, res) => {
  const { nombre, descripcion, precio, stock, id_categoria, id_proveedor } = req.body;
  if (!nombre || !precio || !id_categoria || !id_proveedor)
    return res.status(400).json({ error: 'Nombre, precio, categoría y proveedor son requeridos.' });
  try {
    const result = await pool.query(
      'INSERT INTO productos (nombre,descripcion,precio,stock,id_categoria,id_proveedor) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [nombre, descripcion, precio, stock || 0, id_categoria, id_proveedor]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear producto.' });
  }
};

const actualizarProducto = async (req, res) => {
  const { nombre, descripcion, precio, stock, id_categoria, id_proveedor } = req.body;
  try {
    const result = await pool.query(
      'UPDATE productos SET nombre=$1,descripcion=$2,precio=$3,stock=$4,id_categoria=$5,id_proveedor=$6 WHERE id_producto=$7 RETURNING *',
      [nombre, descripcion, precio, stock, id_categoria, id_proveedor, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar producto.' });
  }
};

const eliminarProducto = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM productos WHERE id_producto=$1 RETURNING id_producto', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.json({ mensaje: 'Producto eliminado.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar producto.' });
  }
};

const stockBajo = async (req, res) => {
  const limite = parseInt(req.query.limite) || 20;
  try {
    const result = await pool.query(`
      SELECT p.*, c.nombre AS categoria, pr.nombre AS proveedor, pr.email AS contacto
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id_categoria
      JOIN proveedores pr ON p.id_proveedor = pr.id_proveedor
      WHERE p.stock < $1 ORDER BY p.stock ASC
    `, [limite]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener stock bajo.' });
  }
};

module.exports = { obtenerProductos, obtenerProductoPorId, crearProducto, actualizarProducto, eliminarProducto, stockBajo };
