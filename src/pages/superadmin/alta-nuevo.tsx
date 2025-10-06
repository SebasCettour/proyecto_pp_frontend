import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link as RouterLink } from "react-router-dom";
import { z } from "zod";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  CircularProgress,
  MenuItem,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

// ✅ VALIDACIONES MEJORADAS
const schema = z.object({
  username: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras y espacios"),
  
  email: z.string()
    .email("Email inválido")
    .max(100, "El email no puede exceder 100 caracteres"),
  
  password: z.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(50, "La contraseña no puede exceder 50 caracteres"),
  
  roleId: z.string()
    .min(1, "Debe seleccionar un rol"),
  
  area: z.string()
    .min(2, "El área debe tener al menos 2 caracteres")
    .max(50, "El área no puede exceder 50 caracteres"),
  
  cargo: z.string()
    .min(2, "El cargo debe tener al menos 2 caracteres")
    .max(50, "El cargo no puede exceder 50 caracteres"),
  
  domicilio: z.string()
    .min(10, "El domicilio debe ser más específico")
    .max(150, "El domicilio no puede exceder 150 caracteres"),
  
  estadoCivil: z.string()
    .min(1, "Debe seleccionar un estado civil"),
  
  fechaContrato: z.string()
    .min(1, "La fecha de contrato es requerida")
    .refine((date) => {
      const today = new Date();
      const contractDate = new Date(date);
      return contractDate <= today;
    }, "La fecha de contrato no puede ser futura"),
  
  fechaNacimiento: z.string()
    .min(1, "La fecha de nacimiento es requerida")
    .refine((date) => {
      const today = new Date();
      const birthDate = new Date(date);
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18 && age <= 70;
    }, "La edad debe estar entre 18 y 70 años"),
  
  legajo: z.string()
    .min(1, "El legajo es requerido")
    .max(50, "El legajo no puede exceder 50 caracteres"),
  
  telefono: z.string()
    .min(8, "El teléfono debe tener al menos 8 dígitos")
    .max(20, "El teléfono no puede exceder 20 caracteres")
    .regex(/^[0-9+\-\s()]+$/, "Formato de teléfono inválido"),
  
  tipoDocumento: z.string()
    .min(1, "Debe seleccionar un tipo de documento"),
  
  numeroDocumento: z.string()
    .min(7, "El número de documento debe tener al menos 7 dígitos")
    .max(50, "El número de documento no puede exceder 50 caracteres")
    .regex(/^[0-9]+$/, "Solo se permiten números"),
});

type FormData = z.infer<typeof schema>;

const AltaNuevo: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    // ✅ FORMULARIO COMPLETAMENTE VACÍO
    defaultValues: {
      username: "",
      email: "",
      password: "",
      roleId: "",
      area: "",
      cargo: "",
      domicilio: "",
      estadoCivil: "",
      fechaContrato: "",
      fechaNacimiento: "",
      legajo: "",
      telefono: "",
      tipoDocumento: "",
      numeroDocumento: "",
    },
  });

  // ✅ FUNCIÓN DE ENVÍO MEJORADA
  const onSubmit = async (data: FormData) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    
    try {
      const response = await fetch("http://localhost:4000/api/usuarios/auth/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // Agregar token si es necesario para autenticación
          // "Authorization": `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...data,
          roleId: Number(data.roleId),
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // ✅ MANEJO DE ERRORES ESPECÍFICOS
        if (response.status === 409) {
          if (result.error.includes("documento")) {
            setError("El número de documento ya está registrado");
          } else if (result.error.includes("email")) {
            setError("El email ya está registrado");
          } else if (result.error.includes("username")) {
            setError("El nombre de usuario ya está registrado");
          } else {
            setError("Los datos ingresados ya existen en el sistema");
          }
        } else if (response.status === 400 && result.errors) {
          setError(result.errors.join(", "));
        } else {
          setError(result.error || "Error al crear usuario");
        }
      } else {
        // ✅ ÉXITO
        setSuccess("Usuario creado exitosamente");
        reset(); // Limpiar formulario
        
        // Redirigir después de 2 segundos para mostrar mensaje de éxito
        setTimeout(() => {
          navigate("/superadmin");
        }, 2000);
      }
    } catch (err) {
      console.error("Error de red:", err);
      setError("Error de conexión. Verifique que el servidor esté funcionando.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ RESETEAR FORMULARIO
  const handleReset = () => {
    reset();
    setError(null);
    setSuccess(null);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url('/fondo.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      <Header />

      {/* ✅ BOTONES DE NAVEGACIÓN MEJORADOS */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, px: 4 }}>
        <Button
          onClick={handleReset}
          variant="outlined"
          sx={{
            backgroundColor: "#f44336",
            color: "#ffffff",
            width: 180,
            letterSpacing: 2,
            fontSize: 16,
            borderRadius: 3,
            fontFamily: "Tektur, sans-serif",
            fontWeight: 500,
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#d32f2f",
            },
          }}
        >
          Limpiar Formulario
        </Button>
        
        <Button
          component={RouterLink}
          to="/superadmin"
          variant="outlined"
          sx={{
            backgroundColor: "#1565C0",
            color: "#ffffff",
            width: 180,
            letterSpacing: 3,
            fontSize: 20,
            borderRadius: 3,
            fontFamily: "Tektur, sans-serif",
            fontWeight: 500,
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#0d47a1",
            },
          }}
        >
          Volver
        </Button>
      </Box>

      {/* Contenido principal */}
      <Container
        maxWidth="md"
        sx={{
          mt: 4,
          mb: 8,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            backgroundColor: "white",
            borderRadius: 2,
            p: 4,
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            width: "100%",
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 4,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 600,
              color: "#333",
              textAlign: "center",
            }}
          >
            Alta Nuevo Usuario
          </Typography>

          {/* ✅ ALERTAS MEJORADAS */}
          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ width: "100%", mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
              width: "100%",
            }}
          >
            {/* Columna 1 */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Nombre y Apellido"
                placeholder="Ej: Juan Carlos Pérez"
                {...register("username")}
                error={!!errors.username}
                helperText={errors.username?.message}
                disabled={isLoading}
              />
              
              <TextField
                fullWidth
                label="Fecha de Nacimiento"
                type="date"
                {...register("fechaNacimiento")}
                error={!!errors.fechaNacimiento}
                helperText={errors.fechaNacimiento?.message}
                disabled={isLoading}
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                select
                fullWidth
                label="Tipo de Documento"
                {...register("tipoDocumento")}
                error={!!errors.tipoDocumento}
                helperText={errors.tipoDocumento?.message}
                disabled={isLoading}
                // ✅ SIN VALOR POR DEFECTO
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Seleccione tipo de documento...
                </MenuItem>
                <MenuItem value="DNI">DNI</MenuItem>
                <MenuItem value="Pasaporte">Pasaporte</MenuItem>
                <MenuItem value="LC">LC</MenuItem>
                <MenuItem value="LE">LE</MenuItem>
                <MenuItem value="Otro">Otro</MenuItem>
              </TextField>
              
              <TextField
                fullWidth
                label="Número de Documento"
                placeholder="Ej: 12345678"
                {...register("numeroDocumento")}
                error={!!errors.numeroDocumento}
                helperText={errors.numeroDocumento?.message}
                disabled={isLoading}
              />
              
              <TextField
                fullWidth
                label="Email"
                type="email"
                placeholder="ejemplo@correo.com"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isLoading}
              />
              
              <TextField
                fullWidth
                label="Teléfono"
                placeholder="Ej: +54 9 11 1234-5678"
                {...register("telefono")}
                error={!!errors.telefono}
                helperText={errors.telefono?.message}
                disabled={isLoading}
              />
              
              <TextField
                fullWidth
                label="Domicilio"
                placeholder="Calle, número, ciudad, provincia"
                {...register("domicilio")}
                error={!!errors.domicilio}
                helperText={errors.domicilio?.message}
                disabled={isLoading}
              />
              
              <TextField
                select
                fullWidth
                label="Estado Civil"
                {...register("estadoCivil")}
                error={!!errors.estadoCivil}
                helperText={errors.estadoCivil?.message}
                disabled={isLoading}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Seleccione estado civil...
                </MenuItem>
                <MenuItem value="Soltero/a">Soltero/a</MenuItem>
                <MenuItem value="Casado/a">Casado/a</MenuItem>
                <MenuItem value="Divorciado/a">Divorciado/a</MenuItem>
                <MenuItem value="Viudo/a">Viudo/a</MenuItem>
                <MenuItem value="Otro">Otro</MenuItem>
              </TextField>
            </Box>

            {/* Columna 2 */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Contraseña"
                type="password"
                placeholder="Mínimo 6 caracteres"
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isLoading}
              />
              
              <TextField
                select
                fullWidth
                label="Rol"
                {...register("roleId")}
                error={!!errors.roleId}
                helperText={errors.roleId?.message}
                disabled={isLoading}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Seleccione un rol...
                </MenuItem>
                <MenuItem value="1">Superadmin</MenuItem>
                <MenuItem value="2">RRHH</MenuItem>
                <MenuItem value="3">Contador</MenuItem>
                <MenuItem value="4">Empleado</MenuItem>
              </TextField>
              
              <TextField
                fullWidth
                label="Área"
                placeholder="Ej: Administración, Ventas, IT"
                {...register("area")}
                error={!!errors.area}
                helperText={errors.area?.message}
                disabled={isLoading}
              />
              
              <TextField
                fullWidth
                label="Cargo"
                placeholder="Ej: Gerente, Analista, Asistente"
                {...register("cargo")}
                error={!!errors.cargo}
                helperText={errors.cargo?.message}
                disabled={isLoading}
              />
              
              <TextField
                fullWidth
                label="Fecha de Contrato"
                type="date"
                {...register("fechaContrato")}
                error={!!errors.fechaContrato}
                helperText={errors.fechaContrato?.message}
                disabled={isLoading}
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                fullWidth
                label="Legajo"
                placeholder="Número de legajo"
                {...register("legajo")}
                error={!!errors.legajo}
                helperText={errors.legajo?.message}
                disabled={isLoading}
              />
            </Box>
          </Box>

          {/* ✅ BOTONES MEJORADOS */}
          <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
            <Button
              type="button"
              variant="outlined"
              fullWidth
              onClick={handleReset}
              disabled={isLoading}
              sx={{
                py: 1.5,
                fontFamily: "Tektur, sans-serif",
                fontWeight: 600,
                fontSize: "1rem",
                borderRadius: 1,
                textTransform: "none",
              }}
            >
              Limpiar
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{
                py: 1.5,
                fontFamily: "Tektur, sans-serif",
                fontWeight: 600,
                fontSize: "1.1rem",
                borderRadius: 1,
                textTransform: "none",
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Crear Usuario"
              )}
            </Button>
          </Box>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default AltaNuevo;
