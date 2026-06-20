export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Subcategoria {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  categoriaId: number;
}

export interface CategoriaRequest {
  nombre: string;
  descripcion?: string;
}

export interface SubcategoriaRequest {
  nombre: string;
  descripcion?: string;
  categoriaId: number;
}
