const router = require('express').Router();
const { autenticado } = require('../middleware/auth');
const c = require('../controllers/ventasController');

router.get('/reportes/mas-vendidos', autenticado, c.productosMasVendidos);
router.get('/reportes/por-mes', autenticado, c.ventasPorMes);
router.get('/', autenticado, c.obtenerVentas);
router.get('/:id', autenticado, c.obtenerVentaPorId);
router.post('/', autenticado, c.crearVenta);

module.exports = router;
