import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TablaEvaluaciones from '../../components/gestor/TablaEvaluaciones';
import { Evaluacion } from '../../types/evaluacion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Toast from '../../components/shared/Toast';
import Skeleton from '../../components/shared/Skeleton';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ComentariosEvaluacion from './ComentariosEvaluacion';

function DetalleEvaluacion({ id, onBack, onSelect }: { id: number, onBack: () => void, onSelect: (id: number) => void }) {
  const [data, setData] = useState<Evaluacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notas, setNotas] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const puedeRevisar = data && !data.revisada;
  const [historial, setHistorial] = useState<Evaluacion[]>([]);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/evaluacion/${id}`)
      .then(res => {
        setData(res.data);
        // Cargar historial por nombre (excluyendo la actual)
        axios.get('/api/evaluaciones').then(evRes => {
          const otros = evRes.data.filter((ev: Evaluacion) => ev.nombre === res.data.nombre && ev.id !== id);
          setHistorial(otros);
        });
      })
      .catch(() => setError('Error al cargar la evaluación'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRevisar = async () => {
    setGuardando(true);
    try {
      await axios.post(`/api/evaluacion/${id}/revisar`, { notas_gestor: notas });
      setGuardado(true);
      setTimeout(() => {
        setGuardado(false);
        onBack();
      }, 1200);
    } catch {
      alert('Error al guardar la revisión');
    } finally {
      setGuardando(false);
    }
  };

  const exportarPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Reporte de Evaluación de Competencias Técnicas', 14, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Empleado: ${data.nombre}`, 14, 28);
    doc.text(`Área: ${data.area}`, 14, 34);
    doc.text(`Rol: ${data.rol}`, 14, 40);
    doc.text(`Experiencia: ${data.experiencia}`, 14, 46);
    doc.text(`Fecha: ${new Date(data.fecha_creacion).toLocaleString()}`, 14, 52);
    autoTable(doc, {
      startY: 58,
      head: [['Área', 'Nivel', 'Gap', 'Interés', 'Relevancia']],
      body: data.competencias.map((c: any) => [c.area, c.nivel_actual, Math.max(0, 4 - c.nivel_actual), c.interes, c.relevancia]),
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
    });
    let y = (doc as any).lastAutoTable.finalY + 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Recomendaciones de cursos:', 14, y);
    doc.setFont('helvetica', 'normal');
    autoTable(doc, {
      startY: y + 2,
      head: [['Prioridad', 'Curso', 'Horas', 'Profesores', 'Justificación']],
      body: (data.recomendaciones || []).map((r: any) => [r.prioridad, r.curso_nombre, r.horas, r.profesores, r.justificacion]),
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 8 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
    if (data.notas_gestor) {
      doc.setFont('helvetica', 'bold');
      doc.text('Notas del gestor:', 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(data.notas_gestor, 14, y + 6);
      y += 12;
    }
    doc.save(`reporte_evaluacion_${id}.pdf`);
  };

  if (loading) return <div className="text-secondary">Cargando...</div>;
  if (error || !data) return <div className="text-error">{error || 'No encontrada'}</div>;

  return (
    <div className="bg-white rounded shadow p-6">
      <button className="mb-4 text-primary underline focus-visible:ring-4 focus-visible:ring-primary" onClick={onBack} aria-label="Volver al listado">&larr; Volver al listado</button>
      <h2 className="text-xl font-bold text-primary mb-2">Detalle de Evaluación</h2>
      <div className="mb-4">
        <div><b>Nombre:</b> {data.nombre}</div>
        <div><b>Área:</b> {data.area}</div>
        <div><b>Rol:</b> {data.rol}</div>
        <div><b>Experiencia:</b> {data.experiencia}</div>
        <div><b>Fecha:</b> {new Date(data.fecha_creacion).toLocaleString()}</div>
        <div><b>Estado:</b> {data.revisada ? <span className="text-success font-bold">Revisada</span> : <span className="text-warning font-bold">Pendiente</span>}</div>
      </div>
      <div className="mb-4 flex gap-4 items-center">
        <button
          className="px-4 py-2 rounded bg-primary text-white font-semibold hover:bg-primary/90 transition focus-visible:ring-4 focus-visible:ring-primary"
          onClick={() => window.open(`/api/reporte/${id}`, '_blank')}
          aria-label="Descargar reporte TXT"
        >
          Descargar reporte TXT
        </button>
        <button
          className="px-4 py-2 rounded bg-success text-white font-semibold hover:bg-success/90 transition focus-visible:ring-4 focus-visible:ring-success"
          onClick={exportarPDF}
          aria-label="Exportar PDF"
        >
          Exportar PDF
        </button>
      </div>
      <div className="mb-4">
        <h3 className="font-bold text-secondary mb-2">Competencias evaluadas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {data.competencias.map((c, i) => (
            <div key={i} className="bg-background rounded p-2">
              <b>{c.area}</b>: Nivel {c.nivel_actual}, Interés {c.interes}, Relevancia {c.relevancia}
            </div>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <h3 className="font-bold text-secondary mb-2">Recomendaciones de cursos</h3>
        {data.recomendaciones && data.recomendaciones.length > 0 ? (
          <ul className="space-y-2">
            {data.recomendaciones.map((r, i) => (
              <li key={i} className="bg-primary/10 rounded p-2 flex flex-col md:flex-row md:items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${r.prioridad === 'Alta' ? 'bg-error/20 text-error' : r.prioridad === 'Media' ? 'bg-warning/20 text-warning' : 'bg-secondary/20 text-secondary'}`}>{r.prioridad}</span>
                <span className="font-semibold">{r.curso_nombre}</span>
                <span className="text-xs">({r.horas}h)</span>
                <span className="text-xs text-secondary">{r.profesores}</span>
                <span className="text-xs italic">{r.justificacion}</span>
              </li>
            ))}
          </ul>
        ) : <div className="text-secondary/70">Sin recomendaciones</div>}
      </div>
      {data.notas_gestor && (
        <div className="mb-4">
          <h3 className="font-bold text-secondary mb-2">Notas del gestor</h3>
          <div className="bg-secondary/10 rounded p-2">{data.notas_gestor}</div>
        </div>
      )}
      {data && <ComentariosEvaluacion evaluacionId={data.id} />}
      {historial.length > 0 && (
        <div className="mb-4">
          <h3 className="font-bold text-secondary mb-2">Historial de evaluaciones de este empleado</h3>
          <ul className="space-y-1">
            {historial.map(ev => (
              <li key={ev.id}>
                <button
                  className="text-primary underline text-sm hover:text-primary/80"
                  onClick={() => onSelect(ev.id)}
                >
                  {new Date(ev.fecha_creacion).toLocaleDateString()} - {ev.rol} - {ev.area} {ev.revisada ? '(Revisada)' : '(Pendiente)'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {puedeRevisar && (
        <div className="mt-6">
          <h3 className="font-bold text-secondary mb-2">Marcar como revisada</h3>
          <textarea
            className="w-full border rounded p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
            placeholder="Notas del gestor (opcional)"
            value={notas}
            onChange={e => setNotas(e.target.value)}
          />
          <button
            className="px-6 py-2 rounded bg-success text-white font-semibold hover:bg-success/90 transition disabled:opacity-50"
            onClick={handleRevisar}
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : 'Marcar como revisada'}
          </button>
          {guardado && <span className="ml-4 text-success font-bold">¡Guardado!</span>}
        </div>
      )}
    </div>
  );
}

function Breadcrumbs({ detalleId, onBack }: { detalleId: number | null, onBack: () => void }) {
  return (
    <nav className="text-sm mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-secondary dark:text-white/80">
        <li>
          <span className="font-bold text-primary">Dashboard</span>
        </li>
        <li>
          <span className="mx-2">/</span>
          <span className="font-bold">Evaluaciones</span>
        </li>
        {detalleId && (
          <li>
            <span className="mx-2">/</span>
            <button className="underline text-primary" onClick={onBack}>Detalle</button>
          </li>
        )}
      </ol>
    </nav>
  );
}

export default function DashboardGestor() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const [analisisAreas, setAnalisisAreas] = useState<any[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [lastTotal, setLastTotal] = useState<number | null>(null);

  useEffect(() => {
    axios.get('/api/gestor/dashboard')
      .then(res => {
        setStats(res.data);
        setAnalisisAreas(res.data.analisisAreas);
      })
      .catch(() => setError('Error al cargar estadísticas'))
      .finally(() => setLoading(false));
  }, []);

  // Polling para nuevas evaluaciones
  useEffect(() => {
    const interval = setInterval(() => {
      axios.get('/api/estadisticas').then(res => {
        if (lastTotal !== null && res.data.total > lastTotal) {
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4000);
        }
        setLastTotal(res.data.total);
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [lastTotal]);

  return (
    <div className="max-w-screen-xl mx-auto p-6">
      <Toast message="¡Nueva evaluación recibida!" show={showToast} />
      <Breadcrumbs detalleId={detalleId} onBack={() => setDetalleId(null)} />
      <h1 className="text-2xl font-bold text-primary mb-6">Panel de Gestor Universitario</h1>
      {loading ? (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
          <div className="bg-white rounded shadow p-4 mt-8 mb-8">
            <Skeleton className="h-8 w-1/3 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="bg-white rounded shadow p-4 mt-8">
            <Skeleton className="h-8 w-1/3 mb-4" />
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-full mb-2" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="text-error">{error}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8" role="region" aria-label="Métricas principales">
          <div className="bg-white rounded shadow p-4 flex flex-col items-center" role="status" aria-label="Evaluaciones totales">
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
            <div className="text-secondary">Evaluaciones totales</div>
          </div>
          <div className="bg-white rounded shadow p-4 flex flex-col items-center" role="status" aria-label="Pendientes">
            <div className="text-3xl font-bold text-warning">{stats.pendientes}</div>
            <div className="text-secondary">Pendientes</div>
          </div>
          <div className="bg-white rounded shadow p-4 flex flex-col items-center" role="status" aria-label="Revisadas">
            <div className="text-3xl font-bold text-success">{stats.revisadas}</div>
            <div className="text-secondary">Revisadas</div>
          </div>
          <div className="bg-white rounded shadow p-4 flex flex-col items-center" role="status" aria-label="Cursos disponibles">
            <div className="text-3xl font-bold text-primary">{Array.isArray(stats.cursos) ? stats.cursos.length : stats.cursos}</div>
            <div className="text-secondary">Cursos disponibles</div>
          </div>
        </div>
      )}
      <div className="bg-white rounded shadow p-4 mt-8 mb-8" role="region" aria-label="Análisis por área de competencia">
        <div className="font-bold text-lg mb-2 text-primary">Análisis por área de competencia</div>
        {analisisAreas.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={analisisAreas} margin={{ left: 0, right: 0, top: 16, bottom: 0 }} role="img" aria-label="Gráfico de análisis por área">
              <XAxis dataKey="area" tick={{ fontSize: 12 }} angle={-15} textAnchor="end" height={60} interval={0} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="nivelProm" fill="#2563eb" name="Nivel promedio" />
              <Bar dataKey="gapProm" fill="#ef4444" name="Gap promedio" />
              <Bar dataKey="interesProm" fill="#f59e0b" name="Interés promedio" />
              <Bar dataKey="relevanciaProm" fill="#10b981" name="Relevancia promedio" />
            </BarChart>
          </ResponsiveContainer>
        ) : <div className="text-secondary/70">Sin datos suficientes</div>}
      </div>
      <div className="bg-white rounded shadow p-4 mt-8">
        <div className="font-bold text-lg mb-2 text-primary">Evaluaciones</div>
        {detalleId ? (
          <DetalleEvaluacion id={detalleId} onBack={() => setDetalleId(null)} onSelect={setDetalleId} />
        ) : (
          <TablaEvaluaciones onSelect={setDetalleId} />
        )}
      </div>
    </div>
  );
} 