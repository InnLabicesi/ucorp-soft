const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DBSOURCE = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error('Error al conectar con SQLite:', err.message);
    throw err;
  } else {
    console.log('Conectado a la base de datos SQLite.');
    // Crear tabla de evaluaciones
    db.run(`CREATE TABLE IF NOT EXISTS evaluaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      area TEXT,
      rol TEXT,
      experiencia TEXT,
      competencias TEXT,
      fecha_creacion TEXT,
      revisada INTEGER DEFAULT 0,
      notas_gestor TEXT,
      fecha_revision TEXT
    )`);
    // Crear tabla de cursos
    db.run(`CREATE TABLE IF NOT EXISTS cursos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      horas INTEGER,
      profesores TEXT
    )`);
    // Crear tabla de recomendaciones
    db.run(`CREATE TABLE IF NOT EXISTS recomendaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      evaluacion_id INTEGER,
      curso_id INTEGER,
      prioridad TEXT,
      justificacion TEXT,
      FOREIGN KEY(evaluacion_id) REFERENCES evaluaciones(id),
      FOREIGN KEY(curso_id) REFERENCES cursos(id)
    )`);
  }
});

module.exports = db; 