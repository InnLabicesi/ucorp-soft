export interface Competencia {
  area: string;
  nivel_actual: number;
  interes: number;
  relevancia: number;
}

export interface Evaluacion {
  id: number;
  nombre: string;
  area: string;
  rol: string;
  experiencia: string;
  competencias: Competencia[];
  fecha_creacion: string;
  revisada: boolean;
  notas_gestor?: string;
  fecha_revision?: string;
  recomendaciones?: Recomendacion[];
}

export interface Curso {
  id: number;
  nombre: string;
  horas: number;
  profesores: string;
}

export interface Recomendacion {
  id: number;
  evaluacion_id: number;
  curso_id: number;
  prioridad: 'Alta' | 'Media' | 'Baja';
  justificacion: string;
  curso_nombre: string;
  horas: number;
  profesores: string;
} 