import React, { useState } from 'react';
import DashboardGestor from './Dashboard';
import DashboardEjecutivo from './DashboardEjecutivo';
import CursosAdmin from './CursosAdmin';
import UsuariosAdmin from './UsuariosAdmin';

const MENUS = [
  { key: 'dashboard', label: 'Dashboard', component: <DashboardGestor /> },
  { key: 'ejecutivo', label: 'Dashboard Ejecutivo', component: <DashboardEjecutivo /> },
  { key: 'cursos', label: 'Administrar Cursos', component: <CursosAdmin /> },
  { key: 'usuarios', label: 'Administrar Usuarios', component: <UsuariosAdmin /> },
];

export default function GestorPage() {
  const [menu, setMenu] = useState('dashboard');
  const menuObj = MENUS.find(m => m.key === menu) || MENUS[0];
  return (
    <div className="flex min-h-screen bg-background dark:bg-secondary">
      <aside className="w-64 bg-white dark:bg-secondary border-r border-secondary/10 dark:border-white/10 flex flex-col py-8 px-4 min-h-screen">
        <h2 className="text-lg font-bold text-primary mb-8">Panel Gestor</h2>
        <nav className="flex flex-col gap-2 mb-8">
          {MENUS.map(m => (
            <button
              key={m.key}
              className={`text-left px-4 py-2 rounded font-semibold transition ${menu === m.key ? 'bg-primary text-white' : 'text-secondary dark:text-white hover:bg-primary/10 dark:hover:bg-primary/20'}`}
              onClick={() => setMenu(m.key)}
            >
              {m.label}
            </button>
          ))}
        </nav>
        <button
          className="mt-auto px-4 py-2 rounded bg-success text-white font-semibold hover:bg-success/90 transition"
          onClick={() => window.open('/api/backup', '_blank')}
        >
          Descargar Backup JSON
        </button>
      </aside>
      <main className="flex-1">
        {menuObj.component}
      </main>
    </div>
  );
} 