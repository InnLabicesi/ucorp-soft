import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Curso } from '../../types/evaluacion';

export default function CursosAdmin() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Curso>>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchCursos = () => {
    setLoading(true);
    axios.get('/api/cursos')
      .then(res => setCursos(res.data))
      .catch(() => setError('Error al cargar cursos'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCursos(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      if (!form.nombre || !form.horas || !form.profesores) {
        setMsg('Todos los campos son obligatorios');
        setSaving(false);
        return;
      }
      if (editId) {
        await axios.put(`/api/curso/${editId}`, form);
        setMsg('Curso actualizado');
      } else {
        await axios.post('/api/cursos', form);
        setMsg('Curso creado');
      }
      setForm({});
      setEditId(null);
      fetchCursos();
    } catch {
      setMsg('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (curso: Curso) => {
    setForm({ nombre: curso.nombre, horas: curso.horas, profesores: curso.profesores });
    setEditId(curso.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este curso?')) return;
    await axios.delete(`/api/curso/${id}`);
    fetchCursos();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-bold text-primary mb-4">Administración de Cursos</h2>
      <form onSubmit={handleSave} className="bg-white rounded shadow p-4 mb-6 flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            name="nombre"
            value={form.nombre || ''}
            onChange={handleChange}
            className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Nombre del curso"
            required
          />
          <input
            name="horas"
            type="number"
            min={1}
            value={form.horas || ''}
            onChange={handleChange}
            className="w-24 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Horas"
            required
          />
          <input
            name="profesores"
            value={form.profesores || ''}
            onChange={handleChange}
            className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Profesores"
            required
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-primary text-white font-semibold hover:bg-primary/90 transition"
            disabled={saving}
          >
            {editId ? 'Actualizar' : 'Crear'}
          </button>
          {editId && (
            <button type="button" className="px-4 py-2 rounded bg-secondary text-white" onClick={() => { setEditId(null); setForm({}); }}>Cancelar</button>
          )}
        </div>
        {msg && <div className="text-secondary mt-2">{msg}</div>}
      </form>
      <div className="bg-white rounded shadow p-4">
        <h3 className="font-bold mb-2 text-primary">Cursos registrados</h3>
        {loading ? <div className="text-secondary">Cargando...</div> : error ? <div className="text-error">{error}</div> : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-background text-primary">
                <th className="p-2 text-left">Nombre</th>
                <th className="p-2 text-left">Horas</th>
                <th className="p-2 text-left">Profesores</th>
                <th className="p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cursos.map(curso => (
                <tr key={curso.id} className="border-b">
                  <td className="p-2">{curso.nombre}</td>
                  <td className="p-2">{curso.horas}</td>
                  <td className="p-2">{curso.profesores}</td>
                  <td className="p-2 flex gap-2">
                    <button className="px-2 py-1 rounded bg-warning text-white text-xs" onClick={() => handleEdit(curso)}>Editar</button>
                    <button className="px-2 py-1 rounded bg-error text-white text-xs" onClick={() => handleDelete(curso.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 