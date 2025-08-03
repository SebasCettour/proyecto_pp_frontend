import React from "react";
import { Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";

export const RRHHPrincipal = () => {
  const navigate = useNavigate();

  const handleIrANovedades = () => {
    navigate("/novedades");
  };
  const handleIrALicencias = () => {
    navigate("/licencias");
  };
  const handleCerrarSesion = () => {
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

      <Box
        sx={{
          flexGrow: 1,
          px: 4,
          mt: 8,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
          <Button
            onClick={handleCerrarSesion}
            variant="outlined"
            fullWidth
            sx={{
              backgroundColor: "#1565C0",
              color: "#ffffff",
              width: 220,
              letterSpacing: 3,
              fontSize: 20,
              borderRadius: 3,
              mr: 5,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 500,
              textTransform: "none",
              "&:hover": { backgroundColor: "#0D47A1" },
            }}
          >
            Cerrar Sesión
          </Button>
        </Box>
        <Box
          sx={{
            maxWidth: "1000px",
            mx: "auto",
            backgroundColor: "white",
            borderRadius: 2,
            p: 4,
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxSizing: "border-box",
            overflowWrap: "break-word",
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
              textAlign: "center",
            }}
          >
            Portal Recursos Humanos
          </Typography>

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
            Gestionar Licencias
          </Button>

          <Button
            onClick={handleIrANovedades}
            variant="contained"
            fullWidth
            sx={{
              mt: 5,
              letterSpacing: 2,
              py: 1.5,
              fontFamily: "Tektur, sans-serif",
              width: 350,
              fontWeight: 600,
              fontSize: "1.1rem",
              borderRadius: 1,
              textTransform: "none",
            }}
          >
            Publicar Novedades
          </Button>
        </Box>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};
