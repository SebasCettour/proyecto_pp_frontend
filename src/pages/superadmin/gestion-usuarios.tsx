import React from "react";
import { Box, Button, Typography, Container } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import { Edit, PersonAdd, PersonRemove } from "@mui/icons-material";

const GestionUsuarios: React.FC = () => {
  const navigate = useNavigate();
  const handleIrACrearNuevo = () => navigate("/crear-nuevo");
  const handleIrAEliminarUsuario = () => navigate("/eliminar-usuario");
  const handleIrAEditarUsuario = () => navigate("/editar-usuario");

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
          to="/superadmin"
          variant="contained"
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
          sx={{
            backgroundColor: "#fff",
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
            p: 5,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 3,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 600,
              color: "#333",
              textAlign: "center",
              letterSpacing: 2,
            }}
          >
            Gestión de Usuarios
          </Typography>

          <Button
            onClick={handleIrACrearNuevo}
            startIcon={<PersonAdd />}
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "#1976d2",
              color: "#fff",
              borderRadius: 2,
              py: 2,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 600,
              fontSize: 18,
              textTransform: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              "&:hover": { backgroundColor: "#115293" },
            }}
          >
            Alta Nuevo Usuario
          </Button>
          <Button
            onClick={handleIrAEditarUsuario}
            startIcon={<Edit />}
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "#1976d2",
              color: "#fff",
              borderRadius: 2,
              py: 2,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 600,
              fontSize: 18,
              textTransform: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              "&:hover": { backgroundColor: "#115293" },
            }}
          >
            Editar Usuario
          </Button>
          <Button
            onClick={handleIrAEliminarUsuario}
            startIcon={<PersonRemove />}
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "#1976d2",
              color: "#fff",
              borderRadius: 2,
              py: 2,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 600,
              fontSize: 18,
              textTransform: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              "&:hover": { backgroundColor: "#115293" },
            }}
          >
            Eliminar Usuario
          </Button>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default GestionUsuarios;
