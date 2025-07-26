import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

export default function DashboardEjecutivo() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get('/api/ejecutivo/dashboard')
      .then(res => setData(res.data))
      .catch(() => setError('Error al cargar métricas ejecutivas'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-secondary">Cargando...</div>;
  if (error) return <div className="text-error">{error}</div>;

  return (
    <div className="max-w-screen-xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-primary mb-6">Dashboard Ejecutivo</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <div className="text-3xl font-bold text-primary">{data.global.nivelProm}</div>
          <div className="text-secondary">Nivel promedio</div>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <div className="text-3xl font-bold text-error">{data.global.gapProm}</div>
          <div className="text-secondary">Gap promedio</div>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <div className="text-3xl font-bold text-warning">{data.global.interesProm}</div>
          <div className="text-secondary">Interés promedio</div>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <div className="text-3xl font-bold text-success">{data.global.relevanciaProm}</div>
          <div className="text-secondary">Relevancia promedio</div>
        </div>
      </div>
      <div className="bg-white rounded shadow p-4 mt-8 mb-8">
        <div className="font-bold text-lg mb-2 text-primary">Comparativa por área vs. global</div>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={data.comparativas} margin={{ left: 0, right: 0, top: 16, bottom: 0 }}>
            <XAxis dataKey="area" tick={{ fontSize: 12 }} angle={-15} textAnchor="end" height={60} interval={0} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="nivelProm" fill="#2563eb" name="Nivel área" />
            <Bar dataKey="gapProm" fill="#ef4444" name="Gap área" />
            <Bar dataKey="interesProm" fill="#f59e0b" name="Interés área" />
            <Bar dataKey="relevanciaProm" fill="#10b981" name="Relevancia área" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded shadow p-4 mt-8 mb-8">
        <div className="font-bold text-lg mb-2 text-primary">Radar comparativo por área</div>
        <ResponsiveContainer width="100%" height={340}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.comparativas}>
            <PolarGrid />
            <PolarAngleAxis dataKey="area" />
            <PolarRadiusAxis />
            <Radar name="Nivel" dataKey="nivelProm" stroke="#2563eb" fill="#2563eb" fillOpacity={0.4} />
            <Radar name="Gap" dataKey="gapProm" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
            <Radar name="Interés" dataKey="interesProm" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
            <Radar name="Relevancia" dataKey="relevanciaProm" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 