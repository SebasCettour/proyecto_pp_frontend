import React from "react";
import { Typography, Box, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import { Logout } from "@mui/icons-material";

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
        <Button
          onClick={handleCerrarSesion}
          startIcon={<Logout />}
          variant="outlined"
          sx={{
            position: "absolute",
            top: 24,
            right: 32,
            borderColor: "#fff",
            color: "#fff",
            fontWeight: 600,
            fontFamily: "Tektur, sans-serif",
            textTransform: "none",
            "&:hover": { backgroundColor: "#1565C0", borderColor: "#1565C0" },
          }}
        >
          Cerrar Sesión
        </Button>
      </Box>

      {/* Botón Volver solo para superadmin */}
      {userRole === "superadmin" && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, px: 4 }}>
          <Button
            onClick={handleIrAtras}
            variant="contained"
            sx={{
              backgroundColor: "#1976d2",
              color: "#fff",
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 600,
              fontSize: 18,
              textTransform: "none",
              "&:hover": { backgroundColor: "#115293" },
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
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};
