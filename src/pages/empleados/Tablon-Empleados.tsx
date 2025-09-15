import React from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";

// Mensajes simulados
const mensajesRRHH = [
  {
    id: 1,
    titulo: "Nuevo beneficio para empleados",
    contenido:
      "A partir del lunes se podrá acceder a descuentos en gimnasios adheridos.",
    fecha: "03/08/2025",
  },
  {
    id: 2,
    titulo: "Entrega de kits escolares",
    contenido:
      "La inscripción para recibir el kit escolar finaliza el viernes a las 12 hs.",
    fecha: "01/08/2025",
  },
];

export default function TablonEmpleados() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      {/* Encabezado */}
      <Box
        sx={{
          py: 4,
          px: 2,
          backgroundColor: "#1c1c1c",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontFamily: "Tektur, sans-serif",
            fontWeight: 700,
            color: "#ffffff",
            userSelect: "none",
          }}
        >
          <span style={{ color: "#FF6B00" }}>360</span>{" "}
          <span style={{ color: "#ffffff" }}>Sueldos</span>
        </Typography>
      </Box>

      {/* Botón Volver */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", px: 3, mt: 4 }}>
        <Button
          onClick={() => navigate("/empleados")}
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

      {/* Tarjetas de mensajes */}
      <Box
        sx={{
          flexGrow: 1,
          px: 3,
          mt: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {mensajesRRHH.map((mensaje) => (
          <Card
            key={mensaje.id}
            sx={{
              borderRadius: 3,
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
              transition: "transform 0.2s ease",
              "&:hover": {
                transform: "scale(1.01)",
              },
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "Tektur, sans-serif",
                  color: "#333",
                  fontWeight: 600,
                  backgroundColor: "#478FED",
                  borderRadius: 2,
                  paddingLeft: 2,
                  letterSpacing: 2,
                }}
              >
                {mensaje.titulo}
              </Typography>

              <Divider sx={{ my: 1.5 }} />

              <Typography
                variant="body1"
                sx={{
                  fontFamily: "Tektur, sans-serif",
                  color: "#555",
                  lineHeight: 1.6,
                }}
              >
                {mensaje.contenido}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  textAlign: "right",
                  mt: 2,
                  color: "#999",
                  fontFamily: "Tektur, sans-serif",
                }}
              >
                Publicado el {mensaje.fecha}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Footer */}
      <Box sx={{ mt: "auto" }}>
        <Footer />
      </Box>
    </Box>
  );
}
