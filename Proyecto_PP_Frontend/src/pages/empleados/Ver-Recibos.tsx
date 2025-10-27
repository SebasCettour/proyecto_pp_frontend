import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  InputAdornment,
  TextField,
  Modal,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import MenuUsuario from "../../components/MenuUsuario";

// Simulación de recibos de sueldo
const recibos = [
  {
    id: 1,
    mes: "Julio",
    anio: 2025,
    monto: "$250.000",
    pdfUrl: "/recibos/recibo_julio_2025.pdf",
  },
  {
    id: 2,
    mes: "Junio",
    anio: 2025,
    monto: "$248.000",
    pdfUrl: "/recibos/recibo_junio_2025.pdf",
  },
  {
    id: 3,
    mes: "Mayo",
    anio: 2025,
    monto: "$245.000",
    pdfUrl: "/recibos/recibo_mayo_2025.pdf",
  },
];

export default function RecibosSueldo() {
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
        backgroundImage: "url('/fondo.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
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
          component={Link}
          to="/empleados"
          variant="outlined"
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
          }}
        >
          Volver
        </Button>
      </Box>

      <Typography
        component="h1"
        variant="h4"
        sx={{
          mb: 4,
          fontFamily: "Tektur, sans-serif",
          fontWeight: 600,
          color: "#333",
          textAlign: "center",
        }}
      >
        Ver y descargar Recibos de Sueldo
      </Typography>

      {/* Tabla de recibos */}
      <Box
        sx={{
          px: 4,
          py: 4,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <TableContainer
          component={Paper}
          sx={{
            width: "100%",
            maxWidth: 800,
            borderRadius: 2,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1565C0" }}>
                <TableCell
                  sx={{ color: "#fff", fontWeight: 700, width: "35%" }}
                >
                  Mes
                </TableCell>
                <TableCell
                  sx={{ color: "#fff", fontWeight: 700, width: "35%" }}
                >
                  Año
                </TableCell>
                <TableCell
                  sx={{ color: "#fff", fontWeight: 700, width: "30%" }}
                >
                  Acción
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recibos.map((recibo) => (
                <TableRow key={recibo.id}>
                  <TableCell>{recibo.mes}</TableCell>
                  <TableCell>{recibo.anio}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      href={recibo.pdfUrl}
                      download
                      sx={{
                        textTransform: "none",
                        fontFamily: "Tektur, sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      Descargar PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: "auto" }}>
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
                    <IconButton
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
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
    </Box>
  );
}
