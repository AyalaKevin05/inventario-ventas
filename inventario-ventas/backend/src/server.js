const express = require('express');
const cors = require('cors'); 
const routes = require('./routes/index');
const app = express();

// 2. CONFIGURACIÓN DE CORS (Aquí va el paso 3)
const allowedOrigins = [
  'https://inventario-ventas.vercel.app/', // URL que te dio Vercel
  'https://kinventory-2ddbb.web.app', // URL de Firebase (por si acaso)
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite peticiones sin origen (como Postman o herramientas de servidor)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// 3. MIDDLEWARES ADICIONALES
app.use(express.json());

app.get('/', (_, res) => res.json({ mensaje: 'API - Sistema de Inventario y Ventas', version: '2.0.0' }));
app.use('/', routes);

app.use((_, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));
app.use((err, _, res, __) => { console.error(err.stack); res.status(500).json({ error: 'Error interno del servidor.' }); });

// 4. TUS RUTAS (Deben ir debajo del CORS para que hereden los permisos)
app.use('/auth', require('./routes/auth')); 
// ... resto de rutas

app.listen(process.env.PORT || 3001, () => {
  console.log('Servidor corriendo');
});



/*require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const routes  = require('./routes');

const app  = express();
const PORT = process.env.PORT || 3001;*/

/*app.use(cors({ origin: 'https://kinventory-2ddbb.web.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
    process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:3000', credentials: true }));*/
/*const allowedOrigins = [
  'https://kinventory-2ddbb.web.app',
  'https://kinventory-2ddbb.firebaseapp.com', // URL alternativa de Firebase
  'http://localhost:3000'                      // Para que puedas seguir probando en tu PC
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
app.use('/api', routes);

app.use((_, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));
app.use((err, _, res, __) => { console.error(err.stack); res.status(500).json({ error: 'Error interno del servidor.' }); });

app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));*/
