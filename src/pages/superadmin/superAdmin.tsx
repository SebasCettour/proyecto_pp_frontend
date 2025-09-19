import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import {
  Logout,
  People,
  Work,
  Badge,
  ManageAccounts,
} from "@mui/icons-material";
import { PersonAdd } from "@mui/icons-material";
import Footer from "../../components/Footer";

export const SuperAdminView: React.FC = () => {
  const navigate = useNavigate();

  // Funciones de navegación
  const handleIrAEmpleados = () => navigate("/empleados");
  const handleIrAContador = () => navigate("/contadores");
  const handleIrARRHH = () => navigate("/rrhh-principal");
  const handleIrAGestionUsuarios = () => navigate("/gestion-usuarios");
  const handleCerrarSesion = () => {
    localStorage.clear();
    navigate("/");
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
          py: 3,
          backgroundColor: "#000",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 4,
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontFamily: "Tektur, sans-serif",
            fontWeight: 700,
            color: "#fff",
            userSelect: "none",
          }}
        >
          <span style={{ color: "#CC5500" }}>360</span> Sueldos
        </Typography>

        {/* Botón Cerrar Sesión */}
        <Button
          onClick={handleCerrarSesion}
          startIcon={<Logout />}
          variant="outlined"
          sx={{
            borderColor: "#fff",
            color: "#fff",
            textTransform: "none",
            "&:hover": { backgroundColor: "#1565C0", borderColor: "#1565C0" },
          }}
        >
          Cerrar Sesión
        </Button>
      </Box>

      {/* Título */}
      <Typography
        variant="h3"
        sx={{
          textAlign: "center",
          fontFamily: "Tektur, sans-serif",
          fontWeight: 600,
          fontSize: { xs: 32, md: 48 },
          color: "#333",
          letterSpacing: 2,
          mt: 6,
          mb: 6,
        }}
      >
        Portal Administrador
      </Typography>

      {/* Botones de navegación */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          px: { xs: 2, md: 8 },
          mb: 6,
        }}
      >
        <Button
          onClick={handleIrAContador}
          startIcon={<Work />}
          variant="contained"
          sx={{
            width: "100%",
            maxWidth: 350,
            py: 2,
            fontSize: 18,
            fontWeight: "bold",
            borderRadius: 3,
            backgroundColor: "#4c77afff",
            "&:hover": { backgroundColor: "#0a386fff" },
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          }}
        >
          Contadores
        </Button>

        <Button
          onClick={handleIrAEmpleados}
          startIcon={<People />}
          variant="contained"
          sx={{
            width: "100%",
            maxWidth: 350,
            py: 2,
            fontSize: 18,
            fontWeight: "bold",
            borderRadius: 3,
            backgroundColor: "#4c77afff",
            "&:hover": { backgroundColor: "#0a386fff" },
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          }}
        >
          Empleados
        </Button>

        <Button
          onClick={handleIrARRHH}
          startIcon={<Badge />}
          variant="contained"
          sx={{
            width: "100%",
            maxWidth: 350,
            py: 2,
            fontSize: 18,
            fontWeight: "bold",
            borderRadius: 3,
            backgroundColor: "#4c77afff",
            "&:hover": { backgroundColor: "#0a386fff" },
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          }}
        >
          Recursos Humanos
        </Button>

        <Button
          onClick={handleIrAGestionUsuarios}
          startIcon={<ManageAccounts />}
          variant="contained"
          sx={{
            width: "100%",
            maxWidth: 350,
            py: 2,
            fontSize: 18,
            fontWeight: "bold",
            borderRadius: 3,
            backgroundColor: "#4c77afff",
            "&:hover": { backgroundColor: "#0a386fff" },
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          }}
        >
          Gestionar Usuarios
        </Button>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export {};
