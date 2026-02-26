import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Chip,
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import { Settings, Visibility, VisibilityOff } from "@mui/icons-material";
import DownloadIcon from "@mui/icons-material/Download";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import BackButton from "../../components/BackButton";
import ReusableTablePagination from "../../components/ReusableTablePagination";
import useTablePagination from "../../hooks/useTablePagination";
import paginate from "../../utils/paginate";

interface Licencia {
  Id_Licencia: number;
  Nombre: string;
  Apellido: string;
  Documento: string;
  Motivo: string;
  Observaciones?: string;
  CertificadoMedico?: string;
  DiagnosticoCIE10_Codigo?: string;
  DiagnosticoCIE10_Descripcion?: string;
  Estado: "Pendiente" | "Aprobada" | "Rechazada";
  FechaSolicitud: string;
  FechaRespuesta?: string;
  MotivoRechazo?: string;
  Categoria?: string;
  FechaInicio?: string;
  FechaFin?: string;
  FechaReincorporacion?: string;
}

export default function GestionarLicencias() {
  const [licencias, setLicencias] = useState<Licencia[]>([]);
  const {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    resetPagination,
  } = useTablePagination();
  const [loading, setLoading] = useState(true);
  const [selectedLicencia, setSelectedLicencia] = useState<Licencia | null>(null);
  const [modalRespuestaOpen, setModalRespuestaOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "info" });
  const [respuesta, setRespuesta] = useState("");
  const [accion, setAccion] = useState<"Aprobada" | "Rechazada">("Aprobada");

  // Menú y cambio de contraseña
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [filtroEmpleado, setFiltroEmpleado] = useState("");
  const [filtroMotivo, setFiltroMotivo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");

  const userRole = localStorage.getItem("role") || "";
  const userName =
    localStorage.getItem("nombre") ||
    localStorage.getItem("username") ||
    "Usuario";

  // Cargar licencias pendientes
  useEffect(() => {
    fetchLicencias();
  }, []);

  const fetchLicencias = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:4000/api/licencias/pendientes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setLicencias(data);
        resetPagination();
      }
    } catch (error) {
      // Manejo de error
    } finally {
      setLoading(false);
    }
  };

  const handleResponder = (licencia: Licencia) => {
    setSelectedLicencia(licencia);
    setModalRespuestaOpen(true);
    setRespuesta("");
    setAccion("Aprobada");
  };

  const handleEnviarRespuesta = async () => {
    if (!selectedLicencia) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/api/licencias/responder/${selectedLicencia.Id_Licencia}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            estado: accion,
            motivoRechazo: accion === "Rechazada" ? respuesta : null,
          }),
        }
      );
      if (response.ok) {
        setSnackbar({
          open: true,
          message: `Licencia ${accion.toLowerCase()} exitosamente`,
          severity: "success",
        });
        fetchLicencias();
        setModalRespuestaOpen(false);
        setSelectedLicencia(null);
      } else {
        setSnackbar({
          open: true,
          message: "Error al responder la licencia",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error de conexión al responder la licencia",
        severity: "error",
      });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";

    const match = String(dateString).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      return new Date(year, month - 1, day).toLocaleDateString("es-ES");
    }

    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString("es-ES");
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return "warning";
      case "Aprobada":
        return "success";
      case "Rechazada":
        return "error";
      default:
        return "default";
    }
  };

  const toDateInputValue = (dateString: string) => {
    if (!dateString) return "";

    const match = String(dateString).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }

    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) return "";

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const motivosDisponibles = useMemo(() => {
    return Array.from(
      new Set(
        licencias
          .map((lic) => String(lic.Motivo || "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
  }, [licencias]);

  const rangoFechasInvalido =
    !!filtroFechaDesde &&
    !!filtroFechaHasta &&
    filtroFechaDesde > filtroFechaHasta;

  const filtroEmpleadoNormalizado = filtroEmpleado.trim();
  const filtroEmpleadoEsDni = /^\d+$/.test(filtroEmpleadoNormalizado);
  const filtroEmpleadoLetras = filtroEmpleadoNormalizado
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "").length;
  const filtroApellidoInvalido =
    !!filtroEmpleadoNormalizado && !filtroEmpleadoEsDni && filtroEmpleadoLetras < 3;

  const licenciasFiltradas = useMemo(() => {
    return licencias.filter((lic) => {
      if (filtroEmpleadoNormalizado) {
        if (filtroEmpleadoEsDni) {
          if (!String(lic.Documento || "").includes(filtroEmpleadoNormalizado)) {
            return false;
          }
        } else if (!filtroApellidoInvalido) {
          const apellido = String(lic.Apellido || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          const termino = filtroEmpleadoNormalizado
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          if (!apellido.includes(termino)) return false;
        }
      }

      if (filtroMotivo && lic.Motivo !== filtroMotivo) return false;
      if (filtroEstado && lic.Estado !== filtroEstado) return false;
      if (rangoFechasInvalido) return true;

      const fechaSolicitud = toDateInputValue(lic.FechaSolicitud);
      if (filtroFechaDesde && (!fechaSolicitud || fechaSolicitud < filtroFechaDesde)) {
        return false;
      }
      if (filtroFechaHasta && (!fechaSolicitud || fechaSolicitud > filtroFechaHasta)) {
        return false;
      }

      return true;
    });
  }, [licencias, filtroEmpleadoNormalizado, filtroEmpleadoEsDni, filtroApellidoInvalido, filtroMotivo, filtroEstado, filtroFechaDesde, filtroFechaHasta, rangoFechasInvalido]);

  useEffect(() => {
    resetPagination();
  }, [filtroEmpleado, filtroMotivo, filtroEstado, filtroFechaDesde, filtroFechaHasta, resetPagination]);

  // Menú usuario
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleOpenPasswordModal = () => {
    setModalPasswordOpen(true);
    setAnchorEl(null);
    setMsg(null);
    setOldPassword("");
    setNewPassword("");
  };
  const handleClosePasswordModal = () => setModalPasswordOpen(false);

  const handleCerrarSesion = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const handleChangePassword = async () => {
    setLoadingPassword(true);
    setMsg(null);
    try {
      const username =
        localStorage.getItem("username") ||
        localStorage.getItem("nombre") ||
        "";
      const res = await fetch(
        "http://localhost:4000/api/usuario/auth/cambiar-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            oldPassword,
            newPassword,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMsg("Contraseña cambiada correctamente");
        setOldPassword("");
        setNewPassword("");
      } else {
        setMsg(data.error || "Error al cambiar la contraseña");
      }
    } catch (err) {
      setMsg("Error de conexión con el servidor");
    } finally {
      setLoadingPassword(false);
    }
  };

  const licenciasPaginadas = paginate(licenciasFiltradas, page, rowsPerPage);

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
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            mr: 1,
          }}
        >
          <Typography
            sx={{
              fontWeight: 500,
              letterSpacing: 2,
              fontFamily: "Tektur, sans-serif",
              fontSize: 18,
              color: "#333",
              lineHeight: 1.1,
            }}
          >
            Bienvenido/a
          </Typography>
          <Typography
            sx={{
              fontWeight: 700,
              letterSpacing: 2,
              fontFamily: "Tektur, sans-serif",
              fontSize: 22,
              color: "#1976d2",
              lineHeight: 1.1,
            }}
          >
            {userName}
          </Typography>
        </Box>
        <IconButton onClick={handleMenuOpen}>
          <Settings sx={{ fontSize: 40, color: '#1976d2' }} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleOpenPasswordModal}>Cambiar Contraseña</MenuItem>
          <MenuItem onClick={handleCerrarSesion}>Cerrar Sesión</MenuItem>
        </Menu>
      </Box>

      {/* Contenido principal */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Botón Volver */}
        <BackButton to="/rrhh-principal" />

        {/* Título */}
        <Typography
          variant="h4"
          sx={{
            mt: 3,
            mb: 2,
            textAlign: "center",
            fontFamily: "Tektur, sans-serif",
            fontWeight: 700,
            color: "#1976d2",
            fontSize: 32,
            letterSpacing: 2,
          }}
        >
          Gestionar Licencias
        </Typography>

        {/* Tabla de solicitudes */}
        <TableContainer
          component={Paper}
          sx={{
            mt: 2,
            mx: 4,
            mb: 5,
            maxWidth: 1400,
            alignSelf: "center",
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
              backgroundColor: "#ffffff",
              borderBottom: "1px solid #eceff1",
            }}
          >
            <TextField
              label="Apellido o DNI"
              value={filtroEmpleado}
              onChange={(e) => setFiltroEmpleado(e.target.value)}
              size="small"
              error={filtroApellidoInvalido}
              helperText={
                filtroApellidoInvalido
                  ? "Para apellido, ingrese al menos 3 letras"
                  : " "
              }
              placeholder="Ej: Pérez o 12345678"
              sx={{ minWidth: 240 }}
            />

            <TextField
              select
              label="Motivo"
              value={filtroMotivo}
              onChange={(e) => setFiltroMotivo(e.target.value)}
              size="small"
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {motivosDisponibles.map((motivo) => (
                <MenuItem key={motivo} value={motivo}>
                  {motivo}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Estado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Pendiente">Pendiente</MenuItem>
              <MenuItem value="Aprobada">Aprobada</MenuItem>
              <MenuItem value="Rechazada">Rechazada</MenuItem>
            </TextField>

            <TextField
              label="Fecha desde"
              type="date"
              value={filtroFechaDesde}
              onChange={(e) => setFiltroFechaDesde(e.target.value)}
              size="small"
              error={rangoFechasInvalido}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />

            <TextField
              label="Fecha hasta"
              type="date"
              value={filtroFechaHasta}
              onChange={(e) => setFiltroFechaHasta(e.target.value)}
              size="small"
              error={rangoFechasInvalido}
              helperText={rangoFechasInvalido ? "Debe ser mayor o igual a Fecha desde" : " "}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />

            <Button
              variant="contained"
              onClick={() => {
                setFiltroEmpleado("");
                setFiltroMotivo("");
                setFiltroEstado("");
                setFiltroFechaDesde("");
                setFiltroFechaHasta("");
              }}
              disabled={
                !filtroEmpleado &&
                !filtroMotivo &&
                !filtroEstado &&
                !filtroFechaDesde &&
                !filtroFechaHasta
              }
              sx={{
                height: 56,
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
          <Table>
            <TableHead sx={{ backgroundColor: "#858789ff" }}>
              <TableRow>
                <TableCell sx={{ color: "#fff", fontWeight: 600, fontFamily: "Tektur, sans-serif", textAlign: "center" }}>Fecha Solicitud</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600, fontFamily: "Tektur, sans-serif", textAlign: "center" }}>Documento</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600, fontFamily: "Tektur, sans-serif", textAlign: "center" }}>Nombre y Apellido</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600, fontFamily: "Tektur, sans-serif", textAlign: "center" }}>Categoría</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600, fontFamily: "Tektur, sans-serif", textAlign: "center" }}>Motivo</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600, fontFamily: "Tektur, sans-serif", textAlign: "center" }}>Fecha desde</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600, fontFamily: "Tektur, sans-serif", textAlign: "center" }}>Fecha hasta</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600, fontFamily: "Tektur, sans-serif", textAlign: "center" }}>Reincorporación</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600, fontFamily: "Tektur, sans-serif", textAlign: "center" }}>Certificado</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600, fontFamily: "Tektur, sans-serif", textAlign: "center" }}>Estado</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600, fontFamily: "Tektur, sans-serif", textAlign: "center" }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : licencias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <Typography variant="h6" color="text.secondary">
                      No hay solicitudes pendientes
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : licenciasFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <Typography variant="h6" color="text.secondary">
                      No hay resultados para los filtros seleccionados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                licenciasPaginadas.map((licencia) => (
                  <TableRow
                    key={licencia.Id_Licencia}
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" },
                      "&:hover": { backgroundColor: "#e3f2fd" },
                    }}
                  >
                    <TableCell align="center">
                      {formatDate(licencia.FechaSolicitud)}
                    </TableCell>
                    <TableCell align="center">{licencia.Documento}</TableCell>
                    <TableCell align="center">
                      {`${licencia.Nombre} ${licencia.Apellido}`}
                    </TableCell>
                    <TableCell align="center">
                      {licencia.Categoria || <span style={{ color: '#888' }}>N/A</span>}
                    </TableCell>
                    <TableCell align="center">{licencia.Motivo}</TableCell>
                    <TableCell align="center">
                      {licencia.FechaInicio ? formatDate(licencia.FechaInicio) : ""}
                    </TableCell>
                    <TableCell align="center">
                      {licencia.FechaFin ? formatDate(licencia.FechaFin) : ""}
                    </TableCell>
                    <TableCell align="center">
                      {licencia.FechaReincorporacion
                        ? formatDate(licencia.FechaReincorporacion)
                        : ""}
                    </TableCell>
                    <TableCell align="center">
                      {licencia.CertificadoMedico ? (
                        <Tooltip title="Descargar certificado médico">
                          <a
                            href={licencia.CertificadoMedico}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#1976d2',
                              textDecoration: 'none',
                              fontWeight: 500,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <DownloadIcon sx={{ fontSize: 22, mr: 0.5 }} />
                            Descargar
                          </a>
                        </Tooltip>
                      ) : (
                        <span style={{ color: '#888' }}>No adjunto</span>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={licencia.Estado}
                        color={getEstadoColor(licencia.Estado) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {licencia.Estado === "Pendiente" && (
                        <Button
                          variant="contained"
                          onClick={() => handleResponder(licencia)}
                          sx={{
                            textTransform: "none",
                            backgroundColor: "#1976d2",
                            ":hover": { backgroundColor: "#115293" },
                            fontSize: 16,
                            py: 1,
                            px: 3,
                            borderRadius: 3,
                            fontFamily: "Tektur, sans-serif",
                            fontWeight: 700,
                            letterSpacing: 1,
                          }}
                        >
                          Responder
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {!loading && licenciasFiltradas.length > 0 && (
          <ReusableTablePagination
            count={licenciasFiltradas.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              maxWidth: 1400,
              width: "100%",
              alignSelf: "center",
              px: 2,
            }}
          />
        )}
      </Box>

      {/* Modal de respuesta */}
      <Modal open={modalRespuestaOpen} onClose={() => setModalRespuestaOpen(false)}>
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
            minWidth: 500,
            maxWidth: "90vw",
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 3, fontFamily: "Tektur, sans-serif" }}
          >
            Responder Solicitud de Licencia
          </Typography>

          {selectedLicencia && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Solicitante:</strong> {selectedLicencia.Nombre} {selectedLicencia.Apellido}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Motivo:</strong> {selectedLicencia.Motivo}
              </Typography>
              {(selectedLicencia.FechaInicio ||
                selectedLicencia.FechaFin ||
                selectedLicencia.FechaReincorporacion) && (
                <>
                  {selectedLicencia.FechaInicio && (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Fecha desde:</strong> {formatDate(selectedLicencia.FechaInicio)}
                    </Typography>
                  )}
                  {selectedLicencia.FechaFin && (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Fecha hasta:</strong> {formatDate(selectedLicencia.FechaFin)}
                    </Typography>
                  )}
                  {selectedLicencia.FechaReincorporacion && (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Fecha de reincorporación:</strong> {formatDate(selectedLicencia.FechaReincorporacion)}
                    </Typography>
                  )}
                </>
              )}
              {selectedLicencia.Observaciones && (
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Observaciones:</strong> {selectedLicencia.Observaciones}
                </Typography>
              )}
              {selectedLicencia.DiagnosticoCIE10_Codigo && (
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Diagnóstico CIE-10:</strong> {selectedLicencia.DiagnosticoCIE10_Codigo} - {selectedLicencia.DiagnosticoCIE10_Descripcion}
                </Typography>
              )}
            </Box>
          )}

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Decisión</InputLabel>
            <Select
              value={accion}
              onChange={(e) =>
                setAccion(e.target.value as "Aprobada" | "Rechazada")
              }
            >
              <MenuItem value="Aprobada">Aprobar</MenuItem>
              <MenuItem value="Rechazada">Rechazar</MenuItem>
            </Select>
          </FormControl>

          {accion === "Rechazada" && (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Motivo del rechazo"
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              sx={{ mb: 3 }}
              required
            />
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" onClick={() => setModalRespuestaOpen(false)}
              sx={{
                fontFamily: "Tektur, sans-serif",
                fontWeight: 600,
                fontSize: 16,
                borderRadius: 3,
                textTransform: "none",
                letterSpacing: 1,
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleEnviarRespuesta}
              disabled={accion === "Rechazada" && !respuesta.trim()}
              sx={{
                fontFamily: "Tektur, sans-serif",
                fontWeight: 700,
                fontSize: 16,
                borderRadius: 3,
                textTransform: "none",
                letterSpacing: 1,
                backgroundColor: "#1976d2",
                ":hover": { backgroundColor: "#115293" },
              }}
            >
              Enviar Respuesta
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal para cambiar contraseña */}
      <Modal open={modalPasswordOpen} onClose={handleClosePasswordModal}>
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
            <Button onClick={handleClosePasswordModal} disabled={loadingPassword}
              sx={{
                fontFamily: "Tektur, sans-serif",
                fontWeight: 600,
                fontSize: 16,
                borderRadius: 3,
                textTransform: "none",
                letterSpacing: 1,
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleChangePassword}
              disabled={loadingPassword || !oldPassword || !newPassword}
              sx={{
                fontFamily: "Tektur, sans-serif",
                fontWeight: 700,
                fontSize: 16,
                borderRadius: 3,
                textTransform: "none",
                letterSpacing: 1,
                backgroundColor: "#1976d2",
                ":hover": { backgroundColor: "#115293" },
              }}
            >
              Cambiar
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
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
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Footer */}
      <Footer />
    </Box>
  );
}
