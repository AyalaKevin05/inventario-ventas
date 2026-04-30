import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout    from './components/Layout';
import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import NuevaVenta from './pages/NuevaVenta';
import Ventas    from './pages/Ventas';
import Facturas  from './pages/Facturas';
import Catalogos from './pages/Catalogos';

const Privada = ({ children }) => {
  const { usuario, cargando } = useAuth();
  if (cargando) return <div style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem' }}>Cargando...</div>;
  return usuario ? children : <Navigate to="/login" replace />;
};

const SoloAdmin = ({ children }) => {
  const { usuario, esAdmin } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (!esAdmin()) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Privada><Layout /></Privada>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"   element={<Dashboard />} />
            <Route path="productos"   element={<Productos />} />
            <Route path="nueva-venta" element={<NuevaVenta />} />
            <Route path="ventas"      element={<Ventas />} />
            <Route path="facturas"    element={<Facturas />} />
            <Route path="catalogos"   element={<SoloAdmin><Catalogos /></SoloAdmin>} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
