import React from "react";
import { Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Logout } from "@mui/icons-material";
import Footer from "../../components/Footer";

export const Empleados = () => {
  const navigate = useNavigate();

  const handleIrARecibos = () => navigate("/mis-recibos");
  const handleIrALicencias = () => navigate("/solicitar-licencia");
  const handleCerrarSesion = () => {
    localStorage.clear();
    navigate("/");
  };
  const handleIrAlTablon = () => navigate("/ver-novedades");
  const handleIrAtras = () => navigate("/superadmin");

  const userRole = localStorage.getItem("role") || "";

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
            marginRight: 8,
            borderColor: "#fff",
            color: "#fff",
            textTransform: "none",
            "&:hover": { backgroundColor: "#1565C0", borderColor: "#1565C0" },
          }}
        >
          Cerrar Sesión
        </Button>
      </Box>

      {userRole === "superadmin" && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            px: 4,
            mt: 4,
          }}
        >
          <Button
            onClick={handleIrAtras}
            variant="contained"
            sx={{
              backgroundColor: "#1565C0",
              marginRight: 3,
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
      )}
      {/* Título */}
      <Typography
        variant="h1"
        sx={{
          mt: 6,
          mb: 4,
          textAlign: "center",
          fontFamily: "Tektur, sans-serif",
          fontWeight: 600,
          fontSize: 50,
          color: "#333",
          letterSpacing: 3,
        }}
      >
        Portal Empleados
      </Typography>

      {/* Contenedor de los tres botones principales */}
      <Box
        sx={{
          maxWidth: "1000px",
          mx: "auto",
          mt: 4,
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Button
          onClick={handleIrALicencias}
          variant="contained"
          fullWidth
          sx={{
            py: 1.5,
            letterSpacing: 2,
            fontFamily: "Tektur, sans-serif",
            width: 350,
            fontWeight: 600,
            fontSize: "1.1rem",
            borderRadius: 1,
            textTransform: "none",
          }}
        >
          Solicitar Licencia
        </Button>

        <Button
          onClick={handleIrARecibos}
          variant="contained"
          fullWidth
          sx={{
            py: 1.5,
            letterSpacing: 2,
            fontFamily: "Tektur, sans-serif",
            width: 350,
            fontWeight: 600,
            fontSize: "1.1rem",
            borderRadius: 1,
            textTransform: "none",
          }}
        >
          Ir a Mis Recibos de Sueldo
        </Button>

        <Button
          onClick={handleIrAlTablon}
          variant="contained"
          fullWidth
          sx={{
            py: 1.5,
            letterSpacing: 2,
            fontFamily: "Tektur, sans-serif",
            width: 350,
            fontWeight: 600,
            fontSize: "1.1rem",
            borderRadius: 1,
            textTransform: "none",
          }}
        >
          Tablón
        </Button>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: "auto" }}>
        <Footer />
      </Box>
    </Box>
  );
};
