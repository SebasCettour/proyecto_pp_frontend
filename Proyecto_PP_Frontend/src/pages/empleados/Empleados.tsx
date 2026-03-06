import React, { useState } from "react";
import {
  Typography,
  Box,
  Button,
  Container,
  Modal,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import MenuUsuario from "../../components/MenuUsuario";

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

    if (newPassword.length < 6 || newPassword.length > 20) {
      setMsg("La nueva contraseña debe tener entre 6 y 20 caracteres.");
      setLoading(false);
      return;
    }
    if (oldPassword === newPassword) {
      setMsg("La nueva contraseña no puede ser igual a la anterior.");
      setLoading(false);
      return;
    }

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

  const actionButtonSx = {
    backgroundColor: "#1976d2",
    color: "#fff",
    borderRadius: 2,
    py: { xs: 1.3, sm: 1.6, md: 2 },
    minHeight: { xs: 44, sm: 48 },
    fontFamily: "Tektur, sans-serif",
    fontWeight: 600,
    fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" },
    textTransform: "none",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    "&:hover": { backgroundColor: "#115293" },
  };

  return (
    <Box
      sx={{
        minHeight: "100svh",
        backgroundImage: "url('/fondo.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      <Header />

      {userRole === "superadmin" && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: { xs: 2.5, sm: 3.5, md: 4.5 },
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Button
            onClick={handleIrAtras}
            variant="contained"
            sx={{
              backgroundColor: "#1565C0",
              color: "#ffffff",
              width: { xs: "100%", sm: 170, md: 180 },
              maxWidth: 220,
              letterSpacing: { xs: 1, sm: 2, md: 3 },
              fontSize: { xs: 16, sm: 18, md: 20 },
              borderRadius: 3,
              mr: { xs: 0, sm: 1, md: 5 },
              py: { xs: 1, sm: 1.2 },
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

      {/* Contenedor para separar el menú del header */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          minHeight: { xs: 58, sm: 66, md: 76 },
          mt: { xs: 1.5, sm: 2, md: 2.5 },
        }}
      >
        <MenuUsuario
          userName={userName}
          anchorEl={anchorEl}
          handleMenuOpen={handleMenuOpen}
          handleMenuClose={handleMenuClose}
          handleOpenModal={handleOpenModal}
          handleCerrarSesion={handleCerrarSesion}
        />
      </Box>

      <Container
        maxWidth="sm"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: { xs: "flex-start", sm: "center" },
          alignItems: "center",
          mt: { xs: 1, sm: 2.5, md: 4 },
          mb: { xs: 3, sm: 6, md: 8 },
          px: { xs: 1.5, sm: 2.5 },
        }}
      >
        <Box
          sx={{
            backgroundColor: "#fff",
            borderRadius: { xs: 2, sm: 3 },
            boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
            p: { xs: 2, sm: 3.5, md: 5 },
            width: "100%",
            maxWidth: { xs: "100%", sm: 560 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: { xs: 1.8, sm: 2.4, md: 3 },
          }}
        >
          <Typography
            component="h1"
            sx={{
              mb: { xs: 1.5, sm: 2.5, md: 3 },
              fontFamily: "Tektur, sans-serif",
              fontWeight: 700,
              color: "#1565C0",
              textAlign: "center",
              letterSpacing: { xs: 0.5, sm: 1 },
              textShadow: "0 2px 8px rgba(21,101,192,0.08)",
              fontSize: { xs: "1.35rem", sm: "1.8rem", md: "2rem" },
              lineHeight: 1.2,
            }}
          >
            Portal Empleados
          </Typography>

          <Button onClick={handleIrALicencias} variant="contained" fullWidth sx={actionButtonSx}>
            Solicitar Licencia
          </Button>
          <Button onClick={handleIrAMisLicencias} variant="contained" fullWidth sx={actionButtonSx}>
            Mis Licencias
          </Button>
          <Button onClick={handleIrARecibos} variant="contained" fullWidth sx={actionButtonSx}>
            Mis Recibos de Sueldo
          </Button>
          <Button onClick={handleIrAlTablon} variant="contained" fullWidth sx={actionButtonSx}>
            Tablón de Novedades
          </Button>
        </Box>
      </Container>

      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: { xs: 2, sm: 3 },
            p: { xs: 2, sm: 3, md: 4 },
            width: { xs: "92vw", sm: 420 },
            maxWidth: "92vw",
            maxHeight: "85vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 1, fontSize: { xs: "1.05rem", sm: "1.25rem" } }}
          >
            Cambiar Contraseña
          </Typography>

          <TextField
            label="Contraseña Actual"
            type={showOld ? "text" : "password"}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            fullWidth
            size="small"
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showOld
                        ? "Ocultar contraseña actual"
                        : "Mostrar contraseña actual"
                    }
                    onClick={() => setShowOld((v) => !v)}
                    edge="end"
                  >
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
            size="small"
            inputProps={{ minLength: 6, maxLength: 20 }}
            autoComplete="new-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showNew
                        ? "Ocultar nueva contraseña"
                        : "Mostrar nueva contraseña"
                    }
                    onClick={() => setShowNew((v) => !v)}
                    edge="end"
                  >
                    {showNew ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {msg && (
            <Typography
              color={msg.includes("correctamente") ? "success.main" : "error.main"}
              sx={{ mt: 0.5, fontSize: { xs: "0.9rem", sm: "1rem" } }}
            >
              {msg}
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              flexDirection: { xs: "column-reverse", sm: "row" },
              gap: 1.2,
              mt: 1.5,
            }}
          >
            <Button
              type="button"
              onClick={handleCloseModal}
              disabled={loading}
              fullWidth={false}
              sx={{
                textTransform: "none",
                fontFamily: "Tektur, sans-serif",
                fontWeight: 600,
                borderRadius: 2,
                minHeight: 40,
                boxShadow: "0 2px 8px rgba(21,101,192,0.08)",
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="contained"
              onClick={handleChangePassword}
              disabled={loading || !oldPassword || !newPassword}
              sx={{
                textTransform: "none",
                fontFamily: "Tektur, sans-serif",
                fontWeight: 600,
                borderRadius: 2,
                minHeight: 40,
                boxShadow: "0 2px 8px rgba(21,101,192,0.08)",
                width: { xs: "100%", sm: "auto" },
              }}
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
