# ucorp-soft

## Descripción

Sistema de evaluación y gestión de competencias técnicas para empleados universitarios. Permite a empleados autoevaluarse, a gestores analizar resultados y administrar cursos/usuarios, y a ejecutivos visualizar métricas globales.

---

## Arquitectura General

- **Frontend:** React + TypeScript, TailwindCSS, React Router, Axios, Recharts.
  - Rutas principales:
    - `/empleado`: Autoevaluación de competencias.
    - `/gestor`: Panel de gestor (dashboard, administración de cursos y usuarios, dashboard ejecutivo).
- **Backend:** Node.js + Express + SQLite3.
  - API RESTful para gestión de evaluaciones, cursos, usuarios, comentarios y reportes.
- **Base de datos:** SQLite (tablas: evaluaciones, cursos, recomendaciones, usuarios, comentarios).

---

## Instalación y Ejecución

### Requisitos
- Node.js >= 16
- npm

### Backend
```bash
cd backend
npm install
npm run dev # o npm start
```
El backend corre por defecto en `http://localhost:4000`.

#### Inicializar cursos (opcional)
```bash
node seedCursos.js
```

### Frontend
```bash
cd frontend
npm install
npm start
```
El frontend corre por defecto en `http://localhost:3000` y usa proxy al backend.

---

## Funcionalidades principales

### Empleado
- Autoevaluación de competencias técnicas.
- Envío y confirmación de evaluación.
- Visualización del estado del proceso.

### Gestor universitario
- Dashboard con métricas y análisis por área.
- Listado y detalle de evaluaciones.
- Revisión y marcaje de evaluaciones.
- Administración de usuarios y cursos.
- Descarga de backup JSON.

### Ejecutivo
- Dashboard ejecutivo con métricas globales y comparativas.

---

## Endpoints principales (Backend)

### Cursos
- `GET /api/cursos` — Listar cursos
- `POST /api/cursos` — Crear curso
- `PUT /api/curso/:id` — Editar curso
- `DELETE /api/curso/:id` — Eliminar curso

### Evaluaciones
- `POST /api/evaluacion` — Crear evaluación (autoevaluación empleado)
- `GET /api/evaluaciones` — Listar todas las evaluaciones
- `GET /api/evaluacion/:id` — Detalle de evaluación (incluye recomendaciones)
- `POST /api/evaluacion/:id/revisar` — Marcar como revisada y añadir notas gestor
- `GET /api/reporte/:id` — Descargar reporte TXT profesional

### Dashboards y estadísticas
- `GET /api/estadisticas` — Métricas generales
- `GET /api/gestor/dashboard` — Dashboard gestor (análisis por área)
- `GET /api/ejecutivo/dashboard` — Dashboard ejecutivo (métricas globales)

### Comentarios
- `GET /api/evaluacion/:id/comentarios` — Listar comentarios
- `POST /api/evaluacion/:id/comentarios` — Añadir comentario

### Usuarios
- `GET /api/usuarios` — Listar usuarios
- `POST /api/usuarios` — Crear usuario
- `PUT /api/usuario/:id` — Editar usuario
- `DELETE /api/usuario/:id` — Eliminar usuario

### Backup
- `GET /api/backup` — Descargar backup JSON de toda la base de datos

---

## Estructura de carpetas

```
ucorp/
├── backend/
│   ├── index.js         # Servidor Express y endpoints
│   ├── db.js            # Conexión y migración SQLite
│   ├── seedCursos.js    # Script de inicialización de cursos
│   └── package.json     # Dependencias backend
├── frontend/
│   ├── src/
│   │   ├── App.tsx      # Rutas principales
│   │   ├── pages/
│   │   │   ├── empleado/    # Vistas empleado
│   │   │   └── gestor/      # Vistas gestor y ejecutivo
│   ├── tailwind.config.js   # Configuración Tailwind
│   └── package.json         # Dependencias frontend
└── README.md            # (Este archivo)
```

---

## Dependencias principales

### Backend
- express
- cors
- body-parser
- sqlite3
- nodemon (dev)

### Frontend
- react, react-dom, react-router-dom
- typescript
- tailwindcss, autoprefixer, postcss
- axios
- recharts
- zod, react-hook-form

---

## Notas adicionales
- El sistema está pensado para ser ejecutado localmente o en entornos de desarrollo.
- La base de datos SQLite se crea automáticamente al iniciar el backend.
- El frontend y backend pueden ejecutarse en paralelo.
- Para personalizar estilos, editar `frontend/tailwind.config.js`.
- Para agregar cursos iniciales, ejecutar `node backend/seedCursos.js`.

---

## Autoría y licencia

Desarrollado por el equipo de SoftU. Licencia ISC.