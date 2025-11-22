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
  CircularProgress,
  Chip,
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Autocomplete from "@mui/material/Autocomplete";
import { SelectChangeEvent } from "@mui/material/Select";
import MenuUsuario from "../../components/MenuUsuario";

const MisLicencias: React.FC = () => {
  const [licencias, setLicencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Para edición
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [licenciaAEditar, setLicenciaAEditar] = useState<any>(null);
  const [editFields, setEditFields] = useState({
    Motivo: "",
    FechaInicio: "",
    FechaFin: "",
    motivo: "",
    nombre: "",
    apellido: "",
    documento: "",
    diagnosticoCIE10: null as any,
    archivo: null as File | null,
    observaciones: "",
  });

  const [cie10Results, setCie10Results] = useState<any[]>([]);
  const [cie10Loading, setCie10Loading] = useState(false);
  const [cie10Search, setCie10Search] = useState("");

  // Estados para Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "warning" | "info">("info");

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const documento = localStorage.getItem("documento") || "";

  useEffect(() => {
    const fetchLicencias = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:4000/api/licencias/mis-licencias/${documento}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) throw new Error("Error al obtener licencias");
        const data = await res.json();
        setLicencias(data);
      } catch (err) {
        setError("No se pudieron cargar las licencias");
      } finally {
        setLoading(false);
      }
    };
    if (documento) fetchLicencias();
  }, [documento]);

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

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  // Abrir modal de edición
  const handleEditar = (lic: any) => {
    setLicenciaAEditar(lic);
    setEditFields({
      Motivo: lic.Motivo || "",
      FechaInicio: lic.FechaInicio || "",
      FechaFin: lic.FechaFin || "",
      motivo: lic.Motivo || "",
      nombre: lic.Nombre || "",
      apellido: lic.Apellido || "",
      documento: lic.Documento || "",
      diagnosticoCIE10: lic.DiagnosticoCIE10 || null,
      archivo: null,
      observaciones: lic.Observaciones || "",
    });
    setEditModalOpen(true);
  };

  // Guardar cambios
  const handleGuardarEdicion = async () => {
    if (!licenciaAEditar) return;
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("motivo", editFields.motivo || "");
      formData.append("fechaInicio", (editFields.FechaInicio || "").slice(0, 10));
      formData.append("fechaFin", (editFields.FechaFin || "").slice(0, 10));
      formData.append("observaciones", editFields.observaciones || "");

      // Diagnóstico CIE-10 si corresponde
      if (editFields.diagnosticoCIE10) {
        formData.append(
          "diagnosticoCIE10_codigo",
          editFields.diagnosticoCIE10.codigo || ""
        );
        formData.append(
          "diagnosticoCIE10_descripcion",
          editFields.diagnosticoCIE10.descripcion || ""
        );
      } else {
        formData.append("diagnosticoCIE10_codigo", "");
        formData.append("diagnosticoCIE10_descripcion", "");
      }

      // Archivo si fue cambiado
      if (editFields.archivo) {
        formData.append("certificadoMedico", editFields.archivo);
      }

      const response = await fetch(
        `http://localhost:4000/api/licencias/editar/${licenciaAEditar.Id_Licencia}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        // Refresca la lista
        const res = await fetch(
          `http://localhost:4000/api/licencias/mis-licencias/${documento}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setLicencias(data);
        }
        setEditModalOpen(false);
        setLicenciaAEditar(null);
      } else {
        setSnackbarMessage("Error al guardar los cambios");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage("Error al guardar los cambios");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFields((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setEditFields((prev) => ({ ...prev, [name!]: value }));
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditFields((prev) => ({ ...prev, archivo: file }));
    }
  };

  useEffect(() => {
    const fetchCIE10 = async () => {
      if (!cie10Search.trim()) {
        setCie10Results([]);
        return;
      }
      setCie10Loading(true);
      try {
        const res = await fetch(
          `http://localhost:4000/api/cie10/search?query=${encodeURIComponent(cie10Search)}`
        );
        if (res.ok) {
          const data = await res.json();
          setCie10Results(data);
        }
      } catch (error) {
        console.error("Error al buscar CIE-10:", error);
      } finally {
        setCie10Loading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchCIE10();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [cie10Search]);

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

      {/* Contenido principal */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
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

        {/* Tabla de licencias */}
        <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, mb: 6, width: "100%" }}>
          <Typography
            variant="h4"
            sx={{
              mb: 3,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 700,
              color: "#1976d2",
              textAlign: "center",
              letterSpacing: 2,
              fontSize: 32,
            }}
          >
            Mis Licencias
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : licencias.length === 0 ? (
            <Typography>No tienes licencias registradas.</Typography>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                overflow: "hidden",
              }}
            >
              <Table>
                <TableHead sx={{ backgroundColor: "#858789ff" }}>
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{ color: "#fff", fontWeight: 600 }}
                    >
                      Motivo
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ color: "#fff", fontWeight: 600 }}
                    >
                      Fecha Inicio
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ color: "#fff", fontWeight: 600 }}
                    >
                      Fecha Fin
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ color: "#fff", fontWeight: 600 }}
                    >
                      Estado
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ color: "#fff", fontWeight: 600 }}
                    >
                      Fecha Respuesta
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ color: "#fff", fontWeight: 600 }}
                    >
                      Motivo Rechazo
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ color: "#fff", fontWeight: 600 }}
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {licencias.map((lic) => (
                    <TableRow
                      key={lic.Id_Licencia}
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" },
                        "&:hover": { backgroundColor: "#e3f2fd" },
                      }}
                    >
                      <TableCell align="center">{lic.Motivo}</TableCell>
                      <TableCell align="center">
                        {formatDate(lic.FechaInicio)}
                      </TableCell>
                      <TableCell align="center">
                        {formatDate(lic.FechaFin)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={lic.Estado}
                          color={getEstadoColor(lic.Estado) as any}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {lic.FechaRespuesta
                          ? formatDate(lic.FechaRespuesta)
                          : lic.Estado === "Pendiente"
                          ? "Pendiente"
                          : "-"}
                      </TableCell>
                      <TableCell align="center">
                        {lic.MotivoRechazo || "-"}
                      </TableCell>
                      <TableCell align="center">
                        {lic.Estado === "Pendiente" && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleEditar(lic)}
                            sx={{
                              textTransform: "none",
                              fontSize: 14,
                              borderRadius: 2,
                            }}
                          >
                            Editar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>

      {/* Modal de edición */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
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
            sx={{ mb: 3, fontFamily: "Tektur, sans-serif" }}
          >
            Editar Licencia
          </Typography>

          {/* Fechas */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
            <TextField
              label="Fecha Inicio"
              name="FechaInicio"
              type="date"
              value={editFields.FechaInicio?.slice(0, 10) || ""}
              onChange={handleEditInputChange}
              fullWidth
              variant="outlined"
              sx={{ borderRadius: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Fecha Fin"
              name="FechaFin"
              type="date"
              value={editFields.FechaFin?.slice(0, 10) || ""}
              onChange={handleEditInputChange}
              fullWidth
              variant="outlined"
              sx={{ borderRadius: 2 }}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Motivo */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
            <FormControl
              fullWidth
              variant="outlined"
              sx={{ borderRadius: 2 }}
            ></FormControl>
            <FormControl fullWidth variant="outlined" sx={{ borderRadius: 2 }}>
              <InputLabel>Motivo</InputLabel>
              <Select
                name="motivo"
                value={editFields.motivo}
                onChange={handleEditSelectChange}
                label="Motivo"
              >
                <MenuItem value="">Seleccione Motivo</MenuItem>
                <MenuItem value="Enfermedad">Enfermedad</MenuItem>
                <MenuItem value="Vacaciones">Vacaciones</MenuItem>
                <MenuItem value="Personal">Personal</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Diagnóstico CIE-10 solo si motivo es Enfermedad */}
          {editFields.motivo === "Enfermedad" && (
            <Box sx={{ flex: "1 1 100%", mt: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontFamily: "Tektur, sans-serif",
                  fontWeight: 600,
                  color: "#333",
                }}
              >
                Diagnóstico CIE-10
              </Typography>
              <Autocomplete
                options={cie10Results}
                getOptionLabel={(option) =>
                  `${option.codigo} - ${option.descripcion}`
                }
                value={editFields.diagnosticoCIE10}
                onChange={(_, newValue) => {
                  setEditFields((prev) => ({
                    ...prev,
                    diagnosticoCIE10: newValue,
                  }));
                }}
                onInputChange={(_, newInputValue) => {
                  setCie10Search(newInputValue);
                }}
                loading={cie10Loading}
                loadingText="Buscando diagnósticos..."
                noOptionsText="No se encontraron diagnósticos"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Buscar diagnóstico CIE-10"
                    placeholder="Ej: A15 o tuberculosis"
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box key={key} component="li" {...otherProps}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {option.codigo}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.descripcion}
                        </Typography>
                      </Box>
                    </Box>
                  );
                }}
              />
              {editFields.diagnosticoCIE10 && (
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={`${editFields.diagnosticoCIE10.codigo} - ${editFields.diagnosticoCIE10.descripcion}`}
                    onDelete={() => {
                      setEditFields((prev) => ({
                        ...prev,
                        diagnosticoCIE10: null,
                      }));
                    }}
                    color="primary"
                    variant="outlined"
                    sx={{
                      fontFamily: "Tektur, sans-serif",
                      fontWeight: 500,
                    }}
                  />
                </Box>
              )}
            </Box>
          )}

          {/* Botón para subir PDF */}
          <Button
            component="label"
            variant="outlined"
            sx={{
              mt: 1,
              py: 1.5,
              width: "fit-content",
              borderRadius: 2,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: "none",
              backgroundColor: "#e3f2fd",
              color: "#1976d2",
              "&:hover": { backgroundColor: "#bbdefb" },
            }}
          >
            {editFields.archivo
              ? `Archivo: ${editFields.archivo.name}`
              : "Adjuntar Certificado Médico (PDF)"}
            <input
              type="file"
              hidden
              accept="application/pdf"
              onChange={handleEditFileChange}
            />
          </Button>

          {/* Observaciones */}
          <TextField
            label="Observaciones"
            name="observaciones"
            value={editFields.observaciones}
            onChange={handleEditInputChange}
            fullWidth
            multiline
            rows={4}
            sx={{ flex: "1 1 100%", mt: 2 }}
          />

          {/* Botones */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}
          >
            <Button variant="outlined" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleGuardarEdicion}>
              Guardar Cambios
            </Button>
          </Box>
        </Box>
      </Modal>
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
};

export default MisLicencias;
