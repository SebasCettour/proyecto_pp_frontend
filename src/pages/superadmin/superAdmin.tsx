import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import Footer from "../../components/Footer";

export const SuperAdminView: React.FC = () => {
  const navigate = useNavigate();

  // Funciones de navegación
  const handleIrARRHH = () => navigate("/rrhh-principal");
  const handleIrALicencias = () => navigate("/licencias");
  const handleIrAlTablon = () => navigate("/tablon");
  const handleIrALiquidacion = () => navigate("/liquidacion");
  const handleIrARecibos = () => navigate("/mis-recibos");
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

      {/* Botones de navegación centrados */}
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
          onClick={handleIrARRHH}
          variant="contained"
          sx={{
            backgroundColor: "#4CAF50",
            color: "#fff",
            width: 250,
            "&:hover": { backgroundColor: "#388E3C" },
          }}
        >
          RR. HH.
        </Button>

        <Button
          onClick={handleIrALicencias}
          variant="contained"
          sx={{
            backgroundColor: "#FF9800",
            color: "#fff",
            width: 250,
            "&:hover": { backgroundColor: "#F57C00" },
          }}
        >
          Licencias
        </Button>

        <Button
          onClick={handleIrAlTablon}
          variant="contained"
          sx={{
            backgroundColor: "#9C27B0",
            color: "#fff",
            width: 250,
            "&:hover": { backgroundColor: "#7B1FA2" },
          }}
        >
          Tablón
        </Button>

        <Button
          onClick={handleIrALiquidacion}
          variant="contained"
          sx={{
            backgroundColor: "#2196F3",
            color: "#fff",
            width: 250,
            "&:hover": { backgroundColor: "#1976D2" },
          }}
        >
          Liquidación
        </Button>

        <Button
          onClick={handleIrARecibos}
          variant="contained"
          sx={{
            backgroundColor: "#E91E63",
            color: "#fff",
            width: 250,
            "&:hover": { backgroundColor: "#C2185B" },
          }}
        >
          Recibos
        </Button>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export {};
