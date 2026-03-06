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
import Header from "../../components/Header";

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

      if (!response.ok) {
        setError(result.error || "Error al iniciar sesión");
        if (response.status === 403) {
          navigate("/forbidden");
          return;
        }
        return;
      }

      localStorage.setItem("token", result.token);
      localStorage.setItem("role", result.role);

      try {
        const payload = JSON.parse(atob(result.token.split(".")[1]));
        if (payload.username) {
          localStorage.setItem("username", payload.username);
        }
      } catch (e) {}

      if (result.user && result.user.nombre) {
        localStorage.setItem("nombre", result.user.nombre);
      }
      if (result.user && result.user.username) {
        localStorage.setItem("username", result.user.username);
      }

      if (result.user && result.user.documento) {
        localStorage.setItem("documento", result.user.documento);
      }

      if (result.user && result.user.idEmpleado) {
        localStorage.setItem("idEmpleado", result.user.idEmpleado.toString());
      }

      console.log("Token guardado:", result.token);
      console.log("Rol guardado:", result.role);

      login({
        id: 1,
        email: data.username,
        nombre: data.username,
        apellido: "",
        rol: {
          id: 1,
          nombre: result.role as any,
          descripcion: "",
          permisos: [],
          activo: true,
          createdAt: "",
          updatedAt: "",
        },
        token: result.token,
      });

      console.log("Store actualizado");

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
        console.log("Rol no reconocido, redirigiendo a /forbidden");
        navigate("/forbidden");
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
        minHeight: "100svh",
        backgroundImage: "url('/fondo.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      <Header />

      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "flex-start", sm: "center" },
          py: { xs: 2, sm: 4, md: 6 },
          px: { xs: 1.5, sm: 2.5 },
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", sm: 460 },
            mx: "auto",
            backgroundColor: "white",
            borderRadius: { xs: 2, sm: 2.5 },
            p: { xs: 2, sm: 3.5, md: 4 },
            boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            component="h1"
            sx={{
              mb: { xs: 2.5, sm: 3.5 },
              fontFamily: "Tektur, sans-serif",
              fontWeight: 600,
              color: "#333",
              fontSize: { xs: "1.35rem", sm: "1.8rem", md: "2rem" },
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            Iniciar Sesión
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2.5 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ width: "100%", mb: 2.5 }}>
            <Typography
              component="label"
              htmlFor="username"
              sx={{
                display: "block",
                mb: 1,
                fontFamily: "Tektur, sans-serif",
                fontWeight: 500,
                color: "#333",
                fontSize: { xs: "0.92rem", sm: "1rem" },
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
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 1.2 },
              }}
            />
          </Box>

          <Box sx={{ width: "100%", mb: 3 }}>
            <Typography
              component="label"
              htmlFor="password"
              sx={{
                display: "block",
                mb: 1,
                fontFamily: "Tektur, sans-serif",
                fontWeight: 500,
                color: "#333",
                fontSize: { xs: "0.92rem", sm: "1rem" },
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
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 1.2 },
              }}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{
              minHeight: 44,
              py: { xs: 1.1, sm: 1.4 },
              fontFamily: "Tektur, sans-serif",
              fontWeight: 600,
              fontSize: { xs: "0.98rem", sm: "1.05rem" },
              borderRadius: 1.2,
              textTransform: "none",
            }}
          >
            {isLoading ? <CircularProgress size={22} color="inherit" /> : "Ingresar"}
          </Button>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default Login;
