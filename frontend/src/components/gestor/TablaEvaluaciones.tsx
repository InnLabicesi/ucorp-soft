import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Evaluacion } from '../../types/evaluacion';
import * as XLSX from 'xlsx';
import Skeleton from '../shared/Skeleton';

const estados = [
  { label: 'Todas', value: 'todas' },
  { label: 'Pendientes', value: 'pendiente' },
  { label: 'Revisadas', value: 'revisada' },
];

const experiencias = [
  'Menos de 1 año',
  '1-2 años',
  '3-5 años',
  '6-10 años',
  'Más de 10 años',
];

function exportarCSV(evaluaciones: Evaluacion[]) {
  const encabezado = 'Nombre,Área,Rol,Experiencia,Fecha,Estado';
  const filas = evaluaciones.map(ev => [
    ev.nombre,
    ev.area,
    ev.rol,
    ev.experiencia,
    new Date(ev.fecha_creacion).toLocaleDateString(),
    ev.revisada ? 'Revisada' : 'Pendiente',
  ].map(v => `"${v}"`).join(','));
  const csv = [encabezado, ...filas].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'evaluaciones.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function exportarExcel(evaluaciones: Evaluacion[]) {
  const data = evaluaciones.map(ev => ({
    Nombre: ev.nombre,
    Área: ev.area,
    Rol: ev.rol,
    Experiencia: ev.experiencia,
    Fecha: new Date(ev.fecha_creacion).toLocaleDateString(),
    Estado: ev.revisada ? 'Revisada' : 'Pendiente',
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Evaluaciones');
  XLSX.writeFile(wb, 'evaluaciones.xlsx');
}

export default function TablaEvaluaciones({ onSelect }: { onSelect: (id: number) => void }) {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [filtro, setFiltro] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [filtroArea, setFiltroArea] = useState('');
  const [filtroExp, setFiltroExp] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');

  useEffect(() => {
    axios.get('/api/evaluaciones').then(res => {
      setEvaluaciones(res.data);
      setLoading(false);
    });
  }, []);

  // Obtener áreas únicas
  const areasUnicas = Array.from(new Set(evaluaciones.map(ev => ev.area))).filter(Boolean);

  const filtradas = evaluaciones.filter(ev => {
    if (filtro === 'pendiente' && ev.revisada) return false;
    if (filtro === 'revisada' && !ev.revisada) return false;
    if (busqueda) {
      const b = busqueda.toLowerCase();
      if (!(
        ev.nombre.toLowerCase().includes(b) ||
        ev.area.toLowerCase().includes(b) ||
        ev.rol.toLowerCase().includes(b)
      )) return false;
    }
    if (filtroArea && ev.area !== filtroArea) return false;
    if (filtroExp && ev.experiencia !== filtroExp) return false;
    if (filtroFecha) {
      const fecha = new Date(ev.fecha_creacion).toISOString().slice(0, 10);
      if (fecha !== filtroFecha) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre, área o rol..."
          className="border rounded px-3 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <div className="flex gap-2 mt-2 md:mt-0">
          {estados.map(est => (
            <button
              key={est.value}
              className={`px-3 py-1 rounded font-semibold border ${filtro === est.value ? 'bg-primary text-white' : 'bg-white text-secondary border-secondary/30'} transition`}
              onClick={() => setFiltro(est.value)}
            >
              {est.label}
            </button>
          ))}
        </div>
        <input
          type="date"
          className="border rounded px-3 py-2 w-full md:w-44 focus:outline-none focus:ring-2 focus:ring-primary"
          value={filtroFecha}
          onChange={e => setFiltroFecha(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2 w-full md:w-44 focus:outline-none focus:ring-2 focus:ring-primary"
          value={filtroArea}
          onChange={e => setFiltroArea(e.target.value)}
        >
          <option value="">Todas las áreas</option>
          {areasUnicas.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select
          className="border rounded px-3 py-2 w-full md:w-44 focus:outline-none focus:ring-2 focus:ring-primary"
          value={filtroExp}
          onChange={e => setFiltroExp(e.target.value)}
        >
          <option value="">Todas las experiencias</option>
          {experiencias.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <button
          className="px-3 py-1 rounded bg-success text-white font-semibold hover:bg-success/90 transition md:ml-auto focus-visible:ring-4 focus-visible:ring-success"
          onClick={() => exportarCSV(filtradas)}
          aria-label="Exportar CSV"
        >
          Exportar CSV
        </button>
        <button
          className="px-3 py-1 rounded bg-primary text-white font-semibold hover:bg-primary/90 transition focus-visible:ring-4 focus-visible:ring-primary"
          onClick={() => exportarExcel(filtradas)}
          aria-label="Exportar Excel"
        >
          Exportar Excel
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm" role="table" aria-label="Tabla de evaluaciones">
          <thead role="rowgroup">
            <tr className="bg-background text-primary">
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Área</th>
              <th className="p-2 text-left">Rol</th>
              <th className="p-2 text-left">Experiencia</th>
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={6}><Skeleton className="h-6 w-full mb-2" /></td>
                </tr>
              ))
            ) : filtradas.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-secondary/70">No hay evaluaciones</td></tr>
            ) : (
              filtradas.map(ev => (
                <tr key={ev.id} className="border-b hover:bg-secondary/10 cursor-pointer" onClick={() => onSelect(ev.id)}>
                  <td className="p-2 font-semibold">{ev.nombre}</td>
                  <td className="p-2">{ev.area}</td>
                  <td className="p-2">{ev.rol}</td>
                  <td className="p-2">{ev.experiencia}</td>
                  <td className="p-2">{new Date(ev.fecha_creacion).toLocaleDateString()}</td>
                  <td className="p-2">
                    {ev.revisada ? (
                      <span className="px-2 py-1 rounded bg-success/20 text-success font-bold text-xs">Revisada</span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-warning/20 text-warning font-bold text-xs">Pendiente</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 