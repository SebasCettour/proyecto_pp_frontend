import React from "react";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

const Historiales: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url('/fondo.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      <BackButton to="/contadores" />

      <Container maxWidth="sm" sx={{ mt: 4, mb: 6, flexGrow: 1 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography
            variant="h4"
            sx={{
              mb: 4,
              fontWeight: 700,
              color: "#1565C0",
              textAlign: "center",
            }}
          >
            Historiales
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => navigate("/historial")}
              sx={{
                py: 1.6,
                backgroundColor: "#1976d2",
                "&:hover": { backgroundColor: "#115293" },
              }}
            >
              Historial de Liquidaciones
            </Button>

            <Button
              variant="contained"
              onClick={() => navigate("/historial-salarios")}
              sx={{
                py: 1.6,
                backgroundColor: "#1976d2",
                "&:hover": { backgroundColor: "#115293" },
              }}
            >
              Historial de Salarios
            </Button>
          </Box>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
};

export default Historiales;