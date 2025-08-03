export interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fechaContratacion: string;
  salario: number;
  departamentoId: number;
  rolId: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Departamento {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Rol {
  id: number;
  nombre: 'admin' | 'empleado' | 'rrhh' | 'contador';
  descripcion: string;
  permisos: string[];
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmpleadoConDetalles extends Empleado {
  departamento: Departamento;
  rol: Rol;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: Rol;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FormEmpleado {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fechaContratacion: string;
  salario: number;
  departamentoId: number;
  rolId: number;
}

export interface FormDepartamento {
  nombre: string;
  descripcion: string;
}

export interface FormRol {
  nombre: 'admin' | 'empleado' | 'rrhh' | 'contador';
  descripcion: string;
  permisos: string[];
} 