import { useEffect, useState } from 'react';
import { getProductos, crearVenta, getClientes } from '../services/api';

export default function NuevaVenta() {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [idCliente, setIdCliente] = useState('');
  const [tasaImpuesto, setTasaImpuesto] = useState(0.19);
  const [msg, setMsg] = useState(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    getProductos().then(r=>setProductos(r.data));
    getClientes().then(r=>setClientes(r.data));
  }, []);

  const agregar = (p) => {
    const ex = carrito.find(i=>i.id_producto===p.id_producto);
    if (ex) {
      if (ex.cantidad >= p.stock) { setMsg({tipo:'err',texto:`Stock máx: ${p.stock}`}); setTimeout(()=>setMsg(null),2000); return; }
      setCarrito(carrito.map(i=>i.id_producto===p.id_producto?{...i,cantidad:i.cantidad+1}:i));
    } else {
      if (!p.stock) { setMsg({tipo:'err',texto:'Sin stock.'}); setTimeout(()=>setMsg(null),2000); return; }
      setCarrito([...carrito,{id_producto:p.id_producto,nombre:p.nombre,precio:parseFloat(p.precio),cantidad:1,stock:p.stock}]);
    }
  };

  const cambiarCant = (id,v) => {
    const p=carrito.find(i=>i.id_producto===id);
    setCarrito(carrito.map(i=>i.id_producto===id?{...i,cantidad:Math.max(1,Math.min(parseInt(v)||1,p.stock))}:i));
  };

  const subtotal = carrito.reduce((a,i)=>a+i.precio*i.cantidad,0);
  const impuesto = subtotal * tasaImpuesto;
  const total = subtotal + impuesto;

  const procesar = async () => {
    if (!carrito.length) return;
    setProcesando(true);
    try {
      const { data } = await crearVenta({ items: carrito.map(i=>({id_producto:i.id_producto,cantidad:i.cantidad})), id_cliente: idCliente||null, tasa_impuesto: tasaImpuesto });
      setMsg({tipo:'ok',texto:`✅ Venta #${data.id_venta} | Factura: ${data.factura?.numero_factura} | Total: $${parseFloat(data.total).toFixed(2)}`});
      setCarrito([]);
      getProductos().then(r=>setProductos(r.data));
    } catch(err) { setMsg({tipo:'err',texto:err.response?.data?.error||'Error.'}); }
    finally { setProcesando(false); setTimeout(()=>setMsg(null),6000); }
  };

  const filtrados = productos.filter(p=>p.nombre.toLowerCase().includes(busqueda.toLowerCase())&&p.stock>0);

  return (
    <div style={s.page}>
      <h2 style={s.titulo}>🧾 Nueva Venta</h2>
      {msg && <div style={msg.tipo==='ok'?s.ok:s.err}>{msg.texto}</div>}
      <div style={s.layout}>
        <div>
          <input style={s.search} placeholder="🔍 Buscar producto..." value={busqueda} onChange={e=>setBusqueda(e.target.value)}/>
          <div style={s.grid}>
            {filtrados.map(p=>(
              <div key={p.id_producto} style={s.card} onClick={()=>agregar(p)}>
                <div style={s.cardNombre}>{p.nombre}</div>
                <div style={s.cardCat}>{p.categoria}</div>
                <div style={s.cardPrecio}>${parseFloat(p.precio).toFixed(2)}</div>
                <div style={s.cardStock}>Stock: {p.stock}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={s.carritoBox}>
          <h3 style={s.sub}>🛒 Carrito ({carrito.length})</h3>
          <div style={{marginBottom:'0.75rem'}}>
            <label style={s.label}>Cliente</label>
            <select style={s.input} value={idCliente} onChange={e=>setIdCliente(e.target.value)}>
              <option value="">Cliente General</option>
              {clientes.map(c=><option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>)}
            </select>
          </div>
          <div style={{marginBottom:'0.75rem'}}>
            <label style={s.label}>IVA (%)</label>
            <select style={s.input} value={tasaImpuesto} onChange={e=>setTasaImpuesto(parseFloat(e.target.value))}>
              <option value={0}>0% (Sin IVA)</option>
              <option value={0.05}>5%</option>
              <option value={0.19}>19%</option>
            </select>
          </div>
          {!carrito.length ? <p style={{color:'#475569',fontStyle:'italic',padding:'0.5rem 0'}}>Selecciona productos.</p> : (
            <>
              {carrito.map(i=>(
                <div key={i.id_producto} style={s.item}>
                  <div style={{flex:1}}><div style={{color:'#f1f5f9',fontSize:'0.875rem'}}>{i.nombre}</div><div style={{color:'#64748b',fontSize:'0.75rem'}}>${i.precio.toFixed(2)} c/u</div></div>
                  <input type="number" style={s.cantInput} value={i.cantidad} min={1} max={i.stock} onChange={e=>cambiarCant(i.id_producto,e.target.value)}/>
                  <span style={{color:'#10b981',fontWeight:'600',minWidth:'60px',textAlign:'right'}}>${(i.precio*i.cantidad).toFixed(2)}</span>
                  <button style={{background:'transparent',border:'none',color:'#ef4444',cursor:'pointer'}} onClick={()=>setCarrito(carrito.filter(x=>x.id_producto!==i.id_producto))}>✕</button>
                </div>
              ))}
              <div style={s.totales}>
                <div style={s.totRow}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div style={s.totRow}><span>IVA ({(tasaImpuesto*100).toFixed(0)}%)</span><span>${impuesto.toFixed(2)}</span></div>
                <div style={{...s.totRow,color:'#f1f5f9',fontSize:'1.1rem',fontWeight:'700',borderTop:'1px solid #334155',paddingTop:'0.5rem'}}><span>TOTAL</span><span>${total.toFixed(2)}</span></div>
              </div>
              <button style={s.btnVender} onClick={procesar} disabled={procesando}>{procesando?'Procesando...':'✅ Confirmar Venta'}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
const s = {
  page:{padding:'1.5rem'}, titulo:{color:'#f1f5f9',marginBottom:'1rem'},
  ok:{background:'#052e16',color:'#86efac',padding:'0.75rem',borderRadius:'0.5rem',marginBottom:'1rem'},
  err:{background:'#450a0a',color:'#fca5a5',padding:'0.75rem',borderRadius:'0.5rem',marginBottom:'1rem'},
  layout:{display:'grid',gridTemplateColumns:'1fr 340px',gap:'1.5rem'},
  search:{width:'100%',padding:'0.65rem',background:'#1e293b',border:'1px solid #334155',borderRadius:'0.5rem',color:'#f1f5f9',marginBottom:'1rem',boxSizing:'border-box'},
  grid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))',gap:'0.75rem'},
  card:{background:'#1e293b',borderRadius:'0.75rem',padding:'1rem',cursor:'pointer'},
  cardNombre:{color:'#f1f5f9',fontWeight:'600',fontSize:'0.875rem',marginBottom:'0.25rem'},
  cardCat:{color:'#64748b',fontSize:'0.75rem',marginBottom:'0.5rem'},
  cardPrecio:{color:'#10b981',fontWeight:'700',fontSize:'1.1rem'},
  cardStock:{color:'#475569',fontSize:'0.75rem'},
  carritoBox:{background:'#1e293b',borderRadius:'0.75rem',padding:'1.25rem',position:'sticky',top:'1rem',height:'fit-content'},
  sub:{color:'#cbd5e1',marginBottom:'0.75rem',fontSize:'0.95rem'},
  label:{display:'block',color:'#94a3b8',marginBottom:'0.3rem',fontSize:'0.8rem'},
  input:{width:'100%',padding:'0.5rem',background:'#0f172a',border:'1px solid #334155',borderRadius:'0.4rem',color:'#f1f5f9',marginBottom:'0.5rem',boxSizing:'border-box'},
  item:{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.6rem 0',borderBottom:'1px solid #334155'},
  cantInput:{width:'55px',padding:'0.3rem',background:'#0f172a',border:'1px solid #334155',borderRadius:'0.4rem',color:'#f1f5f9',textAlign:'center'},
  totales:{margin:'0.75rem 0'},
  totRow:{display:'flex',justifyContent:'space-between',color:'#94a3b8',fontSize:'0.9rem',padding:'0.2rem 0'},
  btnVender:{width:'100%',padding:'0.875rem',background:'#10b981',color:'#fff',border:'none',borderRadius:'0.5rem',fontSize:'1rem',fontWeight:'700',cursor:'pointer',marginTop:'0.5rem'},
};
