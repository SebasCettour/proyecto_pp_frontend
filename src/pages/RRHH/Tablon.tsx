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
  Modal,
  TextField,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
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

  // Estado para edición
  const [editOpen, setEditOpen] = useState(false);
  const [editNovedad, setEditNovedad] = useState<Novedad | null>(null);
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:4000/api/novedad/tablon")
      .then((res) => res.json())
      .then((data) => {
        setNovedades(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
      // Manejo de error opcional
    } finally {
      setDeleting(null);
    }
  };

  // Abrir modal de edición
  const handleEditOpen = (novedad: Novedad) => {
    setEditNovedad(novedad);
    setEditDescripcion(novedad.Descripcion);
    setEditOpen(true);
  };

  // Guardar edición
  const handleEditSave = async () => {
    if (!editNovedad) return;
    setEditLoading(true);
    try {
      await fetch(
        `http://localhost:4000/api/novedad/tablon/${editNovedad.Id_Novedad}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ descripcion: editDescripcion }),
        }
      );
      setNovedades((prev) =>
        prev.map((n) =>
          n.Id_Novedad === editNovedad.Id_Novedad
            ? { ...n, Descripcion: editDescripcion }
            : n
        )
      );
      setEditOpen(false);
    } catch {
      // Manejo de error opcional
    } finally {
      setEditLoading(false);
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
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              color: "#888",
              fontFamily: "Tektur, sans-serif",
              mt: 6,
            }}
          >
            No hay novedades publicadas.
          </Typography>
        ) : (
          novedades.map((novedad) => (
            <Card
              key={novedad.Id_Novedad}
              sx={{
                borderRadius: 4,
                backgroundColor: "#fff",
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-3px) scale(1.01)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
                },
                px: { xs: 1, sm: 3 },
                pt: 3,
                pb: 2,
                position: "relative",
                width: "100%",
                minHeight: 180,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "#1976d2",
                    mr: 2,
                    width: 48,
                    height: 48,
                    fontSize: 22,
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
                      fontSize: 18,
                    }}
                  >
                    RRHH
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#888",
                      fontFamily: "Tektur, sans-serif",
                      fontSize: 15,
                      display: "block",
                      mt: 0.5,
                    }}
                  >
                    {new Date(novedad.Fecha).toLocaleDateString("es-AR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Editar novedad">
                  <span>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleEditOpen(novedad)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Eliminar novedad">
                  <span>
                    <IconButton
                      color="error"
                      size="small"
                      disabled={deleting === novedad.Id_Novedad}
                      onClick={() => handleDelete(novedad.Id_Novedad)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {/* Render de la imagen si existe */}
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
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "Tektur, sans-serif",
                  color: "#222",
                  fontSize: 20,
                  mb: 1,
                  lineHeight: 1.6,
                  wordBreak: "break-word",
                }}
              >
                {novedad.Descripcion}
              </Typography>
            </Card>
          ))
        )}
      </Box>

      {/* Modal de edición */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 3,
            p: 4,
            minWidth: 400,
            maxWidth: "90vw",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 700,
              color: "#1976d2",
            }}
          >
            Editar Novedad
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={editDescripcion}
            onChange={(e) => setEditDescripcion(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setEditOpen(false)}
              disabled={editLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleEditSave}
              disabled={editLoading || !editDescripcion.trim()}
            >
              {editLoading ? "Guardando..." : "Guardar"}
            </Button>
          </Box>
        </Box>
      </Modal>

      <Footer />
    </Box>
  );
}
