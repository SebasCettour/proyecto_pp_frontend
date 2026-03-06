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
  Pagination,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Visibility, VisibilityOff } from "@mui/icons-material";
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
  const [periodoMes, setPeriodoMes] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const RECIBOS_POR_PAGINA = 6;

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

  const recibosFiltrados = recibos.filter((recibo) => {
    const fechaRecibo = new Date(recibo.FechaLiquidacion);

    if (periodoMes) {
      const [anioStr, mesStr] = periodoMes.split("-");
      const anio = Number(anioStr);
      const mes = Number(mesStr);

      if (
        fechaRecibo.getFullYear() !== anio ||
        fechaRecibo.getMonth() + 1 !== mes
      ) {
        return false;
      }

      return true;
    }

    return true;
  });

  const totalPages = Math.ceil(recibosFiltrados.length / RECIBOS_POR_PAGINA);

  const recibosPaginados = recibosFiltrados.slice(
    (currentPage - 1) * RECIBOS_POR_PAGINA,
    currentPage * RECIBOS_POR_PAGINA
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [periodoMes]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

      {/* separa menú del header */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          minHeight: { xs: 120, sm: 126, md: 130 }, // antes: 60/68/70
          mt: { xs: 1.5, sm: 2, md: 1.5 },
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

      <Box
        sx={{
          px: { xs: 1.5, sm: 5, md: 7 },
        }}
      >
        <BackButton to="/empleados" />
      </Box>

      <Typography
        component="h1"
        variant="h4"
        sx={{
          mb: { xs: 2.5, sm: 3, md: 2.5 },
          px: { xs: 1.5, sm: 2 },
          fontFamily: "Tektur, sans-serif",
          fontWeight: 700,
          color: "#1565C0",
          textAlign: "center",
          letterSpacing: { xs: 0.6, sm: 1, md: 1.4 },
          textShadow: "0 2px 8px rgba(21,101,192,0.08)",
          fontSize: { xs: "1.4rem", sm: "1.9rem", md: "2.2rem" },
          lineHeight: 1.2,
        }}
      >
        Ver y descargar Recibos de Sueldo
      </Typography>

      <Box
        sx={{
          px: { xs: 1.5, sm: 2.5, md: 4 },
          pt: { xs: 1.5, sm: 2.2, md: 1.2 },
          pb: { xs: 1.5, sm: 2.5, md: 2.5 },
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
          gap: { xs: 1.5, sm: 2 },
          width: "100%",
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error" variant="h6">
            {error}
          </Typography>
        ) : recibos.length === 0 ? (
          <Typography variant="h6" color="text.secondary" sx={{ textAlign: "center", px: 1 }}>
            No tienes recibos de sueldo disponibles
          </Typography>
        ) : (
          <>
            <Box
              sx={{
                width: "100%",
                maxWidth: 900,
                display: "flex",
                gap: { xs: 1.2, sm: 2 },
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TextField
                label="Período (mes/año)"
                type="month"
                value={periodoMes}
                onChange={(e) => setPeriodoMes(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  minWidth: { xs: "100%", sm: 220 },
                  bgcolor: "white",
                  borderRadius: 1,
                }}
              />
              <Button
                variant="contained"
                onClick={() => setPeriodoMes("")}
                disabled={!periodoMes}
                sx={{
                  height: { xs: 44, sm: 56 },
                  width: { xs: "100%", sm: "auto" },
                  px: 3,
                  borderRadius: 2,
                  textTransform: "none",
                  fontFamily: "Tektur, sans-serif",
                  fontWeight: 700,
                  boxShadow: "0 2px 8px rgba(21,101,192,0.16)",
                  background: "linear-gradient(135deg, #1976d2 0%, #1565C0 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #1565C0 0%, #0d47a1 100%)",
                  },
                  "&.Mui-disabled": {
                    background: "#b0bec5",
                    color: "#eceff1",
                  },
                }}
              >
                Limpiar filtros
              </Button>
            </Box>

            {recibosFiltrados.length === 0 ? (
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
                No se encontraron recibos para el filtro seleccionado
              </Typography>
            ) : isMobile ? (
              <Box sx={{ width: "100%", maxWidth: 900, display: "flex", flexDirection: "column", gap: 1.2 }}>
                {recibosPaginados.map((recibo) => (
                  <Paper
                    key={recibo.Id_Liquidacion}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Período
                    </Typography>
                    <Typography sx={{ fontWeight: 700, mb: 1 }}>
                      {formatDate(recibo.FechaLiquidacion)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Total
                    </Typography>
                    <Typography sx={{ fontWeight: 700, mb: 1.2 }}>
                      {formatCurrency(recibo.Total)}
                    </Typography>

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleDescargarPDF(recibo.Id_Liquidacion)}
                      sx={{
                        textTransform: "none",
                        fontFamily: "Tektur, sans-serif",
                        fontWeight: 600,
                        borderRadius: 2,
                      }}
                    >
                      Descargar PDF
                    </Button>
                  </Paper>
                ))}
              </Box>
            ) : (
              <TableContainer
                component={Paper}
                sx={{
                  width: "100%",
                  maxWidth: 900,
                  borderRadius: 2,
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  overflowX: "auto",
                }}
              >
                <Table sx={{ minWidth: 640 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#1565C0" }}>
                      <TableCell sx={{ color: "#fff", fontWeight: 700, minWidth: 210 }}>
                        Período
                      </TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: 700, minWidth: 170 }}>
                        Total
                      </TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: 700, minWidth: 190 }}>
                        Acción
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recibosPaginados.map((recibo) => (
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
                              minWidth: 150,
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

            {recibosFiltrados.length > 0 && totalPages > 1 && (
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 900,
                  display: "flex",
                  justifyContent: "center",
                  mt: 1,
                  overflowX: "auto",
                  py: 0.5,
                }}
              >
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => setCurrentPage(page)}
                  color="primary"
                  shape="rounded"
                  showFirstButton
                  showLastButton
                  size="small"
                />
              </Box>
            )}
          </>
        )}
      </Box>

      <Box sx={{ mt: "auto" }}>
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
                flexDirection: { xs: "column-reverse", sm: "row" },
                gap: 1.2,
                mt: 1.5,
              }}
            >
              <Button onClick={handleCloseModal} disabled={loadingPassword} sx={{ width: { xs: "100%", sm: "auto" } }}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleChangePassword}
                disabled={loadingPassword || !oldPassword || !newPassword}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                Cambiar
              </Button>
            </Box>
          </Box>
        </Modal>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbarSeverity}
            sx={{
              width: "100%",
              minWidth: { xs: "calc(100vw - 24px)", sm: 400 },
              fontSize: { xs: "0.95rem", sm: "1.05rem" },
              fontWeight: "bold",
              boxShadow: 6,
              "& .MuiAlert-message": {
                fontSize: { xs: "0.95rem", sm: "1.05rem" },
              },
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
