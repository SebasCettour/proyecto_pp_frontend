import React, { useState } from "react";
import {
  Typography,
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Container,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { SelectChangeEvent } from "@mui/material/Select";

const steps = [
  "Datos del Empleador",
  "Datos del Trabajador",
  "Período de Liquidación",
  "Remuneraciones",
  "Descuentos y Otros",
  "Resumen",
];

const Liquidacion = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  // Estado único para todos los datos
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | React.ChangeEvent<{ name?: string; value: unknown; }>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSelectChange = (
    event: React.ChangeEvent<{ name?: string; value: unknown; }> | SelectChangeEvent<string>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí puedes hacer el cálculo y/o enviar los datos
    setActiveStep(steps.length - 1);
  };

  // Ejemplo de campos por paso (puedes personalizar según el convenio seleccionado)
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              fullWidth
              label="Razón social"
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
              label="Domicilio"
              name="domicilioEmpleador"
              value={form.domicilioEmpleador}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Actividad"
              name="actividad"
              value={form.actividad}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
          </>
        );
      case 1:
        return (
          <>
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
              label="Categoría"
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
              label="Legajo"
              name="legajo"
              value={form.legajo}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
          </>
        );
      case 2:
        return (
          <>
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
              sx={{ mt: 2 }}
            />
          </>
        );
      case 3:
        return (
          <>
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
              sx={{ mt: 2 }}
            />
          </>
        );
      case 4:
        return (
          <>
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
              label="Obra social"
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
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Aportes voluntarios"
              name="aportesVoluntarios"
              type="number"
              value={form.aportesVoluntarios}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="formaPago-label">Forma de Pago</InputLabel>
              <Select
                labelId="formaPago-label"
                id="formaPago"
                name="formaPago"
                value={form.formaPago}
                label="Forma de Pago"
                onChange={handleSelectChange}
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
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Convenio colectivo"
              name="convenioColectivo"
              value={form.convenioColectivo}
              onChange={handleChange}
              sx={{ mt: 2 }}
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
              sx={{ mt: 2 }}
            />
          </>
        );
      case 5:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Resumen de Liquidación
            </Typography>
            <pre
              style={{
                background: "#f5f5f5",
                padding: 16,
                borderRadius: 8,
              }}
            >
              {JSON.stringify(form, null, 2)}
            </pre>
            <Button
              variant="contained"
              color="success"
              onClick={() => alert("Liquidación generada!")}
            >
              Confirmar y Generar
            </Button>
          </Box>
        );
      default:
        return null;
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
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, px: 4 }}>
        <Button
          component={Link}
          to="/contadores"
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
      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box
          component="form"
          onSubmit={
            activeStep === steps.length - 2
              ? handleSubmit
              : (e) => {
                  e.preventDefault();
                  handleNext();
                }
          }
          sx={{
            backgroundColor: "#fff",
            borderRadius: 2,
            p: 4,
            mt: 4,
            mb: 4,
          }}
        >
          {renderStepContent(activeStep)}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Atrás
            </Button>
            {activeStep < steps.length - 2 && (
              <Button variant="contained" type="submit">
                Siguiente
              </Button>
            )}
          </Box>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
};

export default Liquidacion;
