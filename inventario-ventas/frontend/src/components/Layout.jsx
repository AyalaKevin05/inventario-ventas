import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/dashboard',    label: '🏠 Dashboard' },
  { to: '/productos',    label: '📦 Productos' },
  { to: '/nueva-venta',  label: '🧾 Nueva Venta' },
  { to: '/ventas',       label: '📊 Historial Ventas' },
  { to: '/facturas',     label: '🧾 Facturación' },
  { to: '/catalogos',    label: '⚙️ Catálogos', soloAdmin: true },
];

export default function Layout() {
  const { usuario, logout, esAdmin } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={s.app}>
      <aside style={s.sidebar}>
        <div style={s.brand}>
          <div style={s.brandIcon}>🏪</div>
          <div>
            <div style={s.brandName}>Inventario</div>
            <div style={s.brandSub}>& Ventas v2</div>
          </div>
        </div>
        <nav style={s.nav}>
          {nav.filter(n => !n.soloAdmin || esAdmin()).map(n => (
            <NavLink key={n.to} to={n.to} style={({ isActive }) => ({ ...s.link, ...(isActive ? s.linkActivo : {}) })}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div style={s.userBox}>
          <div style={s.userInfo}>
            <div style={s.avatar}>{usuario?.nombre?.[0]?.toUpperCase()}</div>
            <div>
              <div style={s.userName}>{usuario?.nombre}</div>
              <div style={s.userRol}>{usuario?.rol}</div>
            </div>
          </div>
          <button style={s.btnLogout} onClick={handleLogout}>Salir →</button>
        </div>
      </aside>
      <main style={s.main}><Outlet /></main>
    </div>
  );
}

const s = {
  app: { display: 'flex', minHeight: '100vh', background: '#0f172a', fontFamily: "'Segoe UI', system-ui, sans-serif" },
  sidebar: { width: '220px', background: '#0a1628', display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem', position: 'fixed', height: '100vh', top: 0, left: 0 },
  brand: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingBottom: '1.25rem', borderBottom: '1px solid #1e293b' },
  brandIcon: { fontSize: '1.75rem' },
  brandName: { color: '#f1f5f9', fontWeight: '700', fontSize: '1rem' },
  brandSub: { color: '#3b82f6', fontSize: '0.75rem', fontWeight: '600' },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  link: { display: 'block', padding: '0.65rem 0.875rem', borderRadius: '0.5rem', color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500' },
  linkActivo: { background: '#1e3a5f', color: '#93c5fd' },
  userBox: { borderTop: '1px solid #1e293b', paddingTop: '1rem' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.875rem' },
  userName: { color: '#f1f5f9', fontSize: '0.8rem', fontWeight: '600' },
  userRol: { color: '#64748b', fontSize: '0.7rem' },
  btnLogout: { width: '100%', padding: '0.5rem', background: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' },
  main: { marginLeft: '220px', flex: 1, minHeight: '100vh' },
};
