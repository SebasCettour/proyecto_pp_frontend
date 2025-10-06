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
  Fade,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DownloadIcon from "@mui/icons-material/Download";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

interface Novedad {
  Id_Novedad: number;
  Descripcion: string;
  Fecha: string;
  Id_Empleado: number;
  Imagen?: string;
  ArchivoAdjunto?: string;
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

  const formatearFecha = (fechaString: string) => {
    const fecha = new Date(fechaString);
    const ahora = new Date();

    const diffMs = ahora.getTime() - fecha.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Hace un momento";
    if (diffMins < 60)
      return `Hace ${diffMins} minuto${diffMins > 1 ? "s" : ""}`;
    if (diffHours < 24)
      return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;

    return fecha.toLocaleString("es-ES");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f0f2f5",
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
            background: "#1877f2",
            color: "#fff",
            width: 180,
            letterSpacing: 2,
            fontSize: 18,
            borderRadius: 8,
            mr: 5,
            fontFamily: "Segoe UI, Arial, sans-serif",
            fontWeight: 600,
            textTransform: "none",
            boxShadow: "0 2px 8px rgba(24,119,242,0.10)",
            transition: "background 0.2s",
            "&:hover": {
              background: "#165cbb",
            },
          }}
        >
          Volver
        </Button>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          px: 2,
          mt: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          maxWidth: "800px",
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
                color: "#65676b",
                fontFamily: "Segoe UI, Arial, sans-serif",
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
                  borderRadius: 10,
                  background: "#fff",
                  boxShadow: "0 2px 12px 0 rgba(0,0,0,0.08)",
                  px: 4,
                  pt: 2,
                  pb: 2,
                  position: "relative",
                  minHeight: 180,
                  maxWidth: "100%",
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid #e4e6eb",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  "&:hover": {
                    boxShadow: "0 4px 24px 0 rgba(24,119,242,0.13)",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: "#1877f2",
                      mr: 2,
                      width: 44,
                      height: 44,
                      fontWeight: 700,
                      fontSize: 22,
                      border: "2px solid #fff",
                      boxShadow: "0 2px 8px #1877f244",
                      fontFamily: "Segoe UI, Arial, sans-serif",
                    }}
                  >
                    R
                  </Avatar>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        fontFamily: "Segoe UI, Arial, sans-serif",
                        color: "#1877f2",
                        fontSize: 17,
                        letterSpacing: 0.5,
                      }}
                    >
                      RRHH
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#65676b",
                        fontFamily: "Segoe UI, Arial, sans-serif",
                        fontSize: 14,
                        display: "block",
                        mt: 0.5,
                      }}
                    >
                      {formatearFecha(novedad.Fecha)}
                    </Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1 }} />
                  <Tooltip title="Editar novedad">
                    <span>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleEditOpen(novedad)}
                        sx={{
                          mr: 1,
                          background: "#f0f2f5",
                          border: "1.5px solid #1976d2",
                          "&:hover": { background: "#e3e9f7" },
                        }}
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
                        sx={{
                          background: "#f0f2f5",
                          border: "1.5px solid #f44336",
                          "&:hover": { background: "#fbe9e7" },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
                <Divider sx={{ mb: 2, background: "#1877f2", opacity: 0.1 }} />

                {novedad.Imagen && (
                  <Box sx={{ mb: 2, textAlign: "center" }}>
                    <img
                      src={`http://localhost:4000/uploads/tablon_imgs/${novedad.Imagen}`}
                      alt="Imagen de la novedad"
                      style={{
                        width: "100%",
                        maxHeight: 400,
                        borderRadius: 12,
                        boxShadow: "0 2px 12px #1877f233",
                        marginBottom: 8,
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                )}

                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: "Segoe UI, Arial, sans-serif",
                    color: "#050505",
                    fontSize: 18,
                    mb: 1,
                    letterSpacing: 0.2,
                    lineHeight: 1.7,
                  }}
                >
                  {novedad.Descripcion}
                </Typography>

                {/* Mostrar archivo adjunto si existe */}
                {novedad.ArchivoAdjunto && (
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Button
                      component="a"
                      href={`http://localhost:4000/uploads/tablon_files/${novedad.ArchivoAdjunto}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      startIcon={<AttachFileIcon />}
                      endIcon={<DownloadIcon />}
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: 2,
                        fontFamily: "Segoe UI, Arial, sans-serif",
                        fontWeight: 600,
                        textTransform: "none",
                        backgroundColor: "#f0f2f5",
                        color: "#1976d2",
                        border: "1px solid #1976d2",
                        "&:hover": {
                          backgroundColor: "#e3e9f7",
                          borderColor: "#115293",
                        },
                      }}
                    >
                      Descargar archivo adjunto
                    </Button>
                  </Box>
                )}
              </Card>
            </Fade>
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
              fontFamily: "Segoe UI, Arial, sans-serif",
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
