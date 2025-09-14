import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import Footer from "../../components/Footer";

export const SuperAdminView: React.FC = () => {
  const navigate = useNavigate();

  // Funciones de navegación
  const handleIrAEmpleados = () => navigate("/empleados");
  const handleIrAContador = () => navigate("/contadores");
  const handleIrARRHH = () => navigate("/rrhh-principal");
  const handleCerrarSesion = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#C0C0C0",
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
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontFamily: "Tektur, sans-serif",
            fontWeight: 700,
            color: "#333",
            marginLeft: "10px",
            userSelect: "none",
          }}
        >
          <span style={{ color: "#CC5500" }}>360</span>
          <span style={{ color: "#ffffff" }}>Sueldos</span>
        </Typography>
      </Box>

      {/* Botón Cerrar Sesión */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", px: 4, mt: 4 }}>
        <Button
          onClick={handleCerrarSesion}
          variant="contained"
          sx={{
            backgroundColor: "#1565C0",
            color: "#ffffff",
            width: 220,
            letterSpacing: 2,
            fontSize: 18,
            borderRadius: 3,
            fontFamily: "Tektur, sans-serif",
            fontWeight: 500,
            textTransform: "none",
            "&:hover": { backgroundColor: "#0D47A1" },
          }}
        >
          Cerrar Sesión
        </Button>
      </Box>

      <Typography
        variant="h1"
        sx={{
          textAlign: "center",
          fontFamily: "Tektur, sans-serif",
          fontWeight: 600,
          fontSize: 50,
          color: "#333",
          letterSpacing: 3,
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
          justifyContent: "center",
          gap: 2,
          px: 4,
        }}
      >
        <Button
          onClick={handleIrAContador}
          variant="contained"
          sx={{
            backgroundColor: "#4c77afff",
            color: "#fff",
            width: 350,
            height: 60,
            fontSize: 20,
            fontWeight: "bold",
            letterSpacing: 2,
            borderRadius: 2,
            "&:hover": { backgroundColor: "#0a386fff" },
          }}
        >
          Contadores
        </Button>
        <Button
          onClick={handleIrAEmpleados}
          variant="contained"
          sx={{
            backgroundColor: "#4c77afff",
            color: "#fff",
            width: 350,
            height: 60,
            fontSize: 20,
            fontWeight: "bold",
            letterSpacing: 2,
            borderRadius: 2,
            "&:hover": { backgroundColor: "#0a386fff" },
          }}
        >
          Empleados
        </Button>

        <Button
          onClick={handleIrARRHH}
          variant="contained"
          sx={{
            backgroundColor: "#4c77afff",
            color: "#fff",
            width: 350,
            height: 60,
            fontSize: 20,
            fontWeight: "bold",
            letterSpacing: 2,
            borderRadius: 2,
            "&:hover": { backgroundColor: "#0a386fff" },
          }}
        >
          Recursos Humanos
        </Button>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export {};
