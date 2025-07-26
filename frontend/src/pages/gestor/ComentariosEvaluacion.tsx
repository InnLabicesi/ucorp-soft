import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ComentariosEvaluacion({ evaluacionId }: { evaluacionId: number }) {
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [nuevo, setNuevo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchComentarios = () => {
    setLoading(true);
    axios.get(`/api/evaluacion/${evaluacionId}/comentarios`)
      .then(res => setComentarios(res.data))
      .catch(() => setError('Error al cargar comentarios'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchComentarios(); }, [evaluacionId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevo.trim()) return;
    setSaving(true);
    try {
      await axios.post(`/api/evaluacion/${evaluacionId}/comentarios`, { comentario: nuevo });
      setNuevo('');
      fetchComentarios();
    } catch {
      setError('Error al guardar comentario');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-4">
      <h3 className="font-bold text-secondary mb-2">Comentarios del gestor</h3>
      <form onSubmit={handleAdd} className="flex gap-2 mb-2">
        <input
          value={nuevo}
          onChange={e => setNuevo(e.target.value)}
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Agregar comentario..."
          disabled={saving}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-primary text-white font-semibold hover:bg-primary/90 transition"
          disabled={saving || !nuevo.trim()}
        >
          Agregar
        </button>
      </form>
      {loading ? <div className="text-secondary">Cargando...</div> : error ? <div className="text-error">{error}</div> : (
        <ul className="space-y-2">
          {comentarios.map(c => (
            <li key={c.id} className="bg-background rounded p-2 text-sm">
              <div className="font-semibold text-primary mb-1">{c.autor || 'Gestor'} <span className="text-xs text-secondary">{new Date(c.fecha).toLocaleString()}</span></div>
              <div>{c.comentario}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 