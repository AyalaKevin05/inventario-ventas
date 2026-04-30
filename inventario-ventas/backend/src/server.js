const express = require('express');
const cors = require('cors'); 
const routes = require('./routes/index'); // Asumiendo que este archivo ya gestiona todo
const app = express();

// 1. CONFIGURACIÓN DE CORS
const allowedOrigins = [
  'https://inventario-ventas.vercel.app', // SIN barra al final
  'https://kinventory-2ddbb.web.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// 2. MIDDLEWARES
app.use(express.json());

// 3. RUTA DE PRUEBA
app.get('/', (_, res) => res.json({ mensaje: 'API - Sistema de Inventario y Ventas', version: '2.0.0' }));

// 4. CARGA DE RUTAS (IMPORTANTE: Solo una vez)
// Si './routes/index' ya tiene el router.use('/auth', ...), usa solo esta línea:
app.use('/', routes); 

// 5. MANEJO DE ERRORES (SIEMPRE AL FINAL)
app.use((_, res) => {
  res.status(404).json({ error: 'Ruta no encontrada en el servidor.' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});