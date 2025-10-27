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
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { SelectChangeEvent } from "@mui/material/Select";

const steps = [
  "Buscar Empleado",
  "Datos del Empleador", 
  "Datos del Trabajador",
  "Período de Liquidación",
  "Remuneraciones",
  "Descuentos y Otros",
  "Resumen",
];

interface Employee {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  cuil: string;
  categoria: string;
  fechaIngreso: string;
  legajo: string;
}

const Liquidacion = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [searchDni, setSearchDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [employeeFound, setEmployeeFound] = useState<Employee | null>(null);
  const [searchError, setSearchError] = useState("");

  // Estado único para todos los datos
  const [form, setForm] = useState({
    // Datos del empleado (se llenarán automáticamente)
    empleadoId: "",
    nombreEmpleado: "",
    cuilEmpleado: "",
    categoria: "",
    fechaIngreso: "",
    legajo: "",
    // Datos del empleador
    razonSocial: "",
    cuitEmpleador: "",
    domicilioEmpleador: "",
    actividad: "",
    // Resto de campos
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

  const handleSearchEmployee = async () => {
    if (!searchDni) {
      setSearchError("Por favor ingrese un DNI");
      return;
    }

    setLoading(true);
    setSearchError("");

    try {
      // ✅ USAR LA NUEVA RUTA EN USUARIO.TS
      const response = await fetch(
        `http://localhost:4000/api/usuario/empleado-buscar/${searchDni}`
      );

      if (response.ok) {
        const employee = await response.json();
        setEmployeeFound(employee);

        // ✅ LLENAR FORMULARIO CON DATOS ENCONTRADOS
        setForm((prev) => ({
          ...prev,
          empleadoId: employee.id.toString(),
          nombreEmpleado: `${employee.apellido}, ${employee.nombre}`,
          cuilEmpleado: employee.cuil || employee.dni,
          categoria: employee.categoria,
          fechaIngreso: employee.fechaIngreso,
          legajo: employee.legajo,
        }));

        setSearchError("");
      } else if (response.status === 404) {
        setEmployeeFound(null);
        setSearchError("No se encontró un empleado con ese DNI");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error en la búsqueda");
      }
    } catch (error) {
      console.error('Error searching employee:', error);
      setSearchError("Error al buscar el empleado. Intente nuevamente.");
      setEmployeeFound(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSelectChange = (
    event:
      | React.ChangeEvent<{ name?: string; value: unknown }>
      | SelectChangeEvent<string>
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
    handleNext();
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Buscar Empleado por DNI
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="DNI del empleado"
                value={searchDni}
                onChange={(e) => setSearchDni(e.target.value)}
                placeholder="Ej: 12345678"
                required
              />
              <Button
                variant="contained"
                onClick={handleSearchEmployee}
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                {loading ? <CircularProgress size={24} /> : "Buscar"}
              </Button>
            </Box>

            {searchError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {searchError}
              </Alert>
            )}

            {employeeFound && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Empleado Encontrado
                  </Typography>
                  <Typography><strong>Nombre:</strong> {employeeFound.apellido}, {employeeFound.nombre}</Typography>
                  <Typography><strong>DNI:</strong> {employeeFound.dni}</Typography>
                  <Typography><strong>CUIL:</strong> {employeeFound.cuil}</Typography>
                  <Typography><strong>Categoría:</strong> {employeeFound.categoria}</Typography>
                  <Typography><strong>Legajo:</strong> {employeeFound.legajo}</Typography>
                  <Typography><strong>Fecha Ingreso:</strong> {new Date(employeeFound.fechaIngreso).toLocaleDateString()}</Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        );
      case 1:
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
      case 2:
        return (
          <>
            <TextField
              fullWidth
              label="Nombre y apellido"
              name="nombreEmpleado"
              value={form.nombreEmpleado}
              onChange={handleChange}
              required
              disabled
              sx={{ mt: 1 }}
            />
            <TextField
              fullWidth
              label="CUIL"
              name="cuilEmpleado"
              value={form.cuilEmpleado}
              onChange={handleChange}
              required
              disabled
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Categoría"
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              required
              disabled
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
              disabled
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Legajo"
              name="legajo"
              value={form.legajo}
              onChange={handleChange}
              disabled
              sx={{ mt: 2 }}
            />
          </>
        );
      case 3:
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
      case 4:
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
      case 5:
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
                <MenuItem value={"transferencia"}>
                  Transferencia bancaria
                </MenuItem>
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
      case 6:
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
                  if (activeStep === 0 && !employeeFound) {
                    setSearchError("Debe buscar y seleccionar un empleado primero");
                    return;
                  }
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
            {activeStep < steps.length - 1 && (
              <Button variant="contained" type="submit">
                {activeStep === steps.length - 2 ? "Ir al resumen" : "Siguiente"}
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