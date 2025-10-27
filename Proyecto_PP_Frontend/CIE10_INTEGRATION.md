# Integración del Buscador CIE-10

## Descripción
Se ha integrado un buscador de diagnósticos CIE-10 en el formulario de solicitud de licencia médica. Esta funcionalidad permite a los empleados buscar y seleccionar diagnósticos médicos oficiales cuando solicitan una licencia por enfermedad.

## Características

### Frontend
- **Búsqueda en tiempo real**: El buscador realiza búsquedas automáticas mientras el usuario escribe (con debounce de 500ms)
- **Autocompletado**: Muestra sugerencias de diagnósticos mientras se escribe
- **Validación**: El diagnóstico CIE-10 es obligatorio cuando el motivo de la licencia es "Enfermedad"
- **Interfaz intuitiva**: Muestra el código y descripción del diagnóstico seleccionado
- **Chip de selección**: Permite eliminar fácilmente el diagnóstico seleccionado

### Backend
- **API REST**: Endpoint `/api/cie10/search` para buscar diagnósticos
- **Integración con API externa**: Conecta con la API oficial de CIE-10
- **Autenticación**: Utiliza client credentials para acceder a la API
- **Límite de resultados**: Devuelve máximo 10 resultados por búsqueda

## Configuración

### Variables de Entorno (Backend)
```env
CIE10_CLIENT_ID=tu_client_id
CIE10_CLIENT_SECRET=tu_client_secret
```

### Configuración de API (Frontend)
El archivo `src/config/api.ts` contiene la configuración centralizada de endpoints.

## Uso

1. **Seleccionar motivo**: El usuario debe seleccionar "Enfermedad" como motivo de la licencia
2. **Buscar diagnóstico**: Aparecerá automáticamente el campo de búsqueda CIE-10
3. **Escribir búsqueda**: Escribir al menos 3 caracteres para iniciar la búsqueda
4. **Seleccionar diagnóstico**: Hacer clic en el diagnóstico deseado de la lista
5. **Confirmar selección**: El diagnóstico seleccionado aparecerá como un chip
6. **Eliminar selección**: Hacer clic en la X del chip para eliminar la selección

## Estructura de Datos

### DiagnosticoCIE10
```typescript
interface DiagnosticoCIE10 {
  codigo: string;      // Código CIE-10 (ej: "A00.0")
  descripcion: string; // Descripción del diagnóstico
}
```

## Validaciones

- **Obligatorio**: El diagnóstico CIE-10 es requerido cuando el motivo es "Enfermedad"
- **Mínimo de caracteres**: Se requieren al menos 3 caracteres para iniciar la búsqueda
- **Formato**: Los resultados se muestran como "Código - Descripción"

## Endpoints

### GET /api/cie10/search
**Parámetros:**
- `query` (string): Término de búsqueda (mínimo 3 caracteres)

**Respuesta:**
```json
[
  {
    "codigo": "A00.0",
    "descripcion": "Cólera debida a Vibrio cholerae 01, biotipo cholerae"
  }
]
```

## Consideraciones Técnicas

- **Debounce**: Las búsquedas se realizan con un delay de 500ms para evitar llamadas excesivas
- **Loading states**: Se muestra un indicador de carga durante las búsquedas
- **Error handling**: Manejo de errores para conexión y respuestas del servidor
- **Responsive**: El componente se adapta a diferentes tamaños de pantalla
