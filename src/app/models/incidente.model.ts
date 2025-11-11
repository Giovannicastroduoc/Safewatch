export interface Incidente {
  id: string;
  tipo: string;
  gravedad: 'Baja' | 'Media' | 'Alta';
  descripcion: string;
  fecha: string;
}
