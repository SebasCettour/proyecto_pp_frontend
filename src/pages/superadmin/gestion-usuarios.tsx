import React from "react";
import { Box, Button, Typography, Container } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import { PersonAdd } from "@mui/icons-material";

const GestionUsuarios: React.FC = () => {
  const navigate = useNavigate();
  const handleIrACrearNuevo = () => navigate("/crear-nuevo");

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
      </Box>

      {/* Botón Volver */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, px: 4 }}>
        <Button
          component={Link}
          to="/superadmin"
          variant="outlined"
          sx={{
            backgroundColor: "#1976d2",
            color: "#fff",
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontFamily: "Tektur, sans-serif",
            fontWeight: 600,
            letterSpacing: 2,
            fontSize: 18,
            textTransform: "none",
            "&:hover": { backgroundColor: "#115293" },
          }}
        >
          Volver
        </Button>
      </Box>

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
        <Button
          onClick={handleIrACrearNuevo}
          startIcon={<PersonAdd />}
          variant="contained"
          sx={{
            width: "100%",
            maxWidth: 350,
            py: 2,
            fontSize: 18,
            fontWeight: "bold",
            borderRadius: 3,
            backgroundColor: "#4c77afff",
            "&:hover": { backgroundColor: "#0a386fff" },
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          }}
        >
          Alta Nuevo Usuario
        </Button>
      </Container>

      <Footer />
    </Box>
  );
};

export default GestionUsuarios;
