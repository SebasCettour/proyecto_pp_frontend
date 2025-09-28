import React, { useState, useEffect, useRef } from "react";
import { Typography, Box, Button, Container, Fade } from "@mui/material";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import { Logout } from "@mui/icons-material";
import BtnCerrarSesion from "../../components/BtnCerrarSesion";
import Header from "../../components/Header";

// Recordatorio de agua cada 45 minutos
function WaterReminder() {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setVisible(true), 45 * 60 * 1000);

    // Mostrar el recordatorio manualmente
    const handler = () => setVisible(true);
    window.addEventListener("showWaterReminder", handler);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.removeEventListener("showWaterReminder", handler);
    };
  }, []);

  const handleClose = () => setVisible(false);

  return visible ? (
    <Fade in={visible}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e3f2fd",
          border: "2px solid #1976d2",
          borderRadius: 3,
          p: 2,
          mb: 3,
          boxShadow: "0 2px 8px #1976d233",
          maxWidth: 420,
          mx: "auto",
        }}
      >
        <LocalDrinkIcon sx={{ color: "#1976d2", fontSize: 36, mr: 2 }} />
        <Typography
          sx={{
            fontFamily: "Segoe UI, Arial, sans-serif",
            color: "#1976d2",
            fontWeight: 600,
            fontSize: 18,
            flex: 1,
          }}
        >
          ¡Hora de tomar agua! Mantente hidratado para sentirte mejor.
        </Typography>
        <Button
          onClick={handleClose}
          variant="contained"
          size="small"
          sx={{
            ml: 2,
            background: "#1976d2",
            color: "#fff",
            fontWeight: 600,
            textTransform: "none",
            borderRadius: 2,
            "&:hover": { background: "#115293" },
          }}
        >
          Listo
        </Button>
      </Box>
    </Fade>
  ) : null;
}

export const RRHHPrincipal = () => {
  const navigate = useNavigate();

  const handleIrANovedades = () => navigate("/novedades");
  const handleIrALicencias = () => navigate("/licencias");
  const handleCerrarSesion = () => {
    localStorage.clear();
    navigate("/");
  };
  const handleIrAlTablon = () => navigate("/tablon");
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
            component={Link}
            to="/superadmin"
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

      {/* WaterReminder */}
      <WaterReminder />

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
            Portal Recursos Humanos
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
            Gestionar Licencias
          </Button>

          <Button
            onClick={handleIrANovedades}
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
            Publicar Novedades
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

          <Button
            variant="outlined"
            sx={{ mx: "auto", mb: 2, display: "block" }}
            onClick={() => {
              // Forzamos el recordatorio a mostrarse
              const evt = new Event("showWaterReminder");
              window.dispatchEvent(evt);
            }}
          >
            Probar recordatorio de agua
          </Button>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};
