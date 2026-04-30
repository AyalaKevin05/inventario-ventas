const router = require('express').Router();
const { autenticado, soloAdmin } = require('../middleware/auth');
const c = require('../controllers/catalogosController');

router.get('/categorias', autenticado, c.obtenerCategorias);
router.post('/categorias', autenticado, soloAdmin, c.crearCategoria);
router.put('/categorias/:id', autenticado, soloAdmin, c.actualizarCategoria);
router.delete('/categorias/:id', autenticado, soloAdmin, c.eliminarCategoria);

router.get('/proveedores', autenticado, c.obtenerProveedores);
router.post('/proveedores', autenticado, soloAdmin, c.crearProveedor);
router.put('/proveedores/:id', autenticado, soloAdmin, c.actualizarProveedor);
router.delete('/proveedores/:id', autenticado, soloAdmin, c.eliminarProveedor);

router.get('/clientes', autenticado, c.obtenerClientes);
router.post('/clientes', autenticado, c.crearCliente);
router.put('/clientes/:id', autenticado, c.actualizarCliente);
router.delete('/clientes/:id', autenticado, soloAdmin, c.eliminarCliente);

router.get('/usuarios', autenticado, soloAdmin, c.obtenerUsuarios);
router.get('/roles', autenticado, c.obtenerRoles);

module.exports = router;
