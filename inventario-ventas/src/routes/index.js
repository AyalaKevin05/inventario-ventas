// routes/index.js — Registro central de todas las rutas
const router = require('express').Router();

router.use('/auth',      require('./authRoutes'));
router.use('/productos', require('./productosRoutes'));
router.use('/ventas',    require('./ventasRoutes'));
router.use('/facturas',  require('./facturasRoutes'));
router.use('/',          require('./catalogosRoutes'));

module.exports = router;
