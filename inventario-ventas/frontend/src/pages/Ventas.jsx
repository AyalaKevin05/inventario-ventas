import { useEffect, useState } from 'react';
import { getVentas, getVenta } from '../services/api';

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const cargar = async () => {
    const params = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    const { data } = await getVentas(params);
    setVentas(data);
  };
  useEffect(() => { cargar(); }, []);

  const verDetalle = async (id) => {
    if (detalle?.id_venta === id) { setDetalle(null); return; }
    const { data } = await getVenta(id);
    setDetalle(data);
  };

  const total = ventas.reduce((a,v)=>a+parseFloat(v.total),0);

  return (
    <div style={s.page}>
      <h2 style={s.titulo}>📊 Historial de Ventas</h2>
      <div style={s.filtros}>
        {[['Desde',desde,setDesde],['Hasta',hasta,setHasta]].map(([l,v,fn])=>(
          <div key={l}><label style={s.label}>{l}</label><input type="date" style={s.input} value={v} onChange={e=>fn(e.target.value)}/></div>
        ))}
        <button style={s.btnF} onClick={cargar}>Filtrar</button>
        <button style={s.btnL} onClick={()=>{setDesde('');setHasta('');setTimeout(cargar,0);}}>Limpiar</button>
      </div>
      <div style={s.resumen}>
        {[['Ventas',ventas.length,'🧾'],['Total',`$${total.toFixed(2)}`,'💰'],['Promedio',ventas.length?`$${(total/ventas.length).toFixed(2)}`:'$0.00','📈']].map(([l,v,i])=>(
          <div key={l} style={s.resCard}><span style={{fontSize:'1.5rem'}}>{i}</span><div><div style={{color:'#f1f5f9',fontWeight:'700',fontSize:'1.2rem'}}>{v}</div><div style={{color:'#64748b',fontSize:'0.75rem'}}>{l}</div></div></div>
        ))}
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={s.table}>
          <thead><tr>{['#','Fecha','Vendedor','Cliente','Items','Total','Detalle'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {ventas.map(v=>(
              <>
                <tr key={v.id_venta} style={{borderBottom:'1px solid #1e293b'}}>
                  <td style={s.td}>#{v.id_venta}</td>
                  <td style={s.td}>{new Date(v.fecha).toLocaleString('es-CO')}</td>
                  <td style={s.td}>{v.vendedor}</td>
                  <td style={s.td}>{v.cliente||'General'}</td>
                  <td style={s.td}>{v.items}</td>
                  <td style={s.td}><strong style={{color:'#10b981'}}>${parseFloat(v.total).toFixed(2)}</strong></td>
                  <td style={s.td}><button style={s.btnD} onClick={()=>verDetalle(v.id_venta)}>{detalle?.id_venta===v.id_venta?'▲':'▼'}</button></td>
                </tr>
                {detalle?.id_venta===v.id_venta&&(
                  <tr key={`d${v.id_venta}`}><td colSpan="7" style={{padding:'0 1rem 1rem'}}>
                    <div style={{background:'#0f172a',borderRadius:'0.5rem',padding:'1rem'}}>
                      <table style={{width:'100%',borderCollapse:'collapse'}}>
                        <thead><tr>{['Producto','P.Unit.','Cant.','Subtotal'].map(h=><th key={h} style={{...s.th,background:'#0a1628'}}>{h}</th>)}</tr></thead>
                        <tbody>
                          {detalle.detalle?.map(d=>(
                            <tr key={d.id_detalle}>
                              <td style={s.td}>{d.producto}</td>
                              <td style={s.td}>${parseFloat(d.precio_unitario).toFixed(2)}</td>
                              <td style={s.td}>{d.cantidad}</td>
                              <td style={s.td}><strong style={{color:'#10b981'}}>${parseFloat(d.subtotal).toFixed(2)}</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {detalle.factura&&<p style={{color:'#93c5fd',marginTop:'0.5rem',fontSize:'0.85rem'}}>📄 Factura: <strong>{detalle.factura.numero_factura}</strong> — Estado: {detalle.factura.estado}</p>}
                    </div>
                  </td></tr>
                )}
              </>
            ))}
            {!ventas.length&&<tr><td colSpan="7" style={{...s.td,textAlign:'center',color:'#64748b'}}>Sin ventas.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
const s = {
  page:{padding:'1.5rem'}, titulo:{color:'#f1f5f9',marginBottom:'1rem'},
  filtros:{display:'flex',gap:'1rem',alignItems:'flex-end',marginBottom:'1.5rem',flexWrap:'wrap'},
  label:{display:'block',color:'#94a3b8',marginBottom:'0.3rem',fontSize:'0.8rem'},
  input:{padding:'0.6rem',background:'#1e293b',border:'1px solid #334155',borderRadius:'0.4rem',color:'#f1f5f9'},
  btnF:{padding:'0.6rem 1.2rem',background:'#3b82f6',color:'#fff',border:'none',borderRadius:'0.4rem',cursor:'pointer'},
  btnL:{padding:'0.6rem 1.2rem',background:'#334155',color:'#94a3b8',border:'none',borderRadius:'0.4rem',cursor:'pointer'},
  resumen:{display:'flex',gap:'1rem',marginBottom:'1.5rem',flexWrap:'wrap'},
  resCard:{background:'#1e293b',borderRadius:'0.75rem',padding:'1rem 1.5rem',display:'flex',alignItems:'center',gap:'0.75rem',flex:1,minWidth:'120px'},
  table:{width:'100%',borderCollapse:'collapse'},
  th:{background:'#1e293b',color:'#64748b',padding:'0.75rem 1rem',textAlign:'left',fontSize:'0.8rem',textTransform:'uppercase'},
  td:{padding:'0.875rem 1rem',color:'#94a3b8',verticalAlign:'middle'},
  btnD:{background:'#1e3a5f',color:'#93c5fd',border:'none',padding:'0.3rem 0.75rem',borderRadius:'0.4rem',cursor:'pointer',fontSize:'0.8rem'},
};
