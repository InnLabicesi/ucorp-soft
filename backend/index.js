const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.get('/api/ping', (req, res) => {
  res.json({ message: 'Backend operativo' });
});

app.get('/api/cursos', (req, res) => {
  db.all('SELECT * FROM cursos', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener cursos' });
    }
    res.json(rows);
  });
});

app.post('/api/cursos', (req, res) => {
  const { nombre, horas, profesores } = req.body;
  if (!nombre || !horas || !profesores) return res.status(400).json({ error: 'Faltan campos obligatorios' });
  db.run('INSERT INTO cursos (nombre, horas, profesores) VALUES (?, ?, ?)', [nombre, horas, profesores], function(err) {
    if (err) return res.status(500).json({ error: 'Error al crear curso' });
    res.json({ id: this.lastID });
  });
});

app.put('/api/curso/:id', (req, res) => {
  const { nombre, horas, profesores } = req.body;
  const { id } = req.params;
  if (!nombre || !horas || !profesores) return res.status(400).json({ error: 'Faltan campos obligatorios' });
  db.run('UPDATE cursos SET nombre = ?, horas = ?, profesores = ? WHERE id = ?', [nombre, horas, profesores, id], function(err) {
    if (err) return res.status(500).json({ error: 'Error al actualizar curso' });
    if (this.changes === 0) return res.status(404).json({ error: 'Curso no encontrado' });
    res.json({ success: true });
  });
});

app.delete('/api/curso/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM cursos WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: 'Error al eliminar curso' });
    if (this.changes === 0) return res.status(404).json({ error: 'Curso no encontrado' });
    res.json({ success: true });
  });
});

app.post('/api/evaluacion', (req, res) => {
  console.log('POST /api/evaluacion body:', req.body);
  const { nombre, area, rol, experiencia, competencias } = req.body;
  if (!nombre || !area || !rol || !experiencia || !competencias) {
    console.error('Faltan campos obligatorios:', { nombre, area, rol, experiencia, competencias });
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  const fecha_creacion = new Date().toISOString();
  const competenciasStr = JSON.stringify(competencias);
  db.run(
    `INSERT INTO evaluaciones (nombre, area, rol, experiencia, competencias, fecha_creacion, revisada) VALUES (?, ?, ?, ?, ?, ?, 0)`,
    [nombre, area, rol, experiencia, competenciasStr, fecha_creacion],
    function (err) {
      if (err) {
        console.error('Error al guardar la evaluación:', err.message);
        return res.status(500).json({ error: 'Error al guardar la evaluación' });
      }
      const evaluacion_id = this.lastID;
      // Generar recomendaciones automáticas
      db.all('SELECT * FROM cursos', [], (err, cursos) => {
        if (err) {
          console.error('Error al obtener cursos:', err.message);
          return res.status(500).json({ error: 'Error al obtener cursos' });
        }
        const recomendaciones = [];
        // Áreas de competencia y matching de cursos
        const areasCursos = [
          { area: 'Gestión de Proyectos', cursos: [0] },
          { area: 'Análisis y Requerimientos', cursos: [1] },
          { area: 'Calidad y Testing', cursos: [2] },
          { area: 'Seguridad', cursos: [3,4] },
          { area: 'Arquitectura y Desarrollo', cursos: [5] },
          { area: 'Cloud Computing', cursos: [6,8] },
          { area: 'DevOps e Infraestructura', cursos: [7,8] },
          { area: 'Inteligencia Artificial', cursos: [3] },
        ];
        competencias.forEach((comp, idx) => {
          const gap = Math.max(0, 4 - (comp.nivel_actual || 1));
          const interes = comp.interes || 1;
          const relevancia = comp.relevancia || 1;
          const puntuacion = (gap * 0.4) + (interes * 0.3) + (relevancia * 0.3);
          let prioridad = 'Baja';
          if (puntuacion > 3) prioridad = 'Alta';
          else if (puntuacion > 2) prioridad = 'Media';
          // Justificación automática
          let justificacion = '';
          if (gap >= 2) justificacion += 'Gap significativo. ';
          if (interes >= 4) justificacion += 'Alto interés. ';
          if (relevancia >= 4) justificacion += 'Alta relevancia. ';
          // Matching de cursos
          (areasCursos[idx]?.cursos || []).forEach(cursoIdx => {
            const curso = cursos[cursoIdx];
            if (curso) {
              recomendaciones.push({
                evaluacion_id,
                curso_id: curso.id,
                prioridad,
                justificacion: justificacion.trim() || 'Recomendación automática.'
              });
            }
          });
        });
        // Guardar recomendaciones
        const stmt = db.prepare('INSERT INTO recomendaciones (evaluacion_id, curso_id, prioridad, justificacion) VALUES (?, ?, ?, ?)');
        recomendaciones.forEach(rec => {
          stmt.run([rec.evaluacion_id, rec.curso_id, rec.prioridad, rec.justificacion]);
        });
        stmt.finalize();
        return res.json({ success: true, id: evaluacion_id });
      });
    }
  );
});

// Listar todas las evaluaciones
app.get('/api/evaluaciones', (req, res) => {
  db.all('SELECT * FROM evaluaciones ORDER BY fecha_creacion DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener evaluaciones' });
    }
    // No enviar competencias como string JSON, sino como objeto
    const evaluaciones = rows.map(ev => ({
      ...ev,
      competencias: JSON.parse(ev.competencias || '[]'),
      revisada: !!ev.revisada
    }));
    res.json(evaluaciones);
  });
});

// Obtener detalle de evaluación con recomendaciones y cursos
app.get('/api/evaluacion/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM evaluaciones WHERE id = ?', [id], (err, evaluacion) => {
    if (err || !evaluacion) {
      return res.status(404).json({ error: 'Evaluación no encontrada' });
    }
    evaluacion.competencias = JSON.parse(evaluacion.competencias || '[]');
    evaluacion.revisada = !!evaluacion.revisada;
    // Obtener recomendaciones
    db.all('SELECT r.*, c.nombre as curso_nombre, c.horas, c.profesores FROM recomendaciones r JOIN cursos c ON r.curso_id = c.id WHERE r.evaluacion_id = ?', [id], (err, recomendaciones) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener recomendaciones' });
      }
      evaluacion.recomendaciones = recomendaciones;
      res.json(evaluacion);
    });
  });
});

// Marcar evaluación como revisada y guardar notas del gestor
app.post('/api/evaluacion/:id/revisar', (req, res) => {
  const id = req.params.id;
  const { notas_gestor } = req.body;
  const fecha_revision = new Date().toISOString();
  db.run(
    'UPDATE evaluaciones SET revisada = 1, notas_gestor = ?, fecha_revision = ? WHERE id = ?',
    [notas_gestor || '', fecha_revision, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error al marcar como revisada' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Evaluación no encontrada' });
      }
      res.json({ success: true });
    }
  );
});

// Generar reporte profesional para RR.HH.
app.get('/api/reporte/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM evaluaciones WHERE id = ?', [id], (err, evaluacion) => {
    if (err || !evaluacion) {
      return res.status(404).json({ error: 'Evaluación no encontrada' });
    }
    evaluacion.competencias = JSON.parse(evaluacion.competencias || '[]');
    // Obtener recomendaciones
    db.all('SELECT r.*, c.nombre as curso_nombre, c.horas, c.profesores FROM recomendaciones r JOIN cursos c ON r.curso_id = c.id WHERE r.evaluacion_id = ?', [id], (err, recomendaciones) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener recomendaciones' });
      }
      // Métricas clave
      const niveles = evaluacion.competencias.map(c => c.nivel_actual || 1);
      const gaps = evaluacion.competencias.map(c => Math.max(0, 4 - (c.nivel_actual || 1)));
      const intereses = evaluacion.competencias.map(c => c.interes || 1);
      const relevancias = evaluacion.competencias.map(c => c.relevancia || 1);
      const gapProm = (gaps.reduce((a,b) => a+b,0) / gaps.length).toFixed(2);
      const nivelProm = (niveles.reduce((a,b) => a+b,0) / niveles.length).toFixed(2);
      const interesProm = (intereses.reduce((a,b) => a+b,0) / intereses.length).toFixed(2);
      const relevanciaProm = (relevancias.reduce((a,b) => a+b,0) / relevancias.length).toFixed(2);
      const horasTotales = recomendaciones.reduce((a,rec) => a + (rec.horas || 0), 0);
      // Resumen ejecutivo
      let resumen = `REPORTE DE EVALUACIÓN DE COMPETENCIAS TÉCNICAS\n\n`;
      resumen += `Empleado: ${evaluacion.nombre}\nÁrea: ${evaluacion.area}\nRol: ${evaluacion.rol}\nExperiencia: ${evaluacion.experiencia}\nFecha: ${evaluacion.fecha_creacion}\n\n`;
      resumen += `Resumen Ejecutivo:\n`;
      resumen += `- Nivel promedio: ${nivelProm}\n- Gap promedio: ${gapProm}\n- Interés promedio: ${interesProm}\n- Relevancia promedio: ${relevanciaProm}\n- Total de cursos recomendados: ${recomendaciones.length}\n- Horas estimadas de capacitación: ${horasTotales}\n\n`;
      // Áreas críticas y fortalezas
      const criticas = evaluacion.competencias.filter((c,i) => gaps[i] >= 2);
      const fortalezas = evaluacion.competencias.filter((c,i) => gaps[i] === 0);
      resumen += `Áreas críticas: ${criticas.map(c => c.area).join(', ') || 'Ninguna'}\n`;
      resumen += `Fortalezas: ${fortalezas.map(c => c.area).join(', ') || 'Ninguna'}\n\n`;
      // Plan de implementación
      resumen += `Plan de implementación sugerido:\n`;
      recomendaciones.forEach((rec, idx) => {
        resumen += `  - [${rec.prioridad}] ${rec.curso_nombre} (${rec.horas}h) - ${rec.justificacion}\n`;
      });
      resumen += `\n`;
      // Análisis de gaps
      resumen += `Análisis de gaps por competencia:\n`;
      evaluacion.competencias.forEach((c, idx) => {
        resumen += `  - ${c.area}: Nivel actual ${c.nivel_actual}, Gap ${gaps[idx]}, Interés ${c.interes}, Relevancia ${c.relevancia}\n`;
      });
      resumen += `\n`;
      // Estimación de inversión
      const inversion = horasTotales * 50000; // Ejemplo: $50.000 por hora
      resumen += `Estimación de inversión: $${inversion.toLocaleString('es-CO')} COP\n`;
      // Notas del gestor
      if (evaluacion.notas_gestor) {
        resumen += `\nNotas del gestor: ${evaluacion.notas_gestor}\n`;
      }
      res.setHeader('Content-Disposition', `attachment; filename=reporte_evaluacion_${id}.txt`);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(resumen);
    });
  });
});

// Endpoint de estadísticas para dashboard
app.get('/api/estadisticas', (req, res) => {
  const stats = {};
  db.get('SELECT COUNT(*) as total FROM evaluaciones', [], (err, row) => {
    stats.total = row ? row.total : 0;
    db.get('SELECT COUNT(*) as pendientes FROM evaluaciones WHERE revisada = 0', [], (err2, row2) => {
      stats.pendientes = row2 ? row2.pendientes : 0;
      db.get('SELECT COUNT(*) as revisadas FROM evaluaciones WHERE revisada = 1', [], (err3, row3) => {
        stats.revisadas = row3 ? row3.revisadas : 0;
        db.get('SELECT COUNT(*) as cursos FROM cursos', [], (err4, row4) => {
          stats.cursos = row4 ? row4.cursos : 0;
          res.json(stats);
        });
      });
    });
  });
});

// Dashboard avanzado para gestor universitario
app.get('/api/gestor/dashboard', (req, res) => {
  // Métricas agregadas y análisis por área
  db.all('SELECT * FROM evaluaciones', [], (err, evaluaciones) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener evaluaciones' });
    }
    // Parsear competencias
    evaluaciones.forEach(ev => {
      ev.competencias = JSON.parse(ev.competencias || '[]');
    });
    // Análisis por área
    const areas = [
      'Gestión de Proyectos',
      'Análisis y Requerimientos',
      'Calidad y Testing',
      'Seguridad',
      'Arquitectura y Desarrollo',
      'Cloud Computing',
      'DevOps e Infraestructura',
      'Inteligencia Artificial',
    ];
    const analisisAreas = areas.map((area, idx) => {
      const datos = evaluaciones.map(ev => ev.competencias[idx] || {});
      const nivelProm = (datos.reduce((a, c) => a + (c.nivel_actual || 1), 0) / (datos.length || 1)).toFixed(2);
      const gapProm = (datos.reduce((a, c) => a + Math.max(0, 4 - (c.nivel_actual || 1)), 0) / (datos.length || 1)).toFixed(2);
      const interesProm = (datos.reduce((a, c) => a + (c.interes || 1), 0) / (datos.length || 1)).toFixed(2);
      const relevanciaProm = (datos.reduce((a, c) => a + (c.relevancia || 1), 0) / (datos.length || 1)).toFixed(2);
      return {
        area,
        nivelProm: Number(nivelProm),
        gapProm: Number(gapProm),
        interesProm: Number(interesProm),
        relevanciaProm: Number(relevanciaProm),
      };
    });
    // Métricas globales
    const total = evaluaciones.length;
    const pendientes = evaluaciones.filter(ev => !ev.revisada).length;
    const revisadas = evaluaciones.filter(ev => !!ev.revisada).length;
    // Cursos recomendados totales
    db.all('SELECT * FROM recomendaciones', [], (err2, recomendaciones) => {
      if (err2) {
        return res.status(500).json({ error: 'Error al obtener recomendaciones' });
      }
      db.all('SELECT * FROM cursos', [], (err3, cursos) => {
        if (err3) {
          return res.status(500).json({ error: 'Error al obtener cursos' });
        }
        res.json({
          total,
          pendientes,
          revisadas,
          analisisAreas,
          cursos,
          totalRecomendaciones: recomendaciones.length,
        });
      });
    });
  });
});

// Dashboard ejecutivo con métricas agregadas y comparativas
app.get('/api/ejecutivo/dashboard', (req, res) => {
  db.all('SELECT * FROM evaluaciones', [], (err, evaluaciones) => {
    if (err) return res.status(500).json({ error: 'Error al obtener evaluaciones' });
    evaluaciones.forEach(ev => {
      ev.competencias = JSON.parse(ev.competencias || '[]');
    });
    // Métricas globales
    let totalCompetencias = 0, sumNivel = 0, sumGap = 0, sumInteres = 0, sumRelevancia = 0;
    evaluaciones.forEach(ev => {
      ev.competencias.forEach(c => {
        totalCompetencias++;
        sumNivel += c.nivel_actual || 1;
        sumGap += Math.max(0, 4 - (c.nivel_actual || 1));
        sumInteres += c.interes || 1;
        sumRelevancia += c.relevancia || 1;
      });
    });
    const global = {
      nivelProm: +(sumNivel / totalCompetencias).toFixed(2),
      gapProm: +(sumGap / totalCompetencias).toFixed(2),
      interesProm: +(sumInteres / totalCompetencias).toFixed(2),
      relevanciaProm: +(sumRelevancia / totalCompetencias).toFixed(2),
    };
    // Comparativas por área
    const areas = [
      'Gestión de Proyectos',
      'Análisis y Requerimientos',
      'Calidad y Testing',
      'Seguridad',
      'Arquitectura y Desarrollo',
      'Cloud Computing',
      'DevOps e Infraestructura',
      'Inteligencia Artificial',
    ];
    const comparativas = areas.map((area, idx) => {
      const datos = evaluaciones.map(ev => ev.competencias[idx] || {});
      const nivelProm = +(datos.reduce((a, c) => a + (c.nivel_actual || 1), 0) / (datos.length || 1)).toFixed(2);
      const gapProm = +(datos.reduce((a, c) => a + Math.max(0, 4 - (c.nivel_actual || 1)), 0) / (datos.length || 1)).toFixed(2);
      const interesProm = +(datos.reduce((a, c) => a + (c.interes || 1), 0) / (datos.length || 1)).toFixed(2);
      const relevanciaProm = +(datos.reduce((a, c) => a + (c.relevancia || 1), 0) / (datos.length || 1)).toFixed(2);
      return { area, nivelProm, gapProm, interesProm, relevanciaProm };
    });
    res.json({ global, comparativas });
  });
});

// Crear tabla de comentarios si no existe
const createComentariosTable = () => {
  db.run(`CREATE TABLE IF NOT EXISTS comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evaluacion_id INTEGER,
    autor TEXT,
    comentario TEXT,
    fecha TEXT,
    FOREIGN KEY(evaluacion_id) REFERENCES evaluaciones(id)
  )`);
};
createComentariosTable();

// Obtener comentarios de una evaluación
app.get('/api/evaluacion/:id/comentarios', (req, res) => {
  const { id } = req.params;
  db.all('SELECT * FROM comentarios WHERE evaluacion_id = ? ORDER BY fecha DESC', [id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener comentarios' });
    res.json(rows);
  });
});

// Agregar comentario a una evaluación
app.post('/api/evaluacion/:id/comentarios', (req, res) => {
  const { id } = req.params;
  const { autor, comentario } = req.body;
  if (!comentario) return res.status(400).json({ error: 'Comentario requerido' });
  const fecha = new Date().toISOString();
  db.run('INSERT INTO comentarios (evaluacion_id, autor, comentario, fecha) VALUES (?, ?, ?, ?)', [id, autor || 'Gestor', comentario, fecha], function(err) {
    if (err) return res.status(500).json({ error: 'Error al guardar comentario' });
    res.json({ id: this.lastID, evaluacion_id: id, autor: autor || 'Gestor', comentario, fecha });
  });
});

// Backup/exportación de datos
app.get('/api/backup', (req, res) => {
  const result = {};
  db.all('SELECT * FROM evaluaciones', [], (err, evaluaciones) => {
    if (err) return res.status(500).json({ error: 'Error al obtener evaluaciones' });
    result.evaluaciones = evaluaciones.map(ev => ({ ...ev, competencias: JSON.parse(ev.competencias || '[]') }));
    db.all('SELECT * FROM cursos', [], (err2, cursos) => {
      if (err2) return res.status(500).json({ error: 'Error al obtener cursos' });
      result.cursos = cursos;
      db.all('SELECT * FROM comentarios', [], (err3, comentarios) => {
        if (err3) return res.status(500).json({ error: 'Error al obtener comentarios' });
        result.comentarios = comentarios;
        res.setHeader('Content-Disposition', 'attachment; filename=backup_ucorp.json');
        res.setHeader('Content-Type', 'application/json');
        res.json(result);
      });
    });
  });
});

// Crear tabla de usuarios si no existe
const createUsuariosTable = () => {
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    email TEXT UNIQUE,
    rol TEXT,
    activo INTEGER DEFAULT 1,
    fecha_creacion TEXT
  )`);
};
createUsuariosTable();

// Listar usuarios
app.get('/api/usuarios', (req, res) => {
  db.all('SELECT * FROM usuarios', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener usuarios' });
    res.json(rows);
  });
});

// Crear usuario
app.post('/api/usuarios', (req, res) => {
  const { nombre, email, rol } = req.body;
  if (!nombre || !email || !rol) return res.status(400).json({ error: 'Faltan campos obligatorios' });
  const fecha_creacion = new Date().toISOString();
  db.run('INSERT INTO usuarios (nombre, email, rol, fecha_creacion) VALUES (?, ?, ?, ?)', [nombre, email, rol, fecha_creacion], function(err) {
    if (err) return res.status(500).json({ error: 'Error al crear usuario' });
    res.json({ id: this.lastID });
  });
});

// Editar usuario
app.put('/api/usuario/:id', (req, res) => {
  const { nombre, email, rol, activo } = req.body;
  const { id } = req.params;
  if (!nombre || !email || !rol) return res.status(400).json({ error: 'Faltan campos obligatorios' });
  db.run('UPDATE usuarios SET nombre = ?, email = ?, rol = ?, activo = ? WHERE id = ?', [nombre, email, rol, activo ? 1 : 0, id], function(err) {
    if (err) return res.status(500).json({ error: 'Error al actualizar usuario' });
    if (this.changes === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ success: true });
  });
});

// Eliminar usuario
app.delete('/api/usuario/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM usuarios WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: 'Error al eliminar usuario' });
    if (this.changes === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
}); 