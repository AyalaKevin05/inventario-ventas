import { useEffect, useState } from 'react';
import { getCategorias, crearCategoria, actualizarCategoria, eliminarCategoria,
  getProveedores, crearProveedor, actualizarProveedor, eliminarProveedor,
  getClientes, crearCliente, actualizarCliente, eliminarCliente,
  getUsuarios, getRoles, registrarUsuario } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Catalogos() {
  const { esAdmin } = useAuth();
  const [tab, setTab] = useState(0);
  const [data, setData] = useState({ cats:[], provs:[], clientes:[], users:[], roles:[] });
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState(null);

  const cargar = async () => {
    const [c,p,cl,u,r] = await Promise.all([getCategorias(),getProveedores(),getClientes(),getUsuarios(),getRoles()]);
    setData({ cats:c.data, provs:p.data, clientes:cl.data, users:u.data, roles:r.data });
  };
  useEffect(() => { cargar(); }, []);

  const flash = (tipo,texto) => { setMsg({tipo,texto}); setTimeout(()=>setMsg(null),3000); };

  const guardar = async () => {
    try {
      if (modal==='cat') { form.id_categoria ? await actualizarCategoria(form.id_categoria,form) : await crearCategoria(form); }
      else if (modal==='prov') { form.id_proveedor ? await actualizarProveedor(form.id_proveedor,form) : await crearProveedor(form); }
      else if (modal==='cli') { form.id_cliente ? await actualizarCliente(form.id_cliente,form) : await crearCliente(form); }
      else if (modal==='user') { await registrarUsuario(form); }
      setModal(null); cargar(); flash('ok','Guardado.');
    } catch(err) { flash('err', err.response?.data?.error||'Error.'); }
  };

  const eliminar = async (tipo, id) => {
    if (!window.confirm('¿Eliminar?')) return;
    try {
      if (tipo==='cat') await eliminarCategoria(id);
      else if (tipo==='prov') await eliminarProveedor(id);
      else if (tipo==='cli') await eliminarCliente(id);
      cargar(); flash('ok','Eliminado.');
    } catch(err) { flash('err', err.response?.data?.error||'Error.'); }
  };

  const tabs = ['Categorías','Proveedores','Clientes','Usuarios'];
  const campo = (k,l,t='text') => (
    <div key={k} style={{marginBottom:'0.75rem'}}>
      <label style={s.label}>{l}</label>
      <input style={s.input} type={t} value={form[k]||''} onChange={e=>setForm({...form,[k]:e.target.value})}/>
    </div>
  );

  return (
    <div style={s.page}>
      <h2 style={s.titulo}>⚙️ Catálogos</h2>
      {msg && <div style={msg.tipo==='ok'?s.ok:s.err}>{msg.texto}</div>}
      <div style={s.tabs}>
        {tabs.map((t,i)=><button key={t} style={{...s.tab,...(tab===i?s.tabA:{})}} onClick={()=>setTab(i)}>{t}</button>)}
      </div>

      {tab===0&&<Seccion titulo="Categorías" items={data.cats}
        cols={['Nombre','Descripción']} rows={c=>[c.nombre,c.descripcion||'-']}
        onNew={esAdmin()?()=>{setForm({});setModal('cat');}:null}
        onEdit={esAdmin()?c=>{setForm(c);setModal('cat');}:null}
        onDel={esAdmin()?c=>eliminar('cat',c.id_categoria):null}/>}

      {tab===1&&<Seccion titulo="Proveedores" items={data.provs}
        cols={['Nombre','Teléfono','Email']} rows={p=>[p.nombre,p.telefono||'-',p.email||'-']}
        onNew={esAdmin()?()=>{setForm({});setModal('prov');}:null}
        onEdit={esAdmin()?p=>{setForm(p);setModal('prov');}:null}
        onDel={esAdmin()?p=>eliminar('prov',p.id_proveedor):null}/>}

      {tab===2&&<Seccion titulo="Clientes" items={data.clientes}
        cols={['Nombre','Documento','Teléfono','Email']} rows={c=>[c.nombre,c.documento||'-',c.telefono||'-',c.email||'-']}
        onNew={()=>{setForm({});setModal('cli');}}
        onEdit={c=>{setForm(c);setModal('cli');}}
        onDel={esAdmin()?c=>eliminar('cli',c.id_cliente):null}/>}

      {tab===3&&<Seccion titulo="Usuarios" items={data.users}
        cols={['Nombre','Correo','Rol','Activo']} rows={u=>[u.nombre,u.correo,u.rol,u.activo?'✅':'❌']}
        onNew={esAdmin()?()=>{setForm({});setModal('user');}:null}
        onEdit={null} onDel={null}/>}

      {modal&&(
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={{color:'#f1f5f9',marginBottom:'1.25rem'}}>
              {modal==='cat'?'Categoría':modal==='prov'?'Proveedor':modal==='cli'?'Cliente':'Nuevo Usuario'}
            </h3>
            {modal==='cat'&&<>{campo('nombre','Nombre')}{campo('descripcion','Descripción')}</>}
            {modal==='prov'&&<>{campo('nombre','Nombre')}{campo('telefono','Teléfono')}{campo('email','Email','email')}</>}
            {modal==='cli'&&<>{campo('nombre','Nombre')}{campo('documento','Documento')}{campo('telefono','Teléfono')}{campo('email','Email','email')}{campo('direccion','Dirección')}</>}
            {modal==='user'&&(
              <>
                {campo('nombre','Nombre')}{campo('correo','Correo','email')}{campo('contrasena','Contraseña','password')}
                <div style={{marginBottom:'0.75rem'}}>
                  <label style={s.label}>Rol</label>
                  <select style={s.input} value={form.id_rol||''} onChange={e=>setForm({...form,id_rol:e.target.value})}>
                    <option value="">Seleccionar...</option>
                    {data.roles.map(r=><option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>)}
                  </select>
                </div>
              </>
            )}
            <div style={{display:'flex',gap:'0.75rem',marginTop:'1rem'}}>
              <button style={s.btnP} onClick={guardar}>Guardar</button>
              <button style={s.btnC} onClick={()=>setModal(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Seccion({ titulo, items, cols, rows, onNew, onEdit, onDel }) {
  return (
    <div>
      {onNew&&<button style={s.btnP} onClick={onNew}>+ Nuevo {titulo.slice(0,-1)}</button>}
      <div style={{overflowX:'auto',marginTop:'1rem'}}>
        <table style={s.table}>
          <thead><tr>{[...cols,onEdit||onDel?'Acc':''].filter(Boolean).map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {items.map((item,i)=>(
              <tr key={i} style={{borderBottom:'1px solid #1e293b'}}>
                {rows(item).map((cell,j)=><td key={j} style={s.td}>{cell}</td>)}
                {(onEdit||onDel)&&<td style={s.td}>
                  {onEdit&&<button style={s.btnI} onClick={()=>onEdit(item)}>✏️</button>}
                  {onDel&&<button style={s.btnI} onClick={()=>onDel(item)}>🗑️</button>}
                </td>}
              </tr>
            ))}
            {!items.length&&<tr><td colSpan={cols.length+1} style={{...s.td,textAlign:'center',color:'#64748b'}}>Sin registros.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const s = {
  page:{padding:'1.5rem'}, titulo:{color:'#f1f5f9',marginBottom:'1rem'},
  ok:{background:'#052e16',color:'#86efac',padding:'0.75rem',borderRadius:'0.5rem',marginBottom:'1rem'},
  err:{background:'#450a0a',color:'#fca5a5',padding:'0.75rem',borderRadius:'0.5rem',marginBottom:'1rem'},
  tabs:{display:'flex',gap:'0.5rem',marginBottom:'1.5rem',borderBottom:'1px solid #334155',paddingBottom:'0.5rem'},
  tab:{background:'transparent',border:'none',color:'#64748b',padding:'0.5rem 1rem',cursor:'pointer',borderRadius:'0.4rem',fontSize:'0.95rem'},
  tabA:{background:'#1e3a5f',color:'#93c5fd'},
  btnP:{background:'#3b82f6',color:'#fff',border:'none',padding:'0.6rem 1.2rem',borderRadius:'0.5rem',cursor:'pointer',fontWeight:'600'},
  table:{width:'100%',borderCollapse:'collapse'},
  th:{background:'#1e293b',color:'#64748b',padding:'0.75rem 1rem',textAlign:'left',fontSize:'0.8rem',textTransform:'uppercase'},
  td:{padding:'0.875rem 1rem',color:'#94a3b8'},
  btnI:{background:'transparent',border:'none',cursor:'pointer',fontSize:'1.1rem',marginRight:'0.4rem'},
  overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50},
  modal:{background:'#1e293b',borderRadius:'1rem',padding:'2rem',width:'100%',maxWidth:'450px',maxHeight:'90vh',overflowY:'auto'},
  label:{display:'block',color:'#94a3b8',marginBottom:'0.3rem',fontSize:'0.875rem'},
  input:{width:'100%',padding:'0.65rem',background:'#0f172a',border:'1px solid #334155',borderRadius:'0.4rem',color:'#f1f5f9',boxSizing:'border-box'},
  btnC:{background:'#334155',color:'#94a3b8',border:'none',padding:'0.6rem 1.2rem',borderRadius:'0.5rem',cursor:'pointer'},
};
