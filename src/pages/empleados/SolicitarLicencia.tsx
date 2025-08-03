import React, { useState } from "react";
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
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";

export default function SolicitarLicencia() {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    area: "",
    motivo: "",
    fechaDesde: "",
    fechaHasta: "",
    observaciones: "",
  });

  const [errors, setErrors] = useState({
    nombre: false,
    apellido: false,
    area: false,
    motivo: false,
    fechaDesde: false,
    fechaHasta: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (value.trim() !== "") {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (value !== "") {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleSubmit = () => {
    const newErrors = {
      nombre: form.nombre.trim() === "",
      apellido: form.apellido.trim() === "",
      area: form.area === "",
      motivo: form.motivo === "",
      fechaDesde: form.fechaDesde === "",
      fechaHasta: form.fechaHasta === "",
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error);
    if (!hasErrors) {
      console.log("Formulario enviado:", form);
      // Aquí puedes manejar el envío del formulario (ej: a una API)
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#C0C0C0",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          textAlign: "left",
          py: 4,
          backgroundColor: "#000000",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontFamily: "Tektur, sans-serif",
            fontWeight: 700,
            color: "#333",
            marginLeft: "10px",
            userSelect: "none",
          }}
        >
          <span style={{ color: "#CC5500" }}>360</span>
          <span style={{ color: "#ffffff" }}>Sueldos</span>
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, px: 4 }}>
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

      <Box
        sx={{
          flexGrow: 1,
          px: 4,
          mt: 8,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "1100px",
            backgroundColor: "white",
            borderRadius: 2,
            p: { xs: 3, sm: 5 },
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            boxSizing: "border-box",
          }}
        >
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
              helperText={errors.nombre ? "Este campo es obligatorio" : ""}
              fullWidth
              sx={{ flex: "1 1 45%" }}
            />
            <TextField
              label="Apellido"
              name="apellido"
              value={form.apellido}
              onChange={handleInputChange}
              error={errors.apellido}
              helperText={errors.apellido ? "Este campo es obligatorio" : ""}
              fullWidth
              sx={{ flex: "1 1 45%" }}
            />
            <FormControl fullWidth error={errors.area} sx={{ flex: "1 1 45%" }}>
              <InputLabel id="area-label">Área</InputLabel>
              <Select
                labelId="area-label"
                name="area"
                value={form.area}
                onChange={handleSelectChange}
                label="Área"
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
              <InputLabel id="motivo-label">Motivo</InputLabel>
              <Select
                labelId="motivo-label"
                name="motivo"
                value={form.motivo}
                onChange={handleSelectChange}
                label="Motivo"
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
              label="Fecha Desde"
              name="fechaDesde"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.fechaDesde}
              onChange={handleInputChange}
              error={errors.fechaDesde}
              helperText={errors.fechaDesde ? "Este campo es obligatorio" : ""}
              fullWidth
            />
            <TextField
              label="Fecha Hasta"
              name="fechaHasta"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.fechaHasta}
              onChange={handleInputChange}
              error={errors.fechaHasta}
              helperText={errors.fechaHasta ? "Este campo es obligatorio" : ""}
              fullWidth
              sx={{ flex: "1 1 45%" }}
            />
            <TextField
              label="Observaciones"
              name="observaciones"
              value={form.observaciones}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={4}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              sx={{
                py: 1.5,
                letterSpacing: 2,
                fontFamily: "Tektur, sans-serif",
                fontWeight: 600,
                fontSize: "1.1rem",
                borderRadius: 1,
                textTransform: "none",
                mt: 2,
              }}
            >
              Enviar Solicitud
            </Button>
          </Box>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
