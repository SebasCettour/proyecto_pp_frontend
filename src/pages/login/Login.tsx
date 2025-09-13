import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import Footer from "../../components/Footer";
import { useAuthStore } from "../../stores/authStore";

const loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError("");

      console.log("Enviando datos de login:", data);

      const response = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const result = await response.json();
      console.log("Resultado del login:", result);
      console.log("Result.role:", result.role);
      console.log("Result.token:", result.token);

      if (!response.ok) {
        setError(result.error || "Error al iniciar sesión");
        return;
      }

      // Guardar token y rol en localStorage
      localStorage.setItem("token", result.token);
      localStorage.setItem("role", result.role);

      console.log("Token guardado:", result.token);
      console.log("Rol guardado:", result.role);

      // Actualizar el store de autenticación
      login({
        id: 1, // ID temporal, debería venir del backend
        email: data.username, // Usar username como email temporalmente
        nombre: data.username,
        apellido: "",
        rol: {
          id: 1,
          nombre: result.role as any,
          descripcion: "",
          permisos: [],
          activo: true,
          createdAt: "",
          updatedAt: ""
        },
        token: result.token
      });

      console.log("Store actualizado");

      // Redirigir según el rol
      if (result.role === "superadmin") {
        console.log("Redirigiendo a /superAdmin");
        navigate("/superAdmin");
      } else if (result.role === "rrhh") {
        console.log("Redirigiendo a /rrhh-principal");
        navigate("/rrhh-principal");
      } else if (result.role === "empleado") {
        console.log("Redirigiendo a /empleados");
        navigate("/empleados");
      } else if (result.role === "contador") {
        console.log("Redirigiendo a /contadores");
        navigate("/contadores");
      } else {
        console.log("Rol no reconocido, redirigiendo por defecto a /rrhh-principal");
        navigate("/rrhh-principal"); // Ruta por defecto
      }
    } catch (err) {
      setError("Error al iniciar sesión. Verifica tus credenciales.");
      console.error("Error en login:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#d9d6d6ff",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      {/* Encabezado */}
      <Box
        sx={{
          textAlign: "left",
          py: 4,
          backgroundColor: "#000000",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontFamily: "Tektur, sans-serif",
            fontWeight: 700,
            color: "#333",
            marginLeft: "10px",
          }}
        >
          <span style={{ color: "#CC5500" }}>360</span>
          <span style={{ color: "#ffffff" }}>Sueldos</span>
        </Typography>
      </Box>

      {/* Contenido principal */}
      <Container
        maxWidth="sm"
        sx={{
          mt: 8,
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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
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
            }}
          >
            Iniciar Sesión
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ width: "100%", mb: 3 }}>
            <Typography
              component="label"
              htmlFor="username"
              sx={{
                display: "block",
                mb: 1,
                fontFamily: "Tektur, sans-serif",
                fontWeight: 500,
                color: "#333",
              }}
            >
              Nombre de Usuario:
            </Typography>
            <TextField
              fullWidth
              id="username"
              type="text"
              {...register("username")}
              error={!!errors.username}
              helperText={errors.username?.message}
              disabled={isLoading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                },
              }}
            />
          </Box>

          <Box sx={{ width: "100%", mb: 4 }}>
            <Typography
              component="label"
              htmlFor="password"
              sx={{
                display: "block",
                mb: 1,
                fontFamily: "Tektur, sans-serif",
                fontWeight: 500,
                color: "#333",
              }}
            >
              Contraseña:
            </Typography>
            <TextField
              fullWidth
              id="password"
              type="password"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={isLoading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                },
              }}
            />
          </Box>

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
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Ingresar"}
          </Button>
        </Box>
      </Container>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default Login;
