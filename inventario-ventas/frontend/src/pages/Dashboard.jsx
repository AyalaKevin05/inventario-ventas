import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProductos, getVentas, getStockBajo, getMasVendidos, getResumenFact } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState({ productos:0, ventas:0, stockBajo:0, ingresos:0, facturasPendientes:0 });
  const [masVendidos, setMasVendidos] = useState([]);

  useEffect(() => {
    Promise.all([getProductos(), getVentas(), getStockBajo(), getMasVendidos(), getResumenFact()])
      .then(([p,v,b,mv,fr]) => {
        setStats({ productos:p.data.length, ventas:v.data.length, stockBajo:b.data.length,
          ingresos:v.data.reduce((a,x)=>a+parseFloat(x.total),0), facturasPendientes:fr.data.emitidas||0 });
        setMasVendidos(mv.data.slice(0,6));
      }).catch(console.error);
  }, []);

  const tarjetas = [
    { titulo:'Productos', valor:stats.productos, icono:'📦', color:'#3b82f6' },
    { titulo:'Ventas', valor:stats.ventas, icono:'🧾', color:'#10b981' },
    { titulo:'Stock Bajo', valor:stats.stockBajo, icono:'⚠️', color:'#f59e0b' },
    { titulo:'Ingresos', valor:`$${stats.ingresos.toFixed(2)}`, icono:'💰', color:'#8b5cf6' },
    { titulo:'Fact. Pendientes', valor:stats.facturasPendientes, icono:'📄', color:'#ef4444' },
  ];

  return (
    <div style={s.page}>
      <h2 style={s.titulo}>Bienvenido, {usuario?.nombre} 👋</h2>
      <p style={s.sub}>Panel de control – Sistema de Inventario y Ventas</p>
      <div style={s.grid}>
        {tarjetas.map(t => (
          <div key={t.titulo} style={{...s.tarjeta, borderTop:`4px solid ${t.color}`}}>
            <span style={s.icono}>{t.icono}</span>
            <div><div style={s.valor}>{t.valor}</div><div style={s.label}>{t.titulo}</div></div>
          </div>
        ))}
      </div>
      <div style={s.chartBox}>
        <h3 style={s.chartTitulo}>📊 Productos más vendidos</h3>
        {masVendidos.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={masVendidos} margin={{top:10,right:20,left:0,bottom:60}}>
              <XAxis dataKey="producto" tick={{fill:'#94a3b8',fontSize:11}} angle={-30} textAnchor="end"/>
              <YAxis tick={{fill:'#94a3b8',fontSize:12}}/>
              <Tooltip contentStyle={{background:'#1e293b',border:'none',color:'#f1f5f9'}}/>
              <Bar dataKey="total_vendido" fill="#3b82f6" radius={[4,4,0,0]} name="Vendidos"/>
            </BarChart>
          </ResponsiveContainer>
        ) : <p style={{color:'#64748b',textAlign:'center',padding:'2rem'}}>Sin datos de ventas aún.</p>}
      </div>
    </div>
  );
}
const s = {
  page:{padding:'1.5rem'}, titulo:{color:'#f1f5f9',marginBottom:'0.25rem'}, sub:{color:'#64748b',marginBottom:'1.5rem',fontSize:'0.9rem'},
  grid:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:'1rem',marginBottom:'2rem'},
  tarjeta:{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',display:'flex',alignItems:'center',gap:'1rem'},
  icono:{fontSize:'2rem'}, valor:{color:'#f1f5f9',fontSize:'1.6rem',fontWeight:'700'}, label:{color:'#64748b',fontSize:'0.875rem'},
  chartBox:{background:'#1e293b',borderRadius:'0.75rem',padding:'1.5rem'}, chartTitulo:{color:'#f1f5f9',marginBottom:'1rem',fontSize:'1rem'},
};
