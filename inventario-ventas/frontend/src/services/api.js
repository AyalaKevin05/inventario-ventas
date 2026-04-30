import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) { localStorage.clear(); window.location.href = '/login'; }
    return Promise.reject(err);
  }
);

// Auth
export const login             = (d) => API.post('/auth/login', d);
export const registrarUsuario  = (d) => API.post('/auth/register', d);
export const getPerfil         = ()  => API.get('/auth/perfil');
export const cambiarContrasena = (d) => API.put('/auth/cambiar-contrasena', d);

// Productos
export const getProductos       = ()       => API.get('/productos');
export const getProducto        = (id)     => API.get(`/productos/${id}`);
export const crearProducto      = (d)      => API.post('/productos', d);
export const actualizarProducto = (id, d)  => API.put(`/productos/${id}`, d);
export const eliminarProducto   = (id)     => API.delete(`/productos/${id}`);
export const getStockBajo       = (l = 20) => API.get(`/productos/stock-bajo?limite=${l}`);

// Ventas
export const getVentas      = (p = {}) => API.get('/ventas', { params: p });
export const getVenta       = (id)     => API.get(`/ventas/${id}`);
export const crearVenta     = (d)      => API.post('/ventas', d);
export const getMasVendidos = ()       => API.get('/ventas/reportes/mas-vendidos');
export const getVentasPorMes= ()       => API.get('/ventas/reportes/por-mes');

// Facturas
export const getFacturas        = (p = {}) => API.get('/facturas', { params: p });
export const getFactura         = (id)     => API.get(`/facturas/${id}`);
export const cambiarEstadoFact  = (id, d)  => API.patch(`/facturas/${id}/estado`, d);
export const agregarNotaFact    = (id, d)  => API.patch(`/facturas/${id}/notas`, d);
export const getResumenFact     = ()       => API.get('/facturas/resumen');

// Catálogos
export const getCategorias       = ()       => API.get('/categorias');
export const crearCategoria      = (d)      => API.post('/categorias', d);
export const actualizarCategoria = (id, d)  => API.put(`/categorias/${id}`, d);
export const eliminarCategoria   = (id)     => API.delete(`/categorias/${id}`);

export const getProveedores      = ()       => API.get('/proveedores');
export const crearProveedor      = (d)      => API.post('/proveedores', d);
export const actualizarProveedor = (id, d)  => API.put(`/proveedores/${id}`, d);
export const eliminarProveedor   = (id)     => API.delete(`/proveedores/${id}`);

export const getClientes         = ()       => API.get('/clientes');
export const crearCliente        = (d)      => API.post('/clientes', d);
export const actualizarCliente   = (id, d)  => API.put(`/clientes/${id}`, d);
export const eliminarCliente     = (id)     => API.delete(`/clientes/${id}`);

export const getUsuarios = () => API.get('/usuarios');
export const getRoles    = () => API.get('/roles');
