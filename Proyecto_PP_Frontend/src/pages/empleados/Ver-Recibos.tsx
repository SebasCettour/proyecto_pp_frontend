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
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import MenuUsuario from "../../components/MenuUsuario";
import BackButton from "../../components/BackButton";

interface Liquidacion {
  Id_Liquidacion: number;
  Id_Empleado: number;
  FechaLiquidacion: string;
  Total: number;
  Nombre: string;
  Apellido: string;
}

export default function RecibosSueldo() {
  const [recibos, setRecibos] = useState<Liquidacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Estados para Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "warning" | "info">("info");

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const name =
      localStorage.getItem("username") ||
      localStorage.getItem("nombre") ||
      "Usuario";
    setUserName(name);
  }, []);

  // Cargar liquidaciones del empleado
  useEffect(() => {
    const fetchRecibos = async () => {
      try {
        const token = localStorage.getItem("token");
        const documento = localStorage.getItem("documento");

        if (!documento) {
          setError("No se encontró el documento del empleado");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:4000/api/liquidacion/empleado/${documento}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setRecibos(data);
        } else {
          setError("Error al cargar los recibos");
        }
      } catch (err) {
        setError("Error de conexión con el servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchRecibos();
  }, []);

  const handleDescargarPDF = async (idLiquidacion: number) => {
    try {
      const token = localStorage.getItem("token");
      let response = await fetch(
        `http://localhost:4000/api/liquidacion/${idLiquidacion}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `recibo_${idLiquidacion}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else if (response.status === 404) {
        // Si no existe, intentar generarlo
        const genResponse = await fetch(
          `http://localhost:4000/api/liquidacion/${idLiquidacion}/generar-pdf`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (genResponse.ok) {
          // Esperar un momento para que se escriba el archivo
          await new Promise((resolve) => setTimeout(resolve, 800));
          // Intentar descargar de nuevo
          response = await fetch(
            `http://localhost:4000/api/liquidacion/${idLiquidacion}/pdf`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `recibo_${idLiquidacion}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            setSnackbarMessage("PDF generado y descargado correctamente");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
          } else {
            setSnackbarMessage("No se pudo descargar el PDF después de generarlo");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
          }
        } else {
          setSnackbarMessage("No se pudo generar el PDF");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        }
      } else {
        const errorData = await response.json();
        setSnackbarMessage(errorData.message || "Error al descargar el PDF");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage("Error de conexión al descargar el PDF");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", { year: "numeric", month: "long" });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
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
      <BackButton to="/empleados" />

      {/* Título principal unificado */}
      <Typography
        component="h1"
        variant="h4"
        sx={{
          mb: 4,
          fontFamily: "Tektur, sans-serif",
          fontWeight: 700,
          color: "#1565C0",
          textAlign: "center",
          letterSpacing: 1,
          textShadow: "0 2px 8px rgba(21,101,192,0.08)",
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
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error" variant="h6">
            {error}
          </Typography>
        ) : recibos.length === 0 ? (
          <Typography variant="h6" color="text.secondary">
            No tienes recibos de sueldo disponibles
          </Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              width: "100%",
              maxWidth: 900,
              borderRadius: 2,
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#1565C0" }}>
                  <TableCell
                    sx={{ color: "#fff", fontWeight: 700, width: "40%" }}
                  >
                    Período
                  </TableCell>
                  <TableCell
                    sx={{ color: "#fff", fontWeight: 700, width: "30%" }}
                  >
                    Total
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
                  <TableRow
                    key={recibo.Id_Liquidacion}
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" },
                      "&:hover": { backgroundColor: "#e3f2fd" },
                    }}
                  >
                    <TableCell>{formatDate(recibo.FechaLiquidacion)}</TableCell>
                    <TableCell>{formatCurrency(recibo.Total)}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleDescargarPDF(recibo.Id_Liquidacion)}
                        sx={{
                          textTransform: "none",
                          fontFamily: "Tektur, sans-serif",
                          fontWeight: 600,
                          borderRadius: 2,
                          boxShadow: "0 2px 8px rgba(21,101,192,0.08)",
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
        )}
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

        {/* Snackbar para notificaciones */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbarSeverity} 
            sx={{ 
              width: '100%',
              minWidth: '400px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              boxShadow: 6,
              '& .MuiAlert-message': {
                fontSize: '1.1rem'
              }
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

        <Footer />
      </Box>
    </Box>
  );
}
