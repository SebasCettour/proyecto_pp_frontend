import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, Container } from "@mui/material";
import {
  People,
  Work,
  Badge,
  ManageAccounts,
} from "@mui/icons-material";
import Footer from "../../components/Footer";
import BtnCerrarSesion from "../../components/BtnCerrarSesion";
import Header from "../../components/Header";

export const SuperAdminView: React.FC = () => {
  const navigate = useNavigate();

  // Funciones de navegación
  const handleIrAEmpleados = () => navigate("/empleados");
  const handleIrAContador = () => navigate("/contadores");
  const handleIrARRHH = () => navigate("/rrhh-principal");
  const handleIrAGestionUsuarios = () => navigate("/gestion-usuarios");

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
      <BtnCerrarSesion />

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
            Portal Administrador
          </Typography>

          <Button
            onClick={handleIrAContador}
            startIcon={<Work />}
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
            Contadores
          </Button>

          <Button
            onClick={handleIrAEmpleados}
            startIcon={<People />}
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
            Empleados
          </Button>

          <Button
            onClick={handleIrARRHH}
            startIcon={<Badge />}
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
            Recursos Humanos
          </Button>

          <Button
            onClick={handleIrAGestionUsuarios}
            startIcon={<ManageAccounts />}
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
            Gestionar Usuarios
          </Button>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export {};
