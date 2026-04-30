import { useEffect, useState } from 'react';
import { getProductos, crearProducto, actualizarProducto, eliminarProducto, getCategorias, getProveedores } from '../services/api';
import { useAuth } from '../context/AuthContext';

const V = { nombre:'', descripcion:'', precio:'', stock:'', id_categoria:'', id_proveedor:'' };

export default function Productos() {
  const { esAdmin } = useAuth();
  const [productos, setProductos] = useState([]);
  const [cats, setCats] = useState([]);
  const [provs, setProvs] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(V);
  const [busqueda, setBusqueda] = useState('');
  const [msg, setMsg] = useState(null);

  const cargar = async () => {
    const [p,c,pr] = await Promise.all([getProductos(), getCategorias(), getProveedores()]);
    setProductos(p.data); setCats(c.data); setProvs(pr.data);
  };
  useEffect(() => { cargar(); }, []);

  const flash = (tipo, texto) => { setMsg({tipo,texto}); setTimeout(()=>setMsg(null),3000); };

  const abrirModal = (p=null) => {
    setEditando(p);
    setForm(p ? {nombre:p.nombre,descripcion:p.descripcion||'',precio:p.precio,stock:p.stock,id_categoria:p.id_categoria,id_proveedor:p.id_proveedor} : V);
    setModal(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    try {
      editando ? await actualizarProducto(editando.id_producto, form) : await crearProducto(form);
      setModal(false); cargar(); flash('ok', editando ? 'Actualizado.' : 'Creado.');
    } catch(err) { flash('err', err.response?.data?.error || 'Error.'); }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar?')) return;
    try { await eliminarProducto(id); cargar(); flash('ok','Eliminado.'); }
    catch(err) { flash('err', err.response?.data?.error || 'No se pudo eliminar.'); }
  };

  const filtrados = productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.categoria?.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.titulo}>📦 Productos</h2>
        {esAdmin() && <button style={s.btnP} onClick={()=>abrirModal()}>+ Nuevo</button>}
      </div>
      {msg && <div style={msg.tipo==='ok'?s.ok:s.err}>{msg.texto}</div>}
      <input style={s.search} placeholder="🔍 Buscar..." value={busqueda} onChange={e=>setBusqueda(e.target.value)}/>
      <div style={{overflowX:'auto'}}>
        <table style={s.table}>
          <thead><tr>{['Nombre','Categoría','Proveedor','Precio','Stock',esAdmin()?'Acc':''].map(h=>h&&<th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {filtrados.map(p=>(
              <tr key={p.id_producto} style={{borderBottom:'1px solid #1e293b'}}>
                <td style={s.td}><strong style={{color:'#f1f5f9'}}>{p.nombre}</strong><br/><small style={{color:'#64748b'}}>{p.descripcion}</small></td>
                <td style={s.td}><span style={s.badge}>{p.categoria}</span></td>
                <td style={s.td}>{p.proveedor}</td>
                <td style={s.td}><strong style={{color:'#10b981'}}>${parseFloat(p.precio).toFixed(2)}</strong></td>
                <td style={s.td}><span style={{...s.badge,background:p.stock<20?'#450a0a':'#052e16',color:p.stock<20?'#fca5a5':'#86efac'}}>{p.stock}</span></td>
                {esAdmin()&&<td style={s.td}><button style={s.btnI} onClick={()=>abrirModal(p)}>✏️</button><button style={s.btnI} onClick={()=>eliminar(p.id_producto)}>🗑️</button></td>}
              </tr>
            ))}
            {!filtrados.length && <tr><td colSpan="6" style={{...s.td,textAlign:'center',color:'#64748b'}}>Sin resultados.</td></tr>}
          </tbody>
        </table>
      </div>
      {modal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={{color:'#f1f5f9',marginBottom:'1.25rem'}}>{editando?'Editar':'Nuevo'} Producto</h3>
            <form onSubmit={guardar}>
              {[['nombre','Nombre','text'],['descripcion','Descripción','text'],['precio','Precio','number'],['stock','Stock','number']].map(([k,l,t])=>(
                <div key={k} style={{marginBottom:'0.875rem'}}>
                  <label style={s.label}>{l}</label>
                  <input style={s.input} type={t} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} required={k!=='descripcion'} min={t==='number'?0:undefined} step={k==='precio'?'0.01':undefined}/>
                </div>
              ))}
              {[['id_categoria','Categoría',cats,'id_categoria'],['id_proveedor','Proveedor',provs,'id_proveedor']].map(([k,l,opts,vid])=>(
                <div key={k} style={{marginBottom:'0.875rem'}}>
                  <label style={s.label}>{l}</label>
                  <select style={s.input} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} required>
                    <option value="">Seleccionar...</option>
                    {opts.map(o=><option key={o[vid]} value={o[vid]}>{o.nombre}</option>)}
                  </select>
                </div>
              ))}
              <div style={{display:'flex',gap:'0.75rem',marginTop:'1rem'}}>
                <button type="submit" style={s.btnP}>Guardar</button>
                <button type="button" style={s.btnC} onClick={()=>setModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
const s = {
  page:{padding:'1.5rem'}, header:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'},
  titulo:{color:'#f1f5f9'}, btnP:{background:'#3b82f6',color:'#fff',border:'none',padding:'0.6rem 1.2rem',borderRadius:'0.5rem',cursor:'pointer',fontWeight:'600'},
  ok:{background:'#052e16',color:'#86efac',padding:'0.75rem',borderRadius:'0.5rem',marginBottom:'1rem'},
  err:{background:'#450a0a',color:'#fca5a5',padding:'0.75rem',borderRadius:'0.5rem',marginBottom:'1rem'},
  search:{width:'100%',padding:'0.75rem',background:'#1e293b',border:'1px solid #334155',borderRadius:'0.5rem',color:'#f1f5f9',marginBottom:'1rem',boxSizing:'border-box'},
  table:{width:'100%',borderCollapse:'collapse'}, th:{background:'#1e293b',color:'#64748b',padding:'0.75rem 1rem',textAlign:'left',fontSize:'0.8rem',textTransform:'uppercase'},
  td:{padding:'0.875rem 1rem',color:'#94a3b8',verticalAlign:'middle'},
  badge:{background:'#1e3a5f',color:'#93c5fd',padding:'0.25rem 0.6rem',borderRadius:'9999px',fontSize:'0.75rem',fontWeight:'600'},
  btnI:{background:'transparent',border:'none',cursor:'pointer',fontSize:'1.1rem',marginRight:'0.5rem'},
  overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50},
  modal:{background:'#1e293b',borderRadius:'1rem',padding:'2rem',width:'100%',maxWidth:'480px',maxHeight:'90vh',overflowY:'auto'},
  label:{display:'block',color:'#94a3b8',marginBottom:'0.3rem',fontSize:'0.875rem'},
  input:{width:'100%',padding:'0.65rem',background:'#0f172a',border:'1px solid #334155',borderRadius:'0.4rem',color:'#f1f5f9',boxSizing:'border-box'},
  btnC:{background:'#334155',color:'#94a3b8',border:'none',padding:'0.6rem 1.2rem',borderRadius:'0.5rem',cursor:'pointer'},
};
