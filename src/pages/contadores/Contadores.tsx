import { Typography, Box, Button, Container } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Logout } from "@mui/icons-material";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

export const Contadores = () => {
  const navigate = useNavigate();

  const handleIrALiquidacion = () => navigate("/liquidacion");
  const handleCerrarSesion = () => {
    localStorage.clear();
    navigate("/");
  };
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
      <Header />

      {/* Botón Cerrar Sesión */}
      <Button
        onClick={handleCerrarSesion}
        startIcon={<Logout />}
        variant="outlined"
        sx={{
          position: "absolute",
          top: 32,
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

      {/* Botón Volver solo para superadmin */}
      {userRole === "superadmin" && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, px: 4 }}>
          <Button
            onClick={handleIrAtras}
            component={Link}
            to="/superadmin"
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
            Portal Contadores
          </Typography>

          <Button
            onClick={handleIrALiquidacion}
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
            Ir a Liquidación
          </Button>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};
