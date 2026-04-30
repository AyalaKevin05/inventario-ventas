# 🏪 Sistema de Inventario y Ventas v2.0
**Proyecto Académico – Bases de Datos I**

## 📁 Arquitectura del Backend

```
backend/src/
├── config/
│   └── db.js                  # Conexión PostgreSQL (Pool)
├── utils/
│   └── jwt.js                 # generarToken · verificarToken · decodificarToken
├── services/
│   └── authService.js         # Lógica: autenticar · registrar · cambiarContraseña · perfil
├── controllers/
│   ├── authController.js      # login · register · perfil · cambiarContraseña
│   ├── productosController.js # CRUD productos + stockBajo
│   ├── ventasController.js    # CRUD ventas + transacción + reportes
│   ├── facturasController.js  # CRUD facturas + resumen + estados
│   └── catalogosController.js # Categorías · Proveedores · Clientes · Usuarios
├── middleware/
│   └── auth.js                # autenticado · soloAdmin · requiereRol([])
└── routes/
    ├── index.js               # Registro central de rutas
    ├── authRoutes.js          # /api/auth/*
    ├── productosRoutes.js     # /api/productos/*
    ├── ventasRoutes.js        # /api/ventas/*
    ├── facturasRoutes.js      # /api/facturas/*
    └── catalogosRoutes.js     # /api/categorias · proveedores · clientes · usuarios
```

## 🔐 Sistema de Autenticación
- **JWT Utils** (`utils/jwt.js`): generación, verificación y decodificación de tokens
- **Auth Service** (`services/authService.js`): lógica de negocio desacoplada
- **Auth Controller** (`controllers/authController.js`): endpoints HTTP
- **Middleware** (`middleware/auth.js`): `autenticado`, `soloAdmin`, `requiereRol([])`
- **Rutas protegidas**: cada ruta aplica los middlewares según rol requerido

## 🧾 Sistema de Facturación
- Factura generada automáticamente al crear cada venta
- Número único por factura (`FAC-{timestamp}`)
- Estados: `emitida` → `pagada` / `anulada`
- Incluye subtotal, IVA configurable (0%, 5%, 19%) y total
- Impresión directa desde el navegador
- Notas internas editables
- Resumen estadístico en dashboard

## ⚙️ Instalación

```bash
# 1. Base de datos
psql -U postgres -c "CREATE DATABASE inventario_ventas;"
psql -U postgres -d inventario_ventas -f database/schema.sql

# 2. Generar contraseñas reales
cd backend && npm install
node -e "const b=require('bcryptjs'); console.log('admin123:', b.hashSync('admin123',10)); console.log('vendedor123:', b.hashSync('vendedor123',10));"
# Actualizar usuarios en pgAdmin con: UPDATE usuarios SET contrasena='HASH' WHERE correo='...';

# 3. Backend
cp .env.example .env   # Editar DB_PASSWORD
npm run dev            # http://localhost:3001

# 4. Frontend (nueva terminal)
cd ../frontend && npm install && npm start  # http://localhost:3000
```

## 🌐 Endpoints principales

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /api/auth/login | ❌ | Iniciar sesión |
| GET | /api/auth/perfil | ✅ | Perfil del usuario |
| PUT | /api/auth/cambiar-contrasena | ✅ | Cambiar contraseña |
| GET | /api/productos | ✅ | Listar productos |
| POST | /api/ventas | ✅ | Crear venta + factura |
| GET | /api/facturas | ✅ | Listar facturas |
| PATCH | /api/facturas/:id/estado | Admin | Cambiar estado |
| GET | /api/facturas/resumen | ✅ | Estadísticas facturación |

## 👤 Credenciales de prueba
Después de ejecutar `seed.sql`, regenerar hashes con bcrypt y actualizar en BD.
- **Admin**: admin@tienda.com / admin123
- **Vendedor**: juan@tienda.com / vendedor123
