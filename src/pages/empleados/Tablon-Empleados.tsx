import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  Divider,
  CircularProgress,
  Avatar,
  IconButton,
  Tooltip,
  Fade,
  Chip,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

interface Novedad {
  Id_Novedad: number;
  Descripcion: string;
  Fecha: string;
  Id_Empleado: number;
  Imagen?: string;
}

export default function Tablon() {
  const [novedades, setNovedades] = useState<Novedad[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  // Función para cargar novedades
  const fetchNovedades = () => {
    setLoading(true);
    fetch("http://localhost:4000/api/novedad/tablon")
      .then((res) => res.json())
      .then((data) => {
        setNovedades(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchNovedades();
    const interval = setInterval(fetchNovedades, 10000); // cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  // Eliminar novedad
  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await fetch(`http://localhost:4000/api/novedad/tablon/${id}`, {
        method: "DELETE",
      });
      setNovedades((prev) => prev.filter((n) => n.Id_Novedad !== id));
    } catch {
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3e9f7 0%, #f8fafc 100%)",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      <Header />

      {/* Botón Volver */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, px: 4 }}>
        <Button
          component={RouterLink}
          to="/rrhh-principal"
          variant="contained"
          sx={{
            background: "linear-gradient(90deg, #1976d2 60%, #1565C0 100%)",
            color: "#fff",
            width: 180,
            letterSpacing: 3,
            fontSize: 20,
            borderRadius: 3,
            mr: 5,
            fontFamily: "Tektur, sans-serif",
            fontWeight: 600,
            textTransform: "none",
            boxShadow: "0 2px 8px rgba(21,101,192,0.15)",
            transition: "background 0.2s",
            "&:hover": {
              background: "linear-gradient(90deg, #115293 60%, #1976d2 100%)",
            },
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
          gap: 4,
          maxWidth: "700px",
          mx: "auto",
          mb: 6,
        }}
      >
        {loading ? (
          <CircularProgress sx={{ mx: "auto", mt: 6 }} />
        ) : novedades.length === 0 ? (
          <Fade in>
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                color: "#888",
                fontFamily: "Tektur, sans-serif",
                mt: 6,
                letterSpacing: 1,
              }}
            >
              No hay novedades publicadas.
            </Typography>
          </Fade>
        ) : (
          novedades.map((novedad) => (
            <Fade in key={novedad.Id_Novedad}>
              <Card
                sx={{
                  borderRadius: 5,
                  background:
                    "linear-gradient(120deg, #f5faff 60%, #e3e9f7 100%)",
                  boxShadow: "0 4px 24px rgba(25, 118, 210, 0.10)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px) scale(1.015)",
                    boxShadow: "0 8px 32px rgba(25, 118, 210, 0.18)",
                  },
                  px: 3,
                  pt: 2,
                  pb: 2,
                  position: "relative",
                  minHeight: 220,
                  maxWidth: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  border: "1.5px solid #e3e9f7",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: "#1976d2",
                      mr: 2,
                      width: 48,
                      height: 48,
                      fontWeight: 700,
                      fontSize: 28,
                      border: "2px solid #fff",
                      boxShadow: "0 2px 8px #1976d244",
                    }}
                  >
                    R
                  </Avatar>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        fontFamily: "Tektur, sans-serif",
                        color: "#1976d2",
                        fontSize: 20,
                        letterSpacing: 1,
                      }}
                    >
                      RRHH
                    </Typography>
                    <Chip
                      label={new Date(novedad.Fecha).toLocaleString()}
                      size="small"
                      sx={{
                        mt: 0.5,
                        background: "#e3e9f7",
                        color: "#1976d2",
                        fontFamily: "Tektur, sans-serif",
                        fontWeight: 500,
                        fontSize: 13,
                        letterSpacing: 1,
                        border: "1px solid #1976d2",
                      }}
                    />
                  </Box>
                  <Box sx={{ flexGrow: 1 }} />
                  <Tooltip title="Eliminar novedad" arrow>
                    <span>
                      <IconButton
                        color="error"
                        size="medium"
                        disabled={deleting === novedad.Id_Novedad}
                        onClick={() => handleDelete(novedad.Id_Novedad)}
                        sx={{
                          background: "#fff",
                          border: "1.5px solid #f44336",
                          ml: 1,
                          "&:hover": {
                            background: "#fbe9e7",
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
                <Divider sx={{ mb: 2, background: "#1976d2", opacity: 0.15 }} />
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: "Tektur, sans-serif",
                    color: "#222",
                    fontSize: 20,
                    mb: 1,
                    letterSpacing: 0.5,
                    lineHeight: 1.6,
                  }}
                >
                  {novedad.Descripcion}
                </Typography>
                {novedad.Imagen && (
                  <Box sx={{ mb: 2, textAlign: "center" }}>
                    <img
                      src={`http://localhost:4000/uploads/${novedad.Imagen}`}
                      alt="Imagen de la novedad"
                      style={{
                        maxWidth: "100%",
                        maxHeight: 250,
                        borderRadius: 10,
                        boxShadow: "0 2px 12px #1976d233",
                        marginBottom: 8,
                      }}
                    />
                  </Box>
                )}
              </Card>
            </Fade>
          ))
        )}
      </Box>

      <Footer />
    </Box>
  );
}
