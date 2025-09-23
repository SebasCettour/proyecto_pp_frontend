import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link as RouterLink } from "react-router-dom";
import Header from "../../components/Header";
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
  dni: z.string().min(7, "Ingrese un DNI válido"),
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
        `http://localhost:4000/api/usuario/usuario-dni/${data.dni}`
      );
      if (!response.ok) throw new Error("Usuario no encontrado");
      const user = await response.json();
      setUsuario({
        id: user.Id_Empleado,
        username: user.Apellido_Nombre,
        email: user.Correo_Electronico,
        dni: user.Numero_Documento,
        role: user.Cargo,
      });
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
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, px: 4 }}>
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
            mr: 5,
            fontFamily: "Tektur, sans-serif",
            fontWeight: 500,
            textTransform: "none",
          }}
        >
          Volver
        </Button>
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
            Buscar por DNI
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
            id="dni"
            label="DNI"
            {...register("dni")}
            error={!!errors.dni}
            helperText={errors.dni?.message}
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
