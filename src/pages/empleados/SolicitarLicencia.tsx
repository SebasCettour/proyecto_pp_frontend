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
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";
import { API_ENDPOINTS } from "../../config/api";
import Header from "../../components/Header";

interface DiagnosticoCIE10 {
  codigo: string;
  descripcion: string;
}

export default function SolicitarLicencia() {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    area: "",
    motivo: "",
    observaciones: "",
    archivo: null as File | null,
    diagnosticoCIE10: null as DiagnosticoCIE10 | null,
  });

  const [errors, setErrors] = useState({
    nombre: false,
    apellido: false,
    documento: false,
    area: false,
    motivo: false,
    archivo: false,
    diagnosticoCIE10: false,
  });

  // Estados para el buscador CIE-10
  const [cie10Search, setCie10Search] = useState("");
  const [cie10Results, setCie10Results] = useState<DiagnosticoCIE10[]>([]);
  const [cie10Loading, setCie10Loading] = useState(false);

  // Función para buscar diagnósticos CIE-10
  const buscarDiagnosticosCIE10 = async (query: string) => {
    if (query.length < 3) {
      setCie10Results([]);
      return;
    }

    setCie10Loading(true);
    try {
      const response = await fetch(
        `${API_ENDPOINTS.CIE10_SEARCH}?query=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setCie10Results(data);
      } else {
        setCie10Results([]);
      }
    } catch (error) {
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

  const handleSubmit = async () => {
    const newErrors = {
      nombre: form.nombre.trim() === "",
      apellido: form.apellido.trim() === "",
      documento: form.documento.trim() === "",
      area: form.area === "",
      motivo: form.motivo === "",
      archivo: form.motivo === "Enfermedad" && !form.archivo,
      diagnosticoCIE10: form.motivo === "Enfermedad" && !form.diagnosticoCIE10,
    };
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error);
    if (!hasErrors) {
      try {
        const token = localStorage.getItem("token");
        console.log("Token:", token); // <-- AGREGAR ESTE LOG
        
        const formData = new FormData();

        // Agregar campos del formulario
        formData.append("nombre", form.nombre);
        formData.append("apellido", form.apellido);
        formData.append("documento", form.documento);
        formData.append("area", form.area);
        formData.append("motivo", form.motivo);
        formData.append("observaciones", form.observaciones);

        // Agregar archivo si existe
        if (form.archivo) {
          formData.append("certificadoMedico", form.archivo);
        }

        // Agregar diagnóstico CIE-10 si existe
        if (form.diagnosticoCIE10) {
          formData.append("diagnosticoCIE10_codigo", form.diagnosticoCIE10.codigo);
          formData.append("diagnosticoCIE10_descripcion", form.diagnosticoCIE10.descripcion);
        }

        const response = await fetch("http://localhost:4000/api/licencias/solicitar", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        console.log("Response status:", response.status); // <-- AGREGAR ESTE LOG
        console.log("Response:", await response.text()); // <-- AGREGAR ESTE LOG

        if (response.ok) {
          alert("Solicitud enviada correctamente");
          // Limpiar formulario
          setForm({
            nombre: "",
            apellido: "",
            documento: "",
            area: "",
            motivo: "",
            observaciones: "",
            archivo: null,
            diagnosticoCIE10: null,
          });
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Error enviando solicitud:", error);
        alert("Error enviando la solicitud");
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
              fontWeight: 600,
              textAlign: "center",
              color: "#333",
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
            <TextField
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleInputChange}
              error={errors.nombre}
              helperText={errors.nombre && "Campo obligatorio"}
              sx={{ flex: "1 1 30%" }}
            />
            <TextField
              label="Apellido"
              name="apellido"
              value={form.apellido}
              onChange={handleInputChange}
              error={errors.apellido}
              helperText={errors.apellido && "Campo obligatorio"}
              sx={{ flex: "1 1 30%" }}
            />
            <TextField
              label="Documento"
              name="documento"
              value={form.documento}
              onChange={handleInputChange}
              error={errors.documento}
              helperText={errors.documento && "Campo obligatorio"}
              sx={{ flex: "1 1 30%" }}
              inputProps={{ maxLength: 15 }}
            />
            <FormControl fullWidth error={errors.area} sx={{ flex: "1 1 45%" }}>
              <InputLabel>Área</InputLabel>
              <Select
                name="area"
                value={form.area}
                onChange={handleSelectChange}
              >
                <MenuItem value="">Seleccione Área</MenuItem>
                <MenuItem value="Administración">Administración</MenuItem>
                <MenuItem value="Ventas">Ventas</MenuItem>
                <MenuItem value="Producción">Producción</MenuItem>
              </Select>
              {errors.area && (
                <FormHelperText>Seleccione un área</FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              error={errors.motivo}
              sx={{ flex: "1 1 45%" }}
            >
              <InputLabel>Motivo</InputLabel>
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

            {/* Buscador CIE-10 - Solo visible cuando el motivo es Enfermedad */}
            {form.motivo === "Enfermedad" && (
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
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {option.codigo}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.descripcion}
                        </Typography>
                      </Box>
                    </Box>
                  )}
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
                fontWeight: 600,
                fontSize: "1.1rem",
                borderRadius: 2,
                letterSpacing: 2,
                backgroundColor: "#1976d2",
                "&:hover": { backgroundColor: "#115293" },
              }}
            >
              Enviar Solicitud
            </Button>
          </Box>
        </Paper>
      </Box>

      <Footer />
    </Box>
  );
}
