import React from "react";
import { Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";

export const Empleados = () => {
  const navigate = useNavigate();

  const handleIrARecibos = () => navigate("/mis-recibos");
  const handleIrALicencias = () => navigate("/solicitar-licencia");
  const handleCerrarSesion = () => navigate("/");
  const handleIrAlTablon = () => navigate("/ver-novedades");
  const handleIrAtras = () => navigate("/superadmin");

  const userRole = localStorage.getItem("role") || "";

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

      {/* H1 centrado */}
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

      {/* Contenedor de botones Atrás y Cerrar Sesión */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 4,
          mb: 4,
        }}
      >
        {userRole === "superadmin" ? (
          <Button
            onClick={handleIrAtras}
            variant="contained"
            sx={{
              backgroundColor: "#1565C0",
              color: "#ffffff",
              width: 220,
              letterSpacing: 3,
              fontSize: 20,
              borderRadius: 3,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 500,
              textTransform: "none",
              "&:hover": { backgroundColor: "#0D47A1" },
            }}
          >
            Atrás
          </Button>
        ) : (
          <Box sx={{ width: 220 }} /> // Espacio vacío si no es superadmin
        )}

        <Button
          onClick={handleCerrarSesion}
          variant="outlined"
          sx={{
            backgroundColor: "#1565C0",
            color: "#ffffff",
            width: 220,
            letterSpacing: 3,
            fontSize: 20,
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

      {/* Contenedor de los tres botones principales */}
      <Box
        sx={{
          maxWidth: "1000px",
          mx: "auto",
          mt: 4,
          backgroundColor: "white",
          borderRadius: 2,
          p: 4,
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
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
            mt: 5,
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
            mt: 5,
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
