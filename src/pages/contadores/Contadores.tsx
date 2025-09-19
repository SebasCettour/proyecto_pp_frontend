import { Typography, Box, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Logout } from "@mui/icons-material";
import Footer from "../../components/Footer";

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
      <Box
        sx={{
          py: 3,
          backgroundColor: "#000",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 4,
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontFamily: "Tektur, sans-serif",
            fontWeight: 700,
            color: "#fff",
            userSelect: "none",
          }}
        >
          <span style={{ color: "#CC5500" }}>360</span> Sueldos
        </Typography>

        {/* Botón Cerrar Sesión */}
        <Button
          onClick={handleCerrarSesion}
          startIcon={<Logout />}
          variant="outlined"
          sx={{
            marginRight: 8,
            borderColor: "#fff",
            color: "#fff",
            textTransform: "none",
            "&:hover": { backgroundColor: "#1565C0", borderColor: "#1565C0" },
          }}
        >
          Cerrar Sesión
        </Button>
      </Box>

      {userRole === "superadmin" && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, px: 4 }}>
          <Button
            onClick={handleIrAtras}
            component={Link}
            to="/superadmin"
            variant="outlined"
            sx={{
              backgroundColor: "#1565C0",
              marginRight: 3,
              color: "#ffffff",
              width: 180,
              letterSpacing: 3,
              fontSize: 20,
              borderRadius: 3,
              mr: 5,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 500,
              textTransform: "none",
            }}
          >
            Volver
          </Button>
        </Box>
      )}

      {/* Título */}
      <Typography
        variant="h1"
        sx={{
          mt: 4,
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

      {/* Botón principal */}
      <Box
        sx={{
          maxWidth: "1000px",
          mx: "auto",
          mt: 8,
          mb: 4,
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Button
          onClick={handleIrALiquidacion}
          variant="contained"
          fullWidth
          sx={{
            py: 2,
            letterSpacing: 2,
            fontFamily: "Tektur, sans-serif",
            width: 350,
            fontWeight: 600,
            fontSize: 18,
            borderRadius: 3,
            textTransform: "none",
            backgroundColor: "#4c77afff",
            "&:hover": { backgroundColor: "#0a386fff" },
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          }}
        >
          Ir a Liquidacion
        </Button>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: "auto" }}>
        <Footer />
      </Box>
    </Box>
  );
};
