import React, { useState } from "react";
import {
  Typography,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Logout, Settings } from "@mui/icons-material";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export const Empleados = () => {
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const userRole = localStorage.getItem("role") || "";
  const userName =
    localStorage.getItem("nombre") ||
    localStorage.getItem("username") ||
    "Usuario";

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleOpenModal = () => {
    setModalOpen(true);
    setAnchorEl(null);
    setMsg(null);
    setOldPassword("");
    setNewPassword("");
  };
  const handleCloseModal = () => setModalOpen(false);

  const handleChangePassword = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:4000/api/usuario/auth/cambiar-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: localStorage.getItem("username"), // <-- AGREGA ESTO
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
        setMsg(data.message || "Error al cambiar la contraseña");
      }
    } catch {
      setMsg("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleIrARecibos = () => navigate("/mis-recibos");
  const handleIrALicencias = () => navigate("/solicitar-licencia");
  const handleIrAMisLicencias = () => navigate("/mis-licencias");
  const handleCerrarSesion = () => {
    localStorage.clear();
    navigate("/");
  };
  const handleIrAlTablon = () => navigate("/ver-novedades");
  const handleIrAtras = () => navigate("/superadmin");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url('/fondo.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      <Header />

      {/* Menú Editar y Cerrar Sesión */}
      <Box
        sx={{
          position: "absolute",
          top: 35,
          right: 32,
          display: "flex",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <Typography
          sx={{ fontWeight: 600, fontFamily: "Tektur, sans-serif", mr: 1 }}
        >
          {userName}
        </Typography>
        <IconButton onClick={handleMenuOpen}>
          <Settings />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleOpenModal}>Cambiar Contraseña</MenuItem>
          <MenuItem onClick={handleCerrarSesion}>Cerrar Sesión</MenuItem>
        </Menu>
      </Box>

      {/* Botón Volver solo para superadmin */}
      {userRole === "superadmin" && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, px: 4 }}>
          <Button
            onClick={handleIrAtras}
            variant="contained"
            sx={{
              backgroundColor: "#1565C0",
              color: "#ffffff",
              width: 180,
              letterSpacing: 3,
              fontSize: 20,
              borderRadius: 3,
              mr: 5,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 500,
              textTransform: "none",
              "&:hover": { backgroundColor: "#4f7db2ff" },
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
            Portal Empleados
          </Typography>

          <Button
            onClick={handleIrALicencias}
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
            Solicitar Licencia
          </Button>
          <Button
            onClick={handleIrAMisLicencias}
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
            Mis Licencias
          </Button>

          <Button
            onClick={handleIrARecibos}
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
            Mis Recibos de Sueldo
          </Button>

          <Button
            onClick={handleIrAlTablon}
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
            Tablón de Novedades
          </Button>
        </Box>
      </Container>

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
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
          >
            <Button onClick={handleCloseModal} disabled={loading}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleChangePassword}
              disabled={loading || !oldPassword || !newPassword}
            >
              Cambiar
            </Button>
          </Box>
        </Box>
      </Modal>

      <Footer />
    </Box>
  );
};
