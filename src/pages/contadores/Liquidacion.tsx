import React, { useState } from "react";
import {
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import { SelectChangeEvent } from "@mui/material/Select";

const Liquidacion = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    razonSocial: "",
    cuitEmpleador: "",
    domicilioEmpleador: "",
    actividad: "",
    nombreEmpleado: "",
    cuilEmpleado: "",
    categoria: "",
    fechaIngreso: "",
    legajo: "",
    periodoMes: "",
    fechaPago: "",
    diasTrabajados: "",
    sueldoBasico: "",
    antiguedad: "",
    horasExtras: "",
    presentismo: "",
    adicionalesConvenio: "",
    premiosBonos: "",
    comisiones: "",
    vacaciones: "",
    aguinaldo: "",
    descuentos: "",
    aportesJubilatorios: "",
    obraSocial: "",
    pami: "",
    cuotaSindical: "",
    impuestoGanancias: "",
    embargos: "",
    otrosDescuentos: "",
    aportesVoluntarios: "",
    formaPago: "",
    cbuCuenta: "",
    fechaAcreditacion: "",
    convenioColectivo: "",
    regimenHorario: "",
    licencias: "",
    asignacionesFamiliares: "",
  });

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí pones la lógica para enviar o procesar la liquidación
    console.log(form);
    // navigate(...) si quieres redirigir luego
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
      {/* Encabezado */}
      <Box
        sx={{
          textAlign: "left",
          py: 4,
          backgroundColor: "#000000",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          width: "100%",
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

      {/* Formulario */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          backgroundColor: "#fff",
          borderRadius: 2,
          p: 4,
          mt: 4,
          mx: "auto",
          width: "90%",
          maxWidth: "900px",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Liquidación de Sueldos
        </Typography>

        {/* Datos del Empleador */}
        <Typography variant="h6" mt={2}>
          1. Datos del Empleador
        </Typography>
        <TextField
          fullWidth
          label="Razón social o nombre del empleador"
          name="razonSocial"
          value={form.razonSocial}
          onChange={handleChange}
          required
          sx={{ mt: 1 }}
        />
        <TextField
          fullWidth
          label="CUIT"
          name="cuitEmpleador"
          value={form.cuitEmpleador}
          onChange={handleChange}
          required
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Domicilio del empleador"
          name="domicilioEmpleador"
          value={form.domicilioEmpleador}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Actividad (opcional)"
          name="actividad"
          value={form.actividad}
          onChange={handleChange}
          sx={{ mt: 2, mb: 3 }}
        />

        {/* Datos del Trabajador */}
        <Typography variant="h6" mt={2}>
          2. Datos del Trabajador
        </Typography>
        <TextField
          fullWidth
          label="Nombre y apellido"
          name="nombreEmpleado"
          value={form.nombreEmpleado}
          onChange={handleChange}
          required
          sx={{ mt: 1 }}
        />
        <TextField
          fullWidth
          label="CUIL"
          name="cuilEmpleado"
          value={form.cuilEmpleado}
          onChange={handleChange}
          required
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Categoría o puesto"
          name="categoria"
          value={form.categoria}
          onChange={handleChange}
          required
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Fecha de ingreso"
          name="fechaIngreso"
          type="date"
          value={form.fechaIngreso}
          onChange={handleChange}
          required
          InputLabelProps={{ shrink: true }}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="N° de legajo"
          name="legajo"
          value={form.legajo}
          onChange={handleChange}
          sx={{ mt: 2, mb: 3 }}
        />

        {/* Período de Liquidación */}
        <Typography variant="h6" mt={2}>
          3. Período de Liquidación
        </Typography>
        <TextField
          fullWidth
          label="Mes y año"
          name="periodoMes"
          type="month"
          value={form.periodoMes}
          onChange={handleChange}
          required
          InputLabelProps={{ shrink: true }}
          sx={{ mt: 1 }}
        />
        <TextField
          fullWidth
          label="Fecha de pago"
          name="fechaPago"
          type="date"
          value={form.fechaPago}
          onChange={handleChange}
          required
          InputLabelProps={{ shrink: true }}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Días trabajados"
          name="diasTrabajados"
          type="number"
          value={form.diasTrabajados}
          onChange={handleChange}
          required
          sx={{ mt: 2, mb: 3 }}
        />

        {/* Remuneraciones */}
        <Typography variant="h6" mt={2}>
          4. Remuneraciones (Conceptos Remunerativos)
        </Typography>
        <TextField
          fullWidth
          label="Sueldo básico"
          name="sueldoBasico"
          type="number"
          value={form.sueldoBasico}
          onChange={handleChange}
          required
          sx={{ mt: 1 }}
        />
        <TextField
          fullWidth
          label="Antigüedad"
          name="antiguedad"
          type="number"
          value={form.antiguedad}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Horas extras"
          name="horasExtras"
          type="number"
          value={form.horasExtras}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Presentismo"
          name="presentismo"
          type="number"
          value={form.presentismo}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Adicionales por convenio"
          name="adicionalesConvenio"
          type="number"
          value={form.adicionalesConvenio}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Premios o bonos"
          name="premiosBonos"
          type="number"
          value={form.premiosBonos}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Comisiones"
          name="comisiones"
          type="number"
          value={form.comisiones}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Vacaciones"
          name="vacaciones"
          type="number"
          value={form.vacaciones}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Aguinaldo"
          name="aguinaldo"
          type="number"
          value={form.aguinaldo}
          onChange={handleChange}
          sx={{ mt: 2, mb: 3 }}
        />

        {/* Descuentos */}
        <Typography variant="h6" mt={2}>
          5. Descuentos (Conceptos No Remunerativos y Deducciones)
        </Typography>
        <TextField
          fullWidth
          label="Descuentos"
          name="descuentos"
          type="number"
          value={form.descuentos}
          onChange={handleChange}
          sx={{ mt: 1 }}
        />
        <TextField
          fullWidth
          label="Aportes jubilatorios"
          name="aportesJubilatorios"
          type="number"
          value={form.aportesJubilatorios}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Aporte a la obra social"
          name="obraSocial"
          type="number"
          value={form.obraSocial}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="PAMI"
          name="pami"
          type="number"
          value={form.pami}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Cuota sindical"
          name="cuotaSindical"
          type="number"
          value={form.cuotaSindical}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Impuesto a las ganancias"
          name="impuestoGanancias"
          type="number"
          value={form.impuestoGanancias}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Embargos"
          name="embargos"
          type="number"
          value={form.embargos}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Otros descuentos"
          name="otrosDescuentos"
          type="number"
          value={form.otrosDescuentos}
          onChange={handleChange}
          sx={{ mt: 2, mb: 3 }}
        />

        {/* Aportes Voluntarios */}
        <Typography variant="h6" mt={2}>
          6. Aportes Voluntarios
        </Typography>
        <TextField
          fullWidth
          label="Aportes voluntarios"
          name="aportesVoluntarios"
          type="number"
          value={form.aportesVoluntarios}
          onChange={handleChange}
          sx={{ mt: 1, mb: 3 }}
        />

        {/* Forma de pago */}
        <Typography variant="h6" mt={2}>
          7. Forma de Pago
        </Typography>
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel id="formaPago-label">Forma de Pago</InputLabel>
          <Select
            labelId="formaPago-label"
            id="formaPago"
            name="formaPago"
            value={form.formaPago}
            label="Forma de Pago"
            onChange={handleChange}
            required
          >
            <MenuItem value={"transferencia"}>Transferencia bancaria</MenuItem>
            <MenuItem value={"efectivo"}>Efectivo</MenuItem>
            <MenuItem value={"cheque"}>Cheque</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="CBU / Nº Cuenta bancaria"
          name="cbuCuenta"
          value={form.cbuCuenta}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Fecha acreditación"
          name="fechaAcreditacion"
          type="date"
          value={form.fechaAcreditacion}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          sx={{ mt: 2, mb: 3 }}
        />

        {/* Otros datos */}
        <Typography variant="h6" mt={2}>
          8. Otros datos
        </Typography>
        <TextField
          fullWidth
          label="Convenio colectivo"
          name="convenioColectivo"
          value={form.convenioColectivo}
          onChange={handleChange}
          sx={{ mt: 1 }}
        />
        <TextField
          fullWidth
          label="Régimen horario"
          name="regimenHorario"
          value={form.regimenHorario}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Licencias"
          name="licencias"
          value={form.licencias}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Asignaciones familiares"
          name="asignacionesFamiliares"
          value={form.asignacionesFamiliares}
          onChange={handleChange}
          sx={{ mt: 2, mb: 3 }}
        />

        <Button
          variant="contained"
          type="submit"
          sx={{ backgroundColor: "#CC5500" }}
        >
          Generar Liquidación
        </Button>
      </Box>

      <Footer />
    </Box>
  );
};

export default Liquidacion;
