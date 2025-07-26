const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DBSOURCE = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error('Error al conectar con SQLite:', err.message);
    throw err;
  } else {
    // Crear tablas si no existen
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS cursos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        horas INTEGER,
        profesores TEXT
      )`);
      // Insertar cursos
      const cursos = [
        {
          nombre: 'Prácticas ágiles para la gerencia de proyectos',
          horas: 24,
          profesores: 'Hugo Arboleda / Ingrid Muñoz',
        },
        {
          nombre: 'Levantamiento de requerimientos con seguridad',
          horas: 16,
          profesores: 'Jose Luis Jurado / Lorena Jojoa',
        },
        {
          nombre: 'Técnicas de pruebas de software',
          horas: 12,
          profesores: 'Rocío Segovia Jiménez',
        },
        {
          nombre: 'Seguridad en IA',
          horas: 16,
          profesores: 'Christian Urcuqui',
        },
        {
          nombre: 'Fundamentos de protocolos de seguridad',
          horas: 12,
          profesores: 'Juan Carlos Cuéllar',
        },
        {
          nombre: 'API Gateway',
          horas: 16,
          profesores: 'Leonardo Bustamante',
        },
        {
          nombre: 'Serverless',
          horas: 16,
          profesores: 'Juan Carlos Muñoz',
        },
        {
          nombre: 'Docker y Kubernetes',
          horas: 16,
          profesores: 'Juan Jose Valencia y Domiciano Rincón',
        },
        {
          nombre: 'AWS: arquitectura, seguridad, redes',
          horas: 24,
          profesores: 'Gonzalo Llano R',
        },
      ];
      cursos.forEach((curso) => {
        db.run(
          'INSERT INTO cursos (nombre, horas, profesores) VALUES (?, ?, ?)',
          [curso.nombre, curso.horas, curso.profesores],
          (err) => {
            if (err) {
              if (!err.message.includes('UNIQUE')) {
                console.error('Error insertando curso:', err.message);
              }
            } else {
              console.log('Curso insertado:', curso.nombre);
            }
          }
        );
      });
    });
  }
}); 