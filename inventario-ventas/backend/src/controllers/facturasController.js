// ============================================================
// controllers/facturasController.js — Sistema de Facturación
// ============================================================
const pool = require('../config/db');

const obtenerFacturas = async (req, res) => {
  const { estado, desde, hasta } = req.query;
  let query = `
    SELECT f.*, v.fecha AS fecha_venta, u.nombre AS vendedor,
           c.nombre AS cliente, c.documento
    FROM facturas f
    JOIN ventas v ON f.id_venta = v.id_venta
    JOIN usuarios u ON v.id_usuario = u.id_usuario
    LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
    WHERE 1=1
  `;
  const params = [];
  let idx = 1;

  if (estado) { query += ` AND f.estado = $${idx++}`; params.push(estado); }
  if (desde)  { query += ` AND f.fecha_emision >= $${idx++}`; params.push(desde); }
  if (hasta)  { query += ` AND f.fecha_emision <= $${idx++}`; params.push(hasta + 'T23:59:59'); }

  query += ' ORDER BY f.fecha_emision DESC';

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener facturas.' });
  }
};

const obtenerFacturaPorId = async (req, res) => {
  try {
    const factura = await pool.query(`
      SELECT f.*, u.nombre AS vendedor,
             c.nombre AS cliente, c.documento, c.email AS email_cliente, c.telefono, c.direccion
      FROM facturas f
      JOIN ventas v ON f.id_venta = v.id_venta
      JOIN usuarios u ON v.id_usuario = u.id_usuario
      LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
      WHERE f.id_factura = $1
    `, [req.params.id]);

    if (!factura.rows.length) return res.status(404).json({ error: 'Factura no encontrada.' });

    const detalle = await pool.query(`
      SELECT dv.*, p.nombre AS producto
      FROM detalle_venta dv
      JOIN productos p ON dv.id_producto = p.id_producto
      WHERE dv.id_venta = $1
    `, [factura.rows[0].id_venta]);

    res.json({ ...factura.rows[0], detalle: detalle.rows });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener factura.' });
  }
};

const cambiarEstado = async (req, res) => {
  const { estado } = req.body;
  const estadosValidos = ['emitida', 'pagada', 'anulada'];
  if (!estadosValidos.includes(estado))
    return res.status(400).json({ error: `Estado inválido. Use: ${estadosValidos.join(', ')}` });

  try {
    const result = await pool.query(
      'UPDATE facturas SET estado=$1 WHERE id_factura=$2 RETURNING *',
      [estado, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Factura no encontrada.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar estado.' });
  }
};

const agregarNota = async (req, res) => {
  const { notas } = req.body;
  try {
    const result = await pool.query(
      'UPDATE facturas SET notas=$1 WHERE id_factura=$2 RETURNING *',
      [notas, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Factura no encontrada.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar nota.' });
  }
};

const resumenFacturacion = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS total_facturas,
        COUNT(*) FILTER (WHERE estado = 'emitida')  AS emitidas,
        COUNT(*) FILTER (WHERE estado = 'pagada')   AS pagadas,
        COUNT(*) FILTER (WHERE estado = 'anulada')  AS anuladas,
        COALESCE(SUM(total) FILTER (WHERE estado = 'pagada'), 0)  AS total_cobrado,
        COALESCE(SUM(total) FILTER (WHERE estado = 'emitida'), 0) AS total_pendiente
      FROM facturas
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener resumen.' });
  }
};

module.exports = { obtenerFacturas, obtenerFacturaPorId, cambiarEstado, agregarNota, resumenFacturacion };
