import React from "react";
import { Typography, Box, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Logout } from "@mui/icons-material";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import BtnCerrarSesion from "../../components/BtnCerrarSesion";

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

      {/* Botón Volver solo para superadmin */}
      {userRole === "superadmin" && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, px: 4 }}>
          <Button
            onClick={handleIrAtras}
            variant="contained"
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
              "&:hover": { backgroundColor: "#4f7db2ff" },
            }}
          >
            Volver
          </Button>
        </Box>
      )}

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
            Portal Empleados
          </Typography>

          <Button
            onClick={handleIrALicencias}
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
            Solicitar Licencia
          </Button>

          <Button
            onClick={handleIrARecibos}
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
            Mis Recibos de Sueldo
          </Button>

          <Button
            onClick={handleIrAlTablon}
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
            Tablón de Novedades
          </Button>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};
