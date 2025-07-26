import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const pasos = [
  'Información Personal',
  'Evaluación de Competencias',
  'Confirmación de Envío',
];

const areas = [
  'Ingeniería de Software',
  'Ciberseguridad',
  'Arquitectura',
  'Cloud',
  'DevOps',
  'Inteligencia Artificial',
  'Calidad',
  'Proyectos',
  'Otra',
];
const roles = [
  'Desarrollador/a',
  'Analista',
  'Tester',
  'Líder Técnico',
  'Gestor de Proyectos',
  'Arquitecto/a',
  'Ingeniero/a DevOps',
  'Especialista Cloud',
  'Otro',
];
const experiencia = [
  'Menos de 1 año',
  '1-2 años',
  '3-5 años',
  '6-10 años',
  'Más de 10 años',
];

const AREAS_COMPETENCIA = [
  'Gestión de Proyectos',
  'Análisis y Requerimientos',
  'Calidad y Testing',
  'Seguridad',
  'Arquitectura y Desarrollo',
  'Cloud Computing',
  'DevOps e Infraestructura',
  'Inteligencia Artificial',
];

const niveles = [
  { value: 1, label: 'Principiante' },
  { value: 2, label: 'Intermedio' },
  { value: 3, label: 'Avanzado' },
  { value: 4, label: 'Experto' },
];
const escala5 = [1, 2, 3, 4, 5];

const TOOLTIP_AREAS: Record<string, string> = {
  'Gestión de Proyectos': 'Capacidad para planificar, ejecutar y liderar proyectos tecnológicos.',
  'Análisis y Requerimientos': 'Habilidad para identificar, documentar y analizar necesidades del negocio.',
  'Calidad y Testing': 'Conocimientos en pruebas de software y aseguramiento de calidad.',
  'Seguridad': 'Dominio de prácticas y normativas de ciberseguridad.',
  'Arquitectura y Desarrollo': 'Diseño y construcción de soluciones tecnológicas robustas.',
  'Cloud Computing': 'Uso y gestión de servicios en la nube.',
  'DevOps e Infraestructura': 'Automatización, despliegue y operación de sistemas.',
  'Inteligencia Artificial': 'Aplicación de técnicas de IA y machine learning.',
};

const schema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  area: z.string().min(2, 'Selecciona un área'),
  rol: z.string().min(2, 'Selecciona un rol'),
  experiencia: z.string().min(2, 'Selecciona una experiencia'),
});

export default function FormularioEvaluacion() {
  const [paso, setPaso] = useState(0);
  const { register, handleSubmit, formState: { errors }, getValues, setValue } = useForm({
    mode: 'onTouched',
    defaultValues: {
      nombre: '',
      area: '',
      rol: '',
      experiencia: '',
    },
    resolver: zodResolver(schema),
  });

  const [competencias, setCompetencias] = useState(
    AREAS_COMPETENCIA.map(area => ({ area, nivel_actual: 1, interes: 3, relevancia: 3 }))
  );
  const [erroresComp, setErroresComp] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [idEvaluacion, setIdEvaluacion] = useState<number | null>(null);
  const [transicion, setTransicion] = useState(false);
  const [notas, setNotas] = useState('');

  const onSubmit = (data: any) => {
    setPaso(1);
  };

  const handleCompetenciaChange = (idx: number, field: string, value: number) => {
    setCompetencias(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const handlePaso2 = () => {
    // Validar que todas las competencias tengan valores
    const incompletos = competencias.some(c => !c.nivel_actual || !c.interes || !c.relevancia);
    if (incompletos) {
      setErroresComp('Por favor completa todos los campos de competencias.');
      return;
    }
    setErroresComp(null);
    setPaso(2);
  };

  const handleEnviar = async () => {
    setEnviando(true);
    setErrorEnvio(null);
    try {
      const datos = getValues();
      const res = await axios.post('/api/evaluacion', {
        ...datos,
        competencias,
      });
      setIdEvaluacion(res.data.id);
      setEnviado(true);
    } catch (err: any) {
      setErrorEnvio('Error al enviar la evaluación. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const handleNuevaEvaluacion = () => {
    setPaso(0);
    setEnviado(false);
    setIdEvaluacion(null);
    setCompetencias(AREAS_COMPETENCIA.map(area => ({ area, nivel_actual: 1, interes: 3, relevancia: 3 })));
    setErrorEnvio(null);
    setNotas('');
    setValue('nombre', '');
    setValue('area', '');
    setValue('rol', '');
    setValue('experiencia', '');
  };

  const cambiarPaso = (nuevoPaso: number) => {
    setTransicion(true);
    setTimeout(() => {
      setPaso(nuevoPaso);
      setTransicion(false);
    }, 200);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 mt-8">
      <div className="flex items-center mb-6">
        {pasos.map((p, i) => (
          <div key={i} className="flex-1 flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${i <= paso ? 'bg-primary' : 'bg-secondary/30'}`}>{i + 1}</div>
            {i < pasos.length - 1 && <div className={`flex-1 h-1 ${i < paso ? 'bg-primary' : 'bg-secondary/30'}`}></div>}
          </div>
        ))}
      </div>
      <h2 className="text-xl font-bold mb-4 text-primary">{pasos[paso]}</h2>
      <div className={`transition-opacity duration-300 ${transicion ? 'opacity-0' : 'opacity-100'}`}>
        {paso === 0 && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" role="form" aria-label="Formulario de información personal">
            <div>
              <label htmlFor="nombre" className="block font-semibold mb-1">Nombre completo</label>
              <input
                id="nombre"
                type="text"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus-visible:ring-4"
                {...register('nombre', { required: 'El nombre es obligatorio' })}
                aria-required="true"
                aria-invalid={!!errors.nombre}
              />
              {errors.nombre && <span className="text-error text-sm" role="alert">{errors.nombre.message as string}</span>}
            </div>
            <div>
              <label htmlFor="area" className="block font-semibold mb-1">Área / Departamento</label>
              <select
                id="area"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus-visible:ring-4"
                {...register('area', { required: 'El área es obligatoria' })}
                aria-required="true"
                aria-invalid={!!errors.area}
              >
                <option value="">Selecciona un área</option>
                {areas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              {errors.area && <span className="text-error text-sm" role="alert">{errors.area.message as string}</span>}
            </div>
            <div>
              <label htmlFor="rol" className="block font-semibold mb-1">Rol actual</label>
              <select
                id="rol"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus-visible:ring-4"
                {...register('rol', { required: 'El rol es obligatorio' })}
                aria-required="true"
                aria-invalid={!!errors.rol}
              >
                <option value="">Selecciona un rol</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.rol && <span className="text-error text-sm" role="alert">{errors.rol.message as string}</span>}
            </div>
            <div>
              <label htmlFor="experiencia" className="block font-semibold mb-1">Años de experiencia</label>
              <select
                id="experiencia"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus-visible:ring-4"
                {...register('experiencia', { required: 'La experiencia es obligatoria' })}
                aria-required="true"
                aria-invalid={!!errors.experiencia}
              >
                <option value="">Selecciona una opción</option>
                {experiencia.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              {errors.experiencia && <span className="text-error text-sm" role="alert">{errors.experiencia.message as string}</span>}
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2 rounded bg-primary text-white font-semibold hover:bg-primary/90 transition focus-visible:ring-4 focus-visible:ring-primary"
                aria-label="Siguiente paso"
              >
                Siguiente
              </button>
            </div>
          </form>
        )}
        {paso === 1 && (
          <div>
            <div className="space-y-6">
              {AREAS_COMPETENCIA.map((area, idx) => (
                <div key={area} className="bg-background rounded p-4 shadow-sm relative group">
                  <div className="font-semibold text-primary mb-2 flex items-center gap-2">
                    {area}
                    <span className="relative">
                      <svg className="w-4 h-4 text-secondary cursor-pointer" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                      <span className="absolute left-6 top-0 z-10 w-64 bg-white border border-secondary/30 text-xs text-secondary rounded shadow px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        {TOOLTIP_AREAS[area]}
                      </span>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nivel actual</label>
                      <select
                        className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                        value={competencias[idx].nivel_actual}
                        onChange={e => handleCompetenciaChange(idx, 'nivel_actual', Number(e.target.value))}
                      >
                        {niveles.map(n => (
                          <option key={n.value} value={n.value}>{n.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Interés en mejorar (1-5)</label>
                      <select
                        className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                        value={competencias[idx].interes}
                        onChange={e => handleCompetenciaChange(idx, 'interes', Number(e.target.value))}
                      >
                        {escala5.map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Relevancia para el rol (1-5)</label>
                      <select
                        className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                        value={competencias[idx].relevancia}
                        onChange={e => handleCompetenciaChange(idx, 'relevancia', Number(e.target.value))}
                      >
                        {escala5.map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {erroresComp && <div className="text-error text-sm mt-2">{erroresComp}</div>}
            <div className="flex justify-end mt-6">
              <button
                className="px-6 py-2 rounded bg-primary text-white font-semibold hover:bg-primary/90 transition"
                onClick={handlePaso2}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
        {paso === 2 && (
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            {!enviado ? (
              <>
                <div className="text-2xl text-primary font-bold mb-2">¿Confirmas el envío de tu autoevaluación?</div>
                <div className="text-secondary mb-6">Tu información será enviada al gestor universitario para su revisión.</div>
                {errorEnvio && <div className="text-error mb-2">{errorEnvio}</div>}
                <button
                  className="px-8 py-2 rounded bg-success text-white font-semibold hover:bg-success/90 transition disabled:opacity-50"
                  onClick={handleEnviar}
                  disabled={enviando}
                >
                  {enviando ? 'Enviando...' : 'Confirmar y Enviar'}
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center">
                  <svg className="w-16 h-16 text-success mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <div className="text-xl font-bold text-success mb-2">¡Evaluación enviada con éxito!</div>
                  <div className="text-secondary mb-4 text-center">El gestor universitario revisará tu evaluación y te contactará si es necesario.<br />ID de registro: <span className="font-mono text-primary">{idEvaluacion}</span></div>
                  <div className="w-full max-w-md mb-4">
                    <ol className="relative border-l-2 border-primary/30">
                      <li className="mb-6 ml-6">
                        <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-primary rounded-full ring-8 ring-background text-white">1</span>
                        <h3 className="font-semibold text-primary">Tu evaluación ha sido enviada</h3>
                        <p className="text-xs text-secondary">El gestor universitario la recibirá automáticamente.</p>
                      </li>
                      <li className="mb-6 ml-6">
                        <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-warning rounded-full ring-8 ring-background text-white">2</span>
                        <h3 className="font-semibold text-warning">Revisión por el gestor</h3>
                        <p className="text-xs text-secondary">El gestor analizará tus competencias y recomendaciones.</p>
                      </li>
                      <li className="ml-6">
                        <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-success rounded-full ring-8 ring-background text-white">3</span>
                        <h3 className="font-semibold text-success">Reporte a RR.HH.</h3>
                        <p className="text-xs text-secondary">Recursos Humanos recibirá el reporte final para plan de formación.</p>
                      </li>
                    </ol>
                  </div>
                  <button
                    className="px-6 py-2 rounded bg-primary text-white font-semibold hover:bg-primary/90 transition"
                    onClick={handleNuevaEvaluacion}
                  >
                    Nueva Evaluación
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-between mt-6">
        <button
          className="px-4 py-2 rounded bg-secondary text-white disabled:opacity-50"
          onClick={() => cambiarPaso(Math.max(0, paso - 1))}
          disabled={paso === 0 || transicion}
        >
          Anterior
        </button>
        {/* Botón siguiente dentro del formulario en paso 0 y 1 */}
        {paso > 0 && paso < 2 && (
          <button
            className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50"
            onClick={() => cambiarPaso(Math.min(pasos.length - 1, paso + 1))}
            disabled={paso === pasos.length - 1 || transicion}
          >
            Siguiente
          </button>
        )}
      </div>
    </div>
  );
} 