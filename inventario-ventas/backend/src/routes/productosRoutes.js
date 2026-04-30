const router = require('express').Router();
const { autenticado, soloAdmin } = require('../middleware/auth');
const c = require('../controllers/productosController');

router.get('/stock-bajo', autenticado, c.stockBajo);
router.get('/', autenticado, c.obtenerProductos);
router.get('/:id', autenticado, c.obtenerProductoPorId);
router.post('/', autenticado, soloAdmin, c.crearProducto);
router.put('/:id', autenticado, soloAdmin, c.actualizarProducto);
router.delete('/:id', autenticado, soloAdmin, c.eliminarProducto);

module.exports = router;
