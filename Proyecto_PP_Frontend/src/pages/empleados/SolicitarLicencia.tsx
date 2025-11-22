import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormHelperText,
  FormControl,
  InputLabel,
  Paper,
  Autocomplete,
  CircularProgress,
  Chip,
  Modal,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { SelectChangeEvent } from "@mui/material/Select";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";
import { API_ENDPOINTS } from "../../config/api";
import Header from "../../components/Header";
import MenuUsuario from "../../components/MenuUsuario";

interface DiagnosticoCIE10 {
  codigo: string;
  descripcion: string;
}

export default function SolicitarLicencia() {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    legajo: "",
    categoria: "",
    tipoDocumento: "",
    motivo: "",
    observaciones: "",
    fechaInicio: "",
    fechaFin: "",
    fechaReincorporacion: "",
    archivo: null as File | null,
    diagnosticoCIE10: null as DiagnosticoCIE10 | null,
  });

  const [errors, setErrors] = useState({
    nombre: false,
    apellido: false,
    documento: false,
    motivo: false,
    fechaInicio: false,
    fechaFin: false,
    fechaReincorporacion: false,
    archivo: false,
    diagnosticoCIE10: false,
  });

  // Estados para el buscador CIE-10
  const [cie10Search, setCie10Search] = useState("");
  const [cie10Results, setCie10Results] = useState<DiagnosticoCIE10[]>([]);
  const [cie10Loading, setCie10Loading] = useState(false);

  // Estados para el modal de cambiar contraseña
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingEmpleado, setLoadingEmpleado] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Estados para el menú de usuario
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState<string>("");

  // Estados para Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "warning" | "info">("info");

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    // Obtener el nombre del usuario desde localStorage
    const name =
      localStorage.getItem("username") ||
      localStorage.getItem("nombre") ||
      "Usuario";
    setUserName(name);
    
    // Cargar datos del empleado
    cargarDatosEmpleado();
  }, []);

  const cargarDatosEmpleado = async () => {
    setLoadingEmpleado(true);
    try {
      const token = localStorage.getItem("token");
      const documento = localStorage.getItem("documento");
      
      if (!documento) {
        console.error("No se encontró el documento en localStorage");
        setLoadingEmpleado(false);
        return;
      }

      const response = await fetch(
        `http://localhost:4000/api/usuario/empleado-buscar/${encodeURIComponent(documento)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const empleado = await response.json();
        
        console.log("✅ Datos del empleado recibidos:", empleado);
        console.log("✅ DNI recibido:", empleado.dni);
        console.log("✅ Nombre recibido:", empleado.nombre);
        console.log("✅ Apellido recibido:", empleado.apellido);
        console.log("✅ Legajo recibido:", empleado.legajo);
        console.log("✅ Categoría recibida:", empleado.categoria);
        
        setForm((prev) => ({
          ...prev,
          nombre: empleado.nombre || "",
          apellido: empleado.apellido || "",
          documento: empleado.dni || "",
          legajo: empleado.legajo || "",
          categoria: empleado.categoria || "",
          tipoDocumento: "DNI",
        }));
      } else {
        console.error("❌ Error al cargar datos del empleado - Status:", response.status);
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Error data:", errorData);
      }
    } catch (error) {
      console.error("Error al cargar datos del empleado:", error);
    } finally {
      setLoadingEmpleado(false);
    }
  };

  // Función para buscar diagnósticos CIE-10
  const buscarDiagnosticosCIE10 = async (query: string) => {
    if (query.length < 3) {
      setCie10Results([]);
      return;
    }

    setCie10Loading(true);
    try {
      const url = `${API_ENDPOINTS.CIE10_SEARCH}?query=${encodeURIComponent(query)}`;
      console.log("🔍 Buscando CIE10:", query);
      console.log("🌐 URL:", url);
      
      const response = await fetch(url);
      console.log("📡 Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Datos recibidos:", data);
        setCie10Results(data);
      } else {
        const errorText = await response.text();
        console.error("❌ Error en búsqueda CIE10:", response.status, errorText);
        setCie10Results([]);
      }
    } catch (error) {
      console.error("❌ Error de red al buscar CIE10:", error);
      setCie10Results([]);
    } finally {
      setCie10Loading(false);
    }
  };

  // Retarda la ejecución de la búsqueda mientras el usuario escribe
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (cie10Search) {
        buscarDiagnosticosCIE10(cie10Search);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [cie10Search]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (value.trim() !== "") setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (value !== "") setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type !== "application/pdf") {
      setErrors((prev) => ({ ...prev, archivo: true }));
      setForm((prev) => ({ ...prev, archivo: null }));
    } else {
      setForm((prev) => ({ ...prev, archivo: file }));
      setErrors((prev) => ({ ...prev, archivo: false }));
    }
  };

  // Cambiar contraseña desde el modal
  const handleChangePassword = async () => {
    setLoading(true);
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
      setLoading(false);
      setOldPassword("");
      setNewPassword("");
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
    window.location.href = "/empleados";
  };

  const handleSubmit = async () => {
    const newErrors = {
      nombre: form.nombre.trim() === "",
      apellido: form.apellido.trim() === "",
      documento: form.documento.trim() === "",
      motivo: form.motivo === "",
      fechaInicio: form.fechaInicio === "",
      fechaFin: form.fechaFin === "",
      fechaReincorporacion: form.fechaReincorporacion === "",
      archivo: form.motivo === "Enfermedad" && !form.archivo,
      diagnosticoCIE10: form.motivo === "Enfermedad" && !form.diagnosticoCIE10,
    };
    setErrors(newErrors);

    // Validar que fechaFin sea posterior a fechaInicio
    if (
      form.fechaInicio &&
      form.fechaFin &&
      form.fechaFin <= form.fechaInicio
    ) {
      setSnackbarMessage("La fecha de fin debe ser posterior a la fecha de inicio");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    // Validar que fechaReincorporacion sea igual o posterior a fechaFin
    if (
      form.fechaFin &&
      form.fechaReincorporacion &&
      form.fechaReincorporacion < form.fechaFin
    ) {
      setSnackbarMessage("La fecha de reincorporación debe ser igual o posterior a la fecha de fin de licencia");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      setErrors((prev) => ({ ...prev, fechaReincorporacion: true }));
      return;
    }

    const hasErrors = Object.values(newErrors).some((error) => error);
    if (!hasErrors) {
      try {
        const token = localStorage.getItem("token");
        const formData = new FormData();

        // Agregar campos del formulario
        formData.append("nombre", form.nombre);
        formData.append("apellido", form.apellido);
        formData.append("documento", form.documento);
        formData.append("motivo", form.motivo);
        formData.append("fechaInicio", form.fechaInicio);
        formData.append("fechaFin", form.fechaFin);
        formData.append("fechaReincorporacion", form.fechaReincorporacion);
        formData.append("observaciones", form.observaciones);

        // Agregar archivo si existe
        if (form.archivo) {
          formData.append("certificadoMedico", form.archivo);
        }

        // Agregar diagnóstico CIE-10 si existe
        if (form.diagnosticoCIE10) {
          formData.append(
            "diagnosticoCIE10_codigo",
            form.diagnosticoCIE10.codigo
          );
          formData.append(
            "diagnosticoCIE10_descripcion",
            form.diagnosticoCIE10.descripcion
          );
        }

        const response = await fetch(
          "http://localhost:4000/api/licencias/solicitar",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (response.ok) {
          setSnackbarMessage("Solicitud enviada correctamente");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
          // Limpiar formulario
          setForm({
            nombre: form.nombre,
            apellido: form.apellido,
            documento: form.documento,
            legajo: form.legajo,
            categoria: form.categoria,
            tipoDocumento: form.tipoDocumento,
            motivo: "",
            observaciones: "",
            fechaInicio: "",
            fechaFin: "",
            fechaReincorporacion: "",
            archivo: null,
            diagnosticoCIE10: null,
          });
        } else {
          const errorData = await response.json();
          setSnackbarMessage(`Error: ${errorData.message}`);
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        }
      } catch (error) {
        setSnackbarMessage("Error enviando la solicitud");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
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

      {/* Botón para volver */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, px: 4 }}>
        <Button
          component={Link}
          to="/empleados"
          variant="contained"
          sx={{
            backgroundColor: "#1976d2",
            color: "#fff",
            width: 180,
            letterSpacing: 2,
            fontSize: 18,
            borderRadius: 3,
            fontFamily: "Tektur, sans-serif",
            fontWeight: 600,
            textTransform: "none",
            ml: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            '&:hover': { backgroundColor: '#115293' },
          }}
        >
          Volver
        </Button>
      </Box>

      {/* Contenedor formulario */}
      <Box
        sx={{
          flexGrow: 1,
          px: 4,
          mt: 3,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            maxWidth: "1100px",
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            backgroundColor: "#fff",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 4,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 700,
              textAlign: "center",
              color: "#1976d2",
              fontSize: 32,
              letterSpacing: 2,
            }}
          >
            Solicitar Licencia
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              justifyContent: "space-between",
            }}
          >
            {loadingEmpleado ? (
              <Box sx={{ width: "100%", display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Membrete con datos del empleado */}
                <Box
                  sx={{
                    width: "100%",
                    backgroundColor: "#f5f5f5",
                    borderRadius: 2,
                    p: 3,
                    mb: 2,
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontFamily: "Tektur, sans-serif",
                      fontWeight: 700,
                      color: "#1976d2",
                      borderBottom: "2px solid #1976d2",
                      pb: 1,
                      fontSize: 22,
                      letterSpacing: 1,
                    }}
                  >
                    Datos del Empleado
                  </Typography>
                  
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="caption" sx={{ color: "#666", fontWeight: 700, fontFamily: 'Tektur, sans-serif' }}>
                        Nombre Completo
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'Tektur, sans-serif' }}>
                        {form.nombre} {form.apellido}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" sx={{ color: "#666", fontWeight: 700, fontFamily: 'Tektur, sans-serif' }}>
                        Tipo de Documento
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'Tektur, sans-serif' }}>
                        {form.tipoDocumento || "DNI"}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" sx={{ color: "#666", fontWeight: 700, fontFamily: 'Tektur, sans-serif' }}>
                        Número de Documento
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'Tektur, sans-serif' }}>
                        {form.documento}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" sx={{ color: "#666", fontWeight: 700, fontFamily: 'Tektur, sans-serif' }}>
                        Legajo
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'Tektur, sans-serif' }}>
                        {form.legajo || "N/A"}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" sx={{ color: "#666", fontWeight: 700, fontFamily: 'Tektur, sans-serif' }}>
                        Categoría
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'Tektur, sans-serif' }}>
                        {form.categoria || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <FormControl
                  fullWidth
                  error={errors.motivo}
                  sx={{ flex: "1 1 100%" }}
                >
                  <InputLabel>Motivo de Licencia</InputLabel>
                  <Select
                    name="motivo"
                    value={form.motivo}
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="">Seleccione Motivo</MenuItem>
                    <MenuItem value="Enfermedad">Enfermedad</MenuItem>
                    <MenuItem value="Vacaciones">Vacaciones</MenuItem>
                    <MenuItem value="Personal">Personal</MenuItem>
                  </Select>
                  {errors.motivo && (
                    <FormHelperText>Seleccione un motivo</FormHelperText>
                  )}
                </FormControl>

                <TextField
                  label="Fecha de Inicio"
                  name="fechaInicio"
                  type="date"
                  value={form.fechaInicio}
                  onChange={handleInputChange}
                  error={errors.fechaInicio}
                  helperText={errors.fechaInicio && "Campo obligatorio"}
                  sx={{ flex: "1 1 30%" }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  label="Fecha de Fin"
                  name="fechaFin"
                  type="date"
                  value={form.fechaFin}
                  onChange={handleInputChange}
                  error={errors.fechaFin}
                  helperText={errors.fechaFin && "Campo obligatorio"}
                  sx={{ flex: "1 1 30%" }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  label="Fecha de Reincorporación"
                  name="fechaReincorporacion"
                  type="date"
                  value={form.fechaReincorporacion}
                  onChange={handleInputChange}
                  error={errors.fechaReincorporacion}
                  helperText={errors.fechaReincorporacion && "Campo obligatorio"}
                  sx={{ flex: "1 1 30%" }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />

                {/* Buscador CIE-10 - Solo visible cuando el motivo es Enfermedad */}
                {form.motivo === "Enfermedad" && (
                  <Box sx={{ flex: "1 1 100%", mt: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        fontFamily: "Tektur, sans-serif",
                        fontWeight: 700,
                        color: "#1976d2",
                        fontSize: 22,
                        letterSpacing: 1,
                      }}
                    >
                      Diagnóstico CIE-10
                    </Typography>

                    <Autocomplete
                      options={cie10Results}
                      getOptionLabel={(option) =>
                        `${option.codigo} - ${option.descripcion}`
                      }
                      value={form.diagnosticoCIE10}
                      onChange={(_, newValue) => {
                        setForm((prev) => ({
                          ...prev,
                          diagnosticoCIE10: newValue,
                        }));
                        if (newValue) {
                          setErrors((prev) => ({
                            ...prev,
                            diagnosticoCIE10: false,
                          }));
                        }
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
                          error={errors.diagnosticoCIE10}
                          helperText={
                            errors.diagnosticoCIE10
                              ? "Debe seleccionar un diagnóstico CIE-10"
                              : "Escriba al menos 3 caracteres para buscar"
                          }
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {cie10Loading ? (
                                  <CircularProgress color="inherit" size={20} />
                                ) : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
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

                    {/* Mostrar diagnóstico seleccionado */}
                    {form.diagnosticoCIE10 && (
                      <Box sx={{ mt: 2 }}>
                        <Chip
                          label={`${form.diagnosticoCIE10.codigo} - ${form.diagnosticoCIE10.descripcion}`}
                          onDelete={() => {
                            setForm((prev) => ({
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
                  {form.archivo
                    ? `Archivo: ${form.archivo.name}`
                    : "Adjuntar Certificado Médico (PDF)"}
                  <input
                    type="file"
                    hidden
                    accept="application/pdf"
                    onChange={handleFileChange}
                  />
                </Button>
                {errors.archivo && (
                  <FormHelperText error>
                    Debe subir un certificado en PDF para enfermedad
                  </FormHelperText>
                )}

                <TextField
                  label="Observaciones"
                  name="observaciones"
                  value={form.observaciones}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={4}
                  sx={{ flex: "1 1 100%" }}
                />

                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    width: "100%",
                    fontFamily: "Tektur, sans-serif",
                    fontWeight: 700,
                    fontSize: 20,
                    borderRadius: 3,
                    letterSpacing: 2,
                    backgroundColor: "#1976d2",
                    color: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    '&:hover': { backgroundColor: '#115293' },
                  }}
                >
                  Enviar Solicitud
                </Button>
              </>
            )}
          </Box>
        </Paper>
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
  );
}
