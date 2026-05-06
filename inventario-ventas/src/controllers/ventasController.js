const pool = require('../config/db');

const obtenerVentas = async (req, res) => {
  const { desde, hasta } = req.query;
  let query = `
    SELECT v.id_venta, v.fecha, v.subtotal, v.impuesto, v.total,
           u.nombre AS vendedor, c.nombre AS cliente,
           COUNT(dv.id_detalle) AS items
    FROM ventas v
    JOIN usuarios u ON v.id_usuario = u.id_usuario
    LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
    JOIN detalle_venta dv ON v.id_venta = dv.id_venta
  `;
  const params = [];
  if (desde && hasta) { query += ' WHERE v.fecha BETWEEN $1 AND $2'; params.push(desde, hasta + 'T23:59:59'); }
  query += ' GROUP BY v.id_venta, v.fecha, v.subtotal, v.impuesto, v.total, u.nombre, c.nombre ORDER BY v.fecha DESC';

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ventas.' });
  }
};

const obtenerVentaPorId = async (req, res) => {
  try {
    const venta = await pool.query(`
      SELECT v.*, u.nombre AS vendedor, c.nombre AS cliente, c.documento, c.email AS email_cliente
      FROM ventas v
      JOIN usuarios u ON v.id_usuario = u.id_usuario
      LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
      WHERE v.id_venta = $1
    `, [req.params.id]);
    if (!venta.rows.length) return res.status(404).json({ error: 'Venta no encontrada.' });

    const detalle = await pool.query(`
      SELECT dv.*, p.nombre AS producto
      FROM detalle_venta dv
      JOIN productos p ON dv.id_producto = p.id_producto
      WHERE dv.id_venta = $1
    `, [req.params.id]);

    const factura = await pool.query('SELECT * FROM facturas WHERE id_venta = $1', [req.params.id]);

    res.json({ ...venta.rows[0], detalle: detalle.rows, factura: factura.rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener venta.' });
  }
};

const crearVenta = async (req, res) => {
  const { items, id_cliente, tasa_impuesto = 0.19 } = req.body;
  const id_usuario = req.usuario.id_usuario;

  if (!items || items.length === 0)
    return res.status(400).json({ error: 'La venta debe tener al menos un producto.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ventaResult = await client.query(
      'INSERT INTO ventas (id_usuario, id_cliente, subtotal, impuesto, total) VALUES ($1,$2,0,0,0) RETURNING id_venta',
      [id_usuario, id_cliente || null]
    );
    const id_venta = ventaResult.rows[0].id_venta;
    let subtotal = 0;

    for (const item of items) {
      const { id_producto, cantidad } = item;
      const prod = await client.query(
        'SELECT precio, stock, nombre FROM productos WHERE id_producto = $1 FOR UPDATE',
        [id_producto]
      );
      if (!prod.rows.length) throw new Error(`Producto ID ${id_producto} no encontrado.`);
      const { precio, stock, nombre } = prod.rows[0];
      if (stock < cantidad) throw new Error(`Stock insuficiente para "${nombre}". Disponible: ${stock}.`);

      await client.query(
        'INSERT INTO detalle_venta (id_venta,id_producto,cantidad,precio_unitario) VALUES ($1,$2,$3,$4)',
        [id_venta, id_producto, cantidad, precio]
      );
      await client.query('UPDATE productos SET stock = stock - $1 WHERE id_producto = $2', [cantidad, id_producto]);
      subtotal += parseFloat(precio) * cantidad;
    }

    const impuesto = subtotal * tasa_impuesto;
    const total = subtotal + impuesto;
    await client.query(
      'UPDATE ventas SET subtotal=$1, impuesto=$2, total=$3 WHERE id_venta=$4',
      [subtotal, impuesto, total, id_venta]
    );

    // Generar factura automáticamente
    const numero = `FAC-${Date.now()}`;
    const facturaResult = await client.query(
      `INSERT INTO facturas (numero_factura, id_venta, subtotal, impuesto, total)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [numero, id_venta, subtotal, impuesto, total]
    );

    await client.query('COMMIT');
    res.status(201).json({
      mensaje: 'Venta registrada.',
      id_venta,
      total,
      factura: facturaResult.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message || 'Error al procesar venta.' });
  } finally {
    client.release();
  }
};

const productosMasVendidos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id_producto, p.nombre AS producto, c.nombre AS categoria,
             SUM(dv.cantidad) AS total_vendido, SUM(dv.subtotal) AS ingresos
      FROM detalle_venta dv
      JOIN productos p ON dv.id_producto = p.id_producto
      JOIN categorias c ON p.id_categoria = c.id_categoria
      GROUP BY p.id_producto, p.nombre, c.nombre
      ORDER BY total_vendido DESC LIMIT 10
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener reporte.' });
  }
};

const ventasPorMes = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DATE_TRUNC('month', fecha) AS mes,
             COUNT(*) AS numero_ventas, SUM(total) AS total_mes
      FROM ventas GROUP BY DATE_TRUNC('month', fecha) ORDER BY mes DESC LIMIT 12
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener reporte mensual.' });
  }
};

module.exports = { obtenerVentas, obtenerVentaPorId, crearVenta, productosMasVendidos, ventasPorMes };
