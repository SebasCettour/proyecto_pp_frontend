import React from "react";
import { Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";

export const Contadores = () => {
  const navigate = useNavigate();

  const handleIrALiquidacion = () => {
    navigate("/liquidacion");
  };

  const handleCerrarSesion = () => {
    navigate("/");
  };

  const handleIrAtras = () => {
    navigate(-1);
  };

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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 4,
          }}
        >
          {/* Botón solo visible para superadmin */}
          {userRole === "superadmin" && (
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
          )}

          <Typography
            variant="h1"
            sx={{
              flexGrow: 1,
              textAlign: "center",
              fontFamily: "Tektur, sans-serif",
              fontWeight: 600,
              fontSize: 50,
              color: "#333",
              letterSpacing: 3,
            }}
          >
            Portal Contadores
          </Typography>

          {/* Botón de cerrar sesión */}
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

        <Box
          sx={{
            maxWidth: "1000px",
            mx: "auto",
            mt: 28,
            backgroundColor: "white",
            borderRadius: 2,
            p: 4,
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Botón Ir a Liquidación */}
          <Button
            onClick={handleIrALiquidacion}
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
            Ir a Liquidacion
          </Button>
        </Box>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};
