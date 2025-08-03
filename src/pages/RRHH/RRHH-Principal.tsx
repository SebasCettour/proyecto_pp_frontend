import React from "react";
import { Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const RRHHPrincipal = () => {
  const navigate = useNavigate();

  const handleIrANovedades = () => {
    navigate("/novedades");
  };
  const handleIrALicencias = () => {
    navigate("/licencias");
  };
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#C0C0C0" }}>
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

      {/* Contenedor */}
      <Box sx={{ px: 4, mt: 8, width: "100%" }}>
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
              mt: 2,
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
    </Box>
  );
};
