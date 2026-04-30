import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ correo: '', contrasena: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setCargando(true);
    try { await login(form.correo, form.contrasena); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.error || 'Error al iniciar sesión.'); }
    finally { setCargando(false); }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.logo}>🏪</div>
        <h1 style={s.titulo}>Sistema de Inventario</h1>
        <p style={s.sub}>Ingresa tus credenciales</p>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {[['correo','Correo','email'],['contrasena','Contraseña','password']].map(([k,l,t]) => (
            <div key={k} style={s.campo}>
              <label style={s.label}>{l}</label>
              <input type={t} style={s.input} value={form[k]} onChange={(e) => setForm({...form,[k]:e.target.value})} required />
            </div>
          ))}
          <button type="submit" style={s.btn} disabled={cargando}>{cargando ? 'Ingresando...' : 'Iniciar Sesión'}</button>
        </form>
      </div>
    </div>
  );
}
const s = {
  container: { minHeight:'100vh', background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center' },
  card: { background:'#1e293b', padding:'2.5rem', borderRadius:'1rem', width:'100%', maxWidth:'400px', boxShadow:'0 25px 50px rgba(0,0,0,0.5)' },
  logo: { fontSize:'3rem', textAlign:'center', marginBottom:'0.5rem' },
  titulo: { color:'#f1f5f9', textAlign:'center', marginBottom:'0.25rem', fontSize:'1.5rem' },
  sub: { color:'#64748b', textAlign:'center', marginBottom:'1.5rem', fontSize:'0.9rem' },
  error: { background:'#450a0a', color:'#fca5a5', padding:'0.75rem', borderRadius:'0.5rem', marginBottom:'1rem', fontSize:'0.875rem' },
  campo: { marginBottom:'1rem' },
  label: { display:'block', color:'#94a3b8', marginBottom:'0.4rem', fontSize:'0.875rem' },
  input: { width:'100%', padding:'0.75rem', background:'#0f172a', border:'1px solid #334155', borderRadius:'0.5rem', color:'#f1f5f9', fontSize:'1rem', boxSizing:'border-box' },
  btn: { width:'100%', padding:'0.875rem', background:'#3b82f6', color:'#fff', border:'none', borderRadius:'0.5rem', fontSize:'1rem', fontWeight:'600', cursor:'pointer', marginTop:'0.5rem' },
};
