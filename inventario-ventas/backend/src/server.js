require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes/index');
const app = express();

const allowedOrigins = [
  'https://inventario-ventas.vercel.app',
  'https://inventario-ventas-giunjxjxj-davidtordecilla2005-2459s-projects.vercel.app/login',
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

app.use(express.json());

app.get('/', (_, res) => res.json({ mensaje: 'API - Sistema de Inventario y Ventas', version: '2.0.0' }));

app.use('/', routes);

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