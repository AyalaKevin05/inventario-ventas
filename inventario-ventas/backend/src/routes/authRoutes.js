// routes/authRoutes.js
const router = require('express').Router();
const { autenticado, soloAdmin } = require('../middleware/auth');
const { login, register, perfil, cambiarContrasena } = require('../controllers/authController');

router.post('/login', login);
router.post('/register', autenticado, soloAdmin, register);
router.get('/perfil', autenticado, perfil);
router.put('/cambiar-contrasena', autenticado, cambiarContrasena);

module.exports = router;
