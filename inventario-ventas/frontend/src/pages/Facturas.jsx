import { useEffect, useState } from 'react';
import { getFacturas, getFactura, cambiarEstadoFact, agregarNotaFact, getResumenFact } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ESTADOS = { emitida: { color: '#93c5fd', bg: '#1e3a5f' }, pagada: { color: '#86efac', bg: '#052e16' }, anulada: { color: '#fca5a5', bg: '#450a0a' } };

export default function Facturas() {
  const { esAdmin } = useAuth();
  const [facturas, setFacturas] = useState([]);
  const [resumen, setResumen] = useState({});
  const [detalle, setDetalle] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [nota, setNota] = useState('');
  const [msg, setMsg] = useState(null);

  const cargar = async () => {
    const params = {};
    if (filtroEstado) params.estado = filtroEstado;
    const [f, r] = await Promise.all([getFacturas(params), getResumenFact()]);
    setFacturas(f.data);
    setResumen(r.data);
  };

  useEffect(() => { cargar(); }, [filtroEstado]);

  const verDetalle = async (id) => {
    if (detalle?.id_factura === id) { setDetalle(null); return; }
    const { data } = await getFactura(id);
    setDetalle(data);
    setNota(data.notas || '');
  };

  const cambiarEstado = async (id, estado) => {
    try {
      await cambiarEstadoFact(id, { estado });
      setMsg({ tipo: 'ok', texto: `Estado actualizado a "${estado}".` });
      cargar();
      if (detalle?.id_factura === id) { const { data } = await getFactura(id); setDetalle(data); }
    } catch (err) {
      setMsg({ tipo: 'err', texto: err.response?.data?.error || 'Error al cambiar estado.' });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const guardarNota = async () => {
    try {
      await agregarNotaFact(detalle.id_factura, { notas: nota });
      setMsg({ tipo: 'ok', texto: 'Nota guardada.' });
    } catch {
      setMsg({ tipo: 'err', texto: 'Error al guardar nota.' });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const imprimir = (f) => {
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>Factura ${f.numero_factura}</title>
      <style>body{font-family:Arial,sans-serif;padding:2rem;max-width:600px;margin:0 auto}
      h1{color:#1e40af}table{width:100%;border-collapse:collapse;margin:1rem 0}
      th,td{padding:0.5rem;border:1px solid #ccc;text-align:left}th{background:#f1f5f9}
      .total{font-size:1.2rem;font-weight:bold}.badge{padding:0.2rem 0.6rem;border-radius:4px;font-size:0.8rem}
      </style></head><body>
      <h1>🏪 Sistema de Inventario y Ventas</h1>
      <hr/>
      <h2>Factura N° ${f.numero_factura}</h2>
      <p><strong>Fecha:</strong> ${new Date(f.fecha_emision).toLocaleString('es-CO')}</p>
      <p><strong>Cliente:</strong> ${f.cliente || 'Cliente General'} ${f.documento ? `(${f.documento})` : ''}</p>
      <p><strong>Vendedor:</strong> ${f.vendedor}</p>
      <p><strong>Estado:</strong> ${f.estado.toUpperCase()}</p>
      <h3>Detalle</h3>
      <table>
        <thead><tr><th>Producto</th><th>Cant.</th><th>Precio Unit.</th><th>Subtotal</th></tr></thead>
        <tbody>
          ${(f.detalle || []).map(d => `<tr><td>${d.producto}</td><td>${d.cantidad}</td><td>$${parseFloat(d.precio_unitario).toFixed(2)}</td><td>$${parseFloat(d.subtotal).toFixed(2)}</td></tr>`).join('')}
        </tbody>
      </table>
      <p>Subtotal: <strong>$${parseFloat(f.subtotal).toFixed(2)}</strong></p>
      <p>IVA (19%): <strong>$${parseFloat(f.impuesto).toFixed(2)}</strong></p>
      <p class="total">TOTAL: $${parseFloat(f.total).toFixed(2)}</p>
      ${f.notas ? `<p><em>Notas: ${f.notas}</em></p>` : ''}
      <script>window.print();window.close();</script>
      </body></html>
    `);
    w.document.close();
  };

  return (
    <div style={s.page}>
      <h2 style={s.titulo}>🧾 Facturación</h2>
      {msg && <div style={msg.tipo === 'ok' ? s.ok : s.err}>{msg.texto}</div>}

      {/* Resumen */}
      <div style={s.resGrid}>
        {[
          { label: 'Total Facturas', val: resumen.total_facturas || 0, icon: '📋' },
          { label: 'Emitidas', val: resumen.emitidas || 0, icon: '📤', color: '#93c5fd' },
          { label: 'Pagadas', val: resumen.pagadas || 0, icon: '✅', color: '#86efac' },
          { label: 'Anuladas', val: resumen.anuladas || 0, icon: '❌', color: '#fca5a5' },
          { label: 'Total Cobrado', val: `$${parseFloat(resumen.total_cobrado || 0).toFixed(2)}`, icon: '💰', color: '#86efac' },
          { label: 'Pendiente', val: `$${parseFloat(resumen.total_pendiente || 0).toFixed(2)}`, icon: '⏳', color: '#fcd34d' },
        ].map(t => (
          <div key={t.label} style={s.resCard}>
            <span style={s.resIcon}>{t.icon}</span>
            <div>
              <div style={{ ...s.resVal, color: t.color || '#f1f5f9' }}>{t.val}</div>
              <div style={s.resLabel}>{t.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtro */}
      <div style={s.filtros}>
        <label style={s.label}>Filtrar por estado:</label>
        <select style={s.select} value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="">Todos</option>
          <option value="emitida">Emitida</option>
          <option value="pagada">Pagada</option>
          <option value="anulada">Anulada</option>
        </select>
      </div>

      {/* Tabla */}
      <div style={s.tablaBox}>
        <table style={s.table}>
          <thead>
            <tr>{['N° Factura','Fecha','Cliente','Vendedor','Total','Estado','Acciones'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {facturas.map(f => (
              <>
                <tr key={f.id_factura} style={s.tr}>
                  <td style={s.td}><strong style={{ color: '#93c5fd' }}>{f.numero_factura}</strong></td>
                  <td style={s.td}>{new Date(f.fecha_emision).toLocaleDateString('es-CO')}</td>
                  <td style={s.td}>{f.cliente || 'General'}</td>
                  <td style={s.td}>{f.vendedor}</td>
                  <td style={s.td}><strong style={{ color: '#10b981' }}>${parseFloat(f.total).toFixed(2)}</strong></td>
                  <td style={s.td}><span style={{ ...s.badge, background: ESTADOS[f.estado]?.bg, color: ESTADOS[f.estado]?.color }}>{f.estado}</span></td>
                  <td style={s.td}>
                    <button style={s.btnAcc} onClick={() => verDetalle(f.id_factura)}>{detalle?.id_factura === f.id_factura ? '▲' : '▼'}</button>
                    <button style={{ ...s.btnAcc, color: '#94a3b8' }} onClick={() => { getFactura(f.id_factura).then(r => imprimir(r.data)); }}>🖨️</button>
                  </td>
                </tr>
                {detalle?.id_factura === f.id_factura && (
                  <tr key={`d-${f.id_factura}`}>
                    <td colSpan="7" style={{ padding: '0 1rem 1rem' }}>
                      <div style={s.detalleBox}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                          <thead><tr>{['Producto','Precio Unit.','Cantidad','Subtotal'].map(h => <th key={h} style={{ ...s.th, background: '#0a1628' }}>{h}</th>)}</tr></thead>
                          <tbody>
                            {detalle.detalle?.map(d => (
                              <tr key={d.id_detalle}>
                                <td style={s.td}>{d.producto}</td>
                                <td style={s.td}>${parseFloat(d.precio_unitario).toFixed(2)}</td>
                                <td style={s.td}>{d.cantidad}</td>
                                <td style={s.td}><strong style={{ color: '#10b981' }}>${parseFloat(d.subtotal).toFixed(2)}</strong></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div style={s.totalesBox}>
                          <span style={s.totalRow}>Subtotal: <strong>${parseFloat(detalle.subtotal).toFixed(2)}</strong></span>
                          <span style={s.totalRow}>IVA (19%): <strong>${parseFloat(detalle.impuesto).toFixed(2)}</strong></span>
                          <span style={{ ...s.totalRow, color: '#10b981', fontSize: '1.1rem' }}>TOTAL: <strong>${parseFloat(detalle.total).toFixed(2)}</strong></span>
                        </div>
                        {esAdmin() && (
                          <div style={s.accionesBox}>
                            <span style={s.label}>Cambiar estado:</span>
                            {['emitida','pagada','anulada'].map(e => (
                              <button key={e} style={{ ...s.btnEstado, background: ESTADOS[e].bg, color: ESTADOS[e].color, opacity: detalle.estado === e ? 1 : 0.6 }}
                                onClick={() => cambiarEstado(detalle.id_factura, e)}>{e}</button>
                            ))}
                          </div>
                        )}
                        <div style={s.notaBox}>
                          <label style={s.label}>Notas internas:</label>
                          <textarea style={s.textarea} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Agregar observaciones..." rows={2} />
                          <button style={s.btnGuardar} onClick={guardarNota}>Guardar nota</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {facturas.length === 0 && <tr><td colSpan="7" style={{ ...s.td, textAlign: 'center', color: '#64748b' }}>No hay facturas.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const s = {
  page: { padding: '1.5rem' },
  titulo: { color: '#f1f5f9', marginBottom: '1rem' },
  ok: { background: '#052e16', color: '#86efac', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' },
  err: { background: '#450a0a', color: '#fca5a5', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' },
  resGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' },
  resCard: { background: '#1e293b', borderRadius: '0.75rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' },
  resIcon: { fontSize: '1.5rem' },
  resVal: { fontSize: '1.3rem', fontWeight: '700' },
  resLabel: { color: '#64748b', fontSize: '0.75rem' },
  filtros: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' },
  label: { color: '#94a3b8', fontSize: '0.875rem' },
  select: { padding: '0.5rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '0.4rem', color: '#f1f5f9' },
  tablaBox: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#1e293b', color: '#64748b', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #1e293b' },
  td: { padding: '0.875rem 1rem', color: '#94a3b8', verticalAlign: 'middle' },
  badge: { padding: '0.25rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' },
  btnAcc: { background: '#1e3a5f', color: '#93c5fd', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '0.4rem', cursor: 'pointer', marginRight: '0.4rem', fontSize: '0.85rem' },
  detalleBox: { background: '#0f172a', borderRadius: '0.5rem', padding: '1rem' },
  totalesBox: { display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' },
  totalRow: { color: '#94a3b8', fontSize: '0.9rem' },
  accionesBox: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' },
  btnEstado: { border: 'none', padding: '0.35rem 0.75rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' },
  notaBox: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  textarea: { padding: '0.5rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '0.4rem', color: '#f1f5f9', resize: 'vertical' },
  btnGuardar: { alignSelf: 'flex-start', padding: '0.4rem 1rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' },
};
