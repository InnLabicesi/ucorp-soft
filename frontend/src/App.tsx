import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EmpleadoPage from './pages/empleado';
import GestorPage from './pages/gestor';

function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);
  return (
    <button
      className="ml-2 px-3 py-1 rounded border border-primary text-primary dark:text-white dark:border-white bg-white dark:bg-secondary hover:bg-primary/10 dark:hover:bg-secondary/30 transition"
      onClick={() => setDark(d => !d)}
      aria-label="Alternar tema oscuro/claro"
    >
      {dark ? '🌙 Oscuro' : '☀️ Claro'}
    </button>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen font-sans bg-background text-secondary dark:bg-secondary dark:text-white transition-colors">
        <header className="w-full flex items-center justify-between px-6 py-4 bg-white dark:bg-secondary shadow">
          <h1 className="text-xl font-bold text-primary dark:text-white">Sistema de Evaluación de Competencias Técnicas</h1>
          <ThemeToggle />
        </header>
        <Routes>
          <Route path="/" element={<Navigate to="/empleado" />} />
          <Route path="/empleado/*" element={<EmpleadoPage />} />
          <Route path="/gestor/*" element={<GestorPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
