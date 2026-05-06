const router = require('express').Router();
const { autenticado, soloAdmin } = require('../middleware/auth');
const c = require('../controllers/facturasController');

router.get('/resumen', autenticado, c.resumenFacturacion);
router.get('/', autenticado, c.obtenerFacturas);
router.get('/:id', autenticado, c.obtenerFacturaPorId);
router.patch('/:id/estado', autenticado, soloAdmin, c.cambiarEstado);
router.patch('/:id/notas', autenticado, c.agregarNota);

module.exports = router;
