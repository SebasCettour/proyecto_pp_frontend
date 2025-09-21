import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Container,
  TextField,
  Modal,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";

const EditarUsuario: React.FC = () => {
  const [dni, setDni] = useState("");
  const [usuario, setUsuario] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editando, setEditando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/usuario/usuario-dni/${dni}`
      );
      if (!response.ok) throw new Error("Usuario no encontrado");
      const user = await response.json();
      setUsuario(user);
      setOpen(true);
    } catch (err: any) {
      setError(err.message || "Error al buscar usuario");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  const handleEditar = async () => {
    setEditando(true);
    setError(null);
    setMensaje(null);
    try {
      const response = await fetch(
        `http://localhost:4000/api/usuario/editar-usuario-dni/${usuario.Numero_Documento}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(usuario),
        }
      );
      if (!response.ok) throw new Error("No se pudo editar el usuario");
      setMensaje("Usuario editado correctamente");
      setOpen(false);
    } catch (err: any) {
      setError(err.message || "Error al editar usuario");
    } finally {
      setEditando(false);
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

      {/* Botón Volver */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, px: 4 }}>
        <Button
          component={Link}
          to="/gestion-usuarios"
          variant="outlined"
          sx={{
            backgroundColor: "#1976d2",
            color: "#fff",
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontFamily: "Tektur, sans-serif",
            fontWeight: 600,
            letterSpacing: 2,
            fontSize: 18,
            textTransform: "none",
            "&:hover": { backgroundColor: "#115293" },
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
          alignItems: "center",
        }}
      >
        <Box
          component="form"
          onSubmit={handleBuscar}
          sx={{
            backgroundColor: "white",
            borderRadius: 2,
            p: 4,
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 4,
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
            }}
          >
            Buscar Usuario por DNI
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
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            sx={{ mb: 3 }}
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
      </Container>

      {/* Modal de edición */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Editar Usuario
          </Typography>
          <TextField
            label="Nombre"
            name="Apellido_Nombre"
            value={usuario?.Apellido_Nombre || ""}
            onChange={handleChange}
          />
          <TextField
            label="Email"
            name="Correo_Electronico"
            value={usuario?.Correo_Electronico || ""}
            onChange={handleChange}
          />
          <TextField
            label="Cargo"
            name="Cargo"
            value={usuario?.Cargo || ""}
            onChange={handleChange}
          />
          {/* Agrega más campos según lo que quieras editar */}
          <Button
            variant="contained"
            onClick={handleEditar}
            disabled={editando}
          >
            {editando ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </Box>
      </Modal>

      <Footer />
    </Box>
  );
};

export default EditarUsuario;
