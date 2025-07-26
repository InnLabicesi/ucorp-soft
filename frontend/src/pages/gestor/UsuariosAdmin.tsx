import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: number;
  fecha_creacion: string;
}

const roles = ['gestor', 'empleado'];

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Usuario>>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchUsuarios = () => {
    setLoading(true);
    axios.get('/api/usuarios')
      .then(res => setUsuarios(res.data))
      .catch(() => setError('Error al cargar usuarios'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsuarios(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      if (!form.nombre || !form.email || !form.rol) {
        setMsg('Todos los campos son obligatorios');
        setSaving(false);
        return;
      }
      if (editId) {
        await axios.put(`/api/usuario/${editId}`, { ...form, activo: form.activo ?? 1 });
        setMsg('Usuario actualizado');
      } else {
        await axios.post('/api/usuarios', form);
        setMsg('Usuario creado');
      }
      setForm({});
      setEditId(null);
      fetchUsuarios();
    } catch {
      setMsg('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setForm({ nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, activo: usuario.activo });
    setEditId(usuario.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    await axios.delete(`/api/usuario/${id}`);
    fetchUsuarios();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-bold text-primary mb-4">Administración de Usuarios</h2>
      <form onSubmit={handleSave} className="bg-white rounded shadow p-4 mb-6 flex flex-col gap-3">
        <div className="flex gap-2 flex-wrap">
          <input
            name="nombre"
            value={form.nombre || ''}
            onChange={handleChange}
            className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Nombre"
            required
          />
          <input
            name="email"
            type="email"
            value={form.email || ''}
            onChange={handleChange}
            className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Email"
            required
          />
          <select
            name="rol"
            value={form.rol || ''}
            onChange={handleChange}
            className="w-40 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Rol</option>
            {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
          <select
            name="activo"
            value={form.activo ?? 1}
            onChange={handleChange}
            className="w-32 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={1}>Activo</option>
            <option value={0}>Inactivo</option>
          </select>
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
        <h3 className="font-bold mb-2 text-primary">Usuarios registrados</h3>
        {loading ? <div className="text-secondary">Cargando...</div> : error ? <div className="text-error">{error}</div> : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-background text-primary">
                <th className="p-2 text-left">Nombre</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Rol</th>
                <th className="p-2 text-left">Estado</th>
                <th className="p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(usuario => (
                <tr key={usuario.id} className="border-b">
                  <td className="p-2">{usuario.nombre}</td>
                  <td className="p-2">{usuario.email}</td>
                  <td className="p-2 capitalize">{usuario.rol}</td>
                  <td className="p-2">{usuario.activo ? <span className="text-success font-bold">Activo</span> : <span className="text-error font-bold">Inactivo</span>}</td>
                  <td className="p-2 flex gap-2">
                    <button className="px-2 py-1 rounded bg-warning text-white text-xs" onClick={() => handleEdit(usuario)}>Editar</button>
                    <button className="px-2 py-1 rounded bg-error text-white text-xs" onClick={() => handleDelete(usuario.id)}>Eliminar</button>
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