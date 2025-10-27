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
  Modal,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DownloadIcon from "@mui/icons-material/Download";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import MenuUsuario from "../../components/MenuUsuario";

interface Novedad {
  Id_Novedad: number;
  Descripcion: string;
  Fecha: string;
  Id_Empleado: number;
  Imagen?: string;
  ArchivoAdjunto?: string;
  Nombre_Empleado?: string;
  Apellido_Empleado?: string;
}

export default function Tablon() {
  const [novedades, setNovedades] = useState<Novedad[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  // Estados para menú y cambio de contraseña
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    const name =
      localStorage.getItem("username") ||
      localStorage.getItem("nombre") ||
      "Usuario";
    setUserName(name);
  }, []);

  // Función para formatear fecha
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

  // Handlers para el menú
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleOpenModal = () => {
    setModalOpen(true);
    setAnchorEl(null);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setOldPassword("");
    setNewPassword("");
    setMsg(null);
  };
  const handleCerrarSesion = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // Cambiar contraseña desde el modal
  const handleChangePassword = async () => {
    setLoadingPassword(true);
    setMsg(null);
    try {
      const res = await fetch(
        "http://localhost:4000/api/usuario/auth/cambiar-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username:
              localStorage.getItem("username") ||
              localStorage.getItem("nombre") ||
              "",
            oldPassword,
            newPassword,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMsg("Contraseña cambiada correctamente");
        setTimeout(() => setModalOpen(false), 1200);
      } else {
        setMsg(data.error || data.message || "Error al cambiar la contraseña");
      }
    } catch {
      setMsg("Error de conexión");
    } finally {
      setLoadingPassword(false);
      setOldPassword("");
      setNewPassword("");
    }
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

      <MenuUsuario
        userName={userName}
        anchorEl={anchorEl}
        handleMenuOpen={handleMenuOpen}
        handleMenuClose={handleMenuClose}
        handleOpenModal={handleOpenModal}
        handleCerrarSesion={handleCerrarSesion}
      />

      {/* Botón Volver */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, px: 4 }}>
        <Button
          component={RouterLink}
          to="/empleados"
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

      {/* Feed */}
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
                    transform: "translateY(-2px) scale(1.01)",
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
                    {/* Iniciales */}
                    {(novedad.Nombre_Empleado?.[0] || "") + (novedad.Apellido_Empleado?.[0] || "")}
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
                      {/* Nombre completo */}
                      {(novedad.Nombre_Empleado || "") + " " + (novedad.Apellido_Empleado || "")}
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
      {/* Modal para cambiar contraseña */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
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
            minWidth: 350,
            maxWidth: "90vw",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Cambiar Contraseña
          </Typography>
          <TextField
            label="Contraseña Actual"
            type={showOld ? "text" : "password"}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowOld((v) => !v)} edge="end">
                    {showOld ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Nueva Contraseña"
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNew((v) => !v)} edge="end">
                    {showNew ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {msg && (
            <Typography
              color={
                msg.includes("correctamente") ? "success.main" : "error.main"
              }
              sx={{ mt: 1 }}
            >
              {msg}
            </Typography>
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              mt: 2,
            }}
          >
            <Button onClick={handleCloseModal} disabled={loadingPassword}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleChangePassword}
              disabled={loadingPassword || !oldPassword || !newPassword}
            >
              Cambiar
            </Button>
          </Box>
        </Box>
      </Modal>

      <Footer />
    </Box>
  );
}
