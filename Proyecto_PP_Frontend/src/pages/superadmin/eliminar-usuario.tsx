import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link as RouterLink } from "react-router-dom";
import Header from "../../components/Header";
import BackButton from "../../components/BackButton";
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

const buscarSchema = z.object({
  searchTerm: z.string().min(3, "Ingrese al menos 3 caracteres"),
});

type BuscarFormData = z.infer<typeof buscarSchema>;

interface Usuario {
  id: number;
  username: string;
  email: string;
  dni: string;
  role: string;
}

const EliminarUsuario: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BuscarFormData>({
    resolver: zodResolver(buscarSchema),
  });

  const handleBuscar = async (data: BuscarFormData) => {
    setError(null);
    setUsuario(null);
    setMensaje(null);
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/usuario/empleado-buscar/${encodeURIComponent(data.searchTerm)}`
      );
      if (!response.ok) throw new Error("Usuario no encontrado");
      const result = await response.json();
      
      // Si es un array, tomar el primero o mostrar error
      if (Array.isArray(result)) {
        if (result.length === 0) {
          throw new Error("No se encontraron usuarios");
        } else if (result.length > 1) {
          setError(`Se encontraron ${result.length} usuarios. Por favor, sea más específico.`);
          setIsLoading(false);
          return;
        }
        const user = result[0];
        setUsuario({
          id: user.id,
          username: `${user.apellido}, ${user.nombre}`,
          email: user.email || "No especificado",
          dni: user.dni,
          role: user.categoria || "No especificado",
        });
      } else {
        // Es un objeto único
        setUsuario({
          id: result.id,
          username: `${result.apellido}, ${result.nombre}`,
          email: result.email || "No especificado",
          dni: result.dni,
          role: result.categoria || "No especificado",
        });
      }
    } catch (err: any) {
      setError(err.message || "Error al buscar usuario");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!usuario || !usuario.dni) return;
    setEliminando(true);
    setError(null);
    setMensaje(null);
    try {
      const response = await fetch(
        `http://localhost:4000/api/usuario/eliminar-usuario-dni/${usuario.dni}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("No se pudo eliminar el usuario");
      setMensaje("Usuario eliminado correctamente");
      setUsuario(null);
      reset();
    } catch (err: any) {
      setError(err.message || "Error al eliminar usuario");
    } finally {
      setEliminando(false);
    }
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

      {/* Botón Volver */}
      <BackButton to="/gestion-usuarios" />

      {/* Contenido principal */}
      <Container
        maxWidth="lg"
        sx={{
          mt: 8,
          mb: 8,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography
          component="h1"
          variant="h4"
          sx={{
            mb: 12,
            fontFamily: "Tektur, sans-serif",
            fontWeight: 700,
            color: "#333",
            textAlign: "center",
            letterSpacing: 1,
            whiteSpace: "nowrap",
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          Baja de Usuario
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(handleBuscar)}
          sx={{
            backgroundColor: "white",
            borderRadius: 2,
            p: 4,
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography
            component="h2"
            variant="h5"
            sx={{
              mb: 4,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 600,
              color: "#333",
              textAlign: "center",
              letterSpacing: 0.5,
            }}
          >
            Buscar por DNI, Nombre o Apellido
          </Typography>
          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 3 }}>
              {error}
            </Alert>
          )}
          {mensaje && (
            <Alert severity="success" sx={{ width: "100%", mb: 3 }}>
              {mensaje}
            </Alert>
          )}

          <TextField
            fullWidth
            id="searchTerm"
            label="DNI, Nombre o Apellido"
            placeholder="Ej: 12345678, Juan, Pérez"
            {...register("searchTerm")}
            error={!!errors.searchTerm}
            helperText={errors.searchTerm?.message}
            disabled={isLoading}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{
              py: 1.5,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 600,
              fontSize: "1.1rem",
              borderRadius: 1,
              textTransform: "none",
              width: "100%",
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Buscar"
            )}
          </Button>
        </Box>

        {/* Mostrar usuario encontrado */}
        {usuario && (
          <Box
            sx={{
              backgroundColor: "#f5f5f5",
              borderRadius: 2,
              p: 4,
              boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontFamily: "Tektur, sans-serif",
                fontWeight: 600,
                color: "#1976d2",
                mb: 2,
              }}
            >
              Usuario encontrado:
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <b>Nombre de usuario:</b> {usuario.username}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <b>Email:</b> {usuario.email}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <b>DNI:</b> {usuario.dni}
            </Typography>
            <Typography sx={{ mb: 2 }}>
              <b>Rol:</b> {usuario.role}
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={handleEliminar}
              disabled={eliminando || !usuario || !usuario.dni}
              sx={{
                fontFamily: "Tektur, sans-serif",
                fontWeight: 600,
                fontSize: "1.1rem",
                borderRadius: 1,
                textTransform: "none",
                width: 220,
              }}
            >
              {eliminando ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Eliminar Usuario"
              )}
            </Button>
          </Box>
        )}
      </Container>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default EliminarUsuario;
