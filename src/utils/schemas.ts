import { z } from 'zod';

export const empleadoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  fechaContratacion: z.string().min(1, 'La fecha de contratación es requerida'),
  salario: z.number().min(0, 'El salario debe ser mayor a 0'),
  departamentoId: z.number().min(1, 'Debe seleccionar un departamento'),
  rolId: z.number().min(1, 'Debe seleccionar un rol'),
});

export const departamentoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
});

export const rolSchema = z.object({
  nombre: z.string().refine((val) => ['admin', 'empleado', 'rrhh', 'contador'].includes(val), {
    message: 'Debe seleccionar un rol válido',
  }),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  permisos: z.array(z.string()).min(1, 'Debe seleccionar al menos un permiso'),
});

export const loginSchema = z.object({
  username: z.string().min(1, 'El nombre de usuario es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type EmpleadoFormData = z.infer<typeof empleadoSchema>;
export type DepartamentoFormData = z.infer<typeof departamentoSchema>;
export type RolFormData = z.infer<typeof rolSchema>;
export type LoginFormData = z.infer<typeof loginSchema>; 