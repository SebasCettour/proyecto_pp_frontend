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
  "Buscar Empresa",
  "Buscar Empleado",
  "Datos del Trabajador",
  "Período de Liquidación",
  "Remuneraciones",
  "Descuentos y Otros",
  "Resumen",
];

interface Empresa {
  Id_Empresa: number;
  Nombre_Empresa: string;
  CUIL_CUIT: string;
  Direccion: string;
  Rubro: string;
}

interface Employee {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  cuil: string;
  categoria: string;
  fechaIngreso: string;
  legajo: string;
  convenioColectivo?: string;
}

const Liquidacion = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  // Estado para el menú de horas extras (debe estar fuera de renderStepContent)
  const [horasExtrasMenu, setHorasExtrasMenu] = useState(false);

  // Empresa
  const [searchEmpresa, setSearchEmpresa] = useState("");
  const [empresaFound, setEmpresaFound] = useState<Empresa | null>(null);
  const [empresaError, setEmpresaError] = useState("");

  // Empleado
  const [searchDni, setSearchDni] = useState("");
  const [employeeFound, setEmployeeFound] = useState<Employee | null>(null);
  const [searchError, setSearchError] = useState("");

  // Estado general
  const [form, setForm] = useState({
    razonSocial: "",
    cuitEmpleador: "",
    domicilioEmpleador: "",
    actividad: "",
    empleadoId: "",
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
    horasExtras50: "",
    horasExtras100: "",
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

  // =====================
  // 🔍 BUSCAR EMPRESA
  // =====================
  const handleSearchEmpresa = async () => {
    if (!searchEmpresa.trim()) {
      setEmpresaError("Por favor ingrese el nombre de la empresa");
      return;
    }

    setLoading(true);
    setEmpresaError("");

    try {
      const response = await fetch(
        `http://localhost:4000/api/empresa/buscar/${encodeURIComponent(
          searchEmpresa
        )}`
      );

      if (response.ok) {
        const empresa = await response.json();
        setEmpresaFound(empresa);
        setForm((prev) => ({
          ...prev,
          razonSocial: empresa.Nombre_Empresa,
          cuitEmpleador: empresa.CUIL_CUIT,
          domicilioEmpleador: empresa.Direccion,
          actividad: empresa.Rubro,
        }));
      } else if (response.status === 404) {
        setEmpresaFound(null);
        setEmpresaError("No se encontró una empresa con ese nombre");
      } else {
        throw new Error("Error en la búsqueda");
      }
    } catch (error) {
      console.error("Error buscando empresa:", error);
      setEmpresaError("Error al buscar la empresa. Intente nuevamente.");
      setEmpresaFound(null);
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // 🔍 BUSCAR EMPLEADO
  // =====================
  const handleSearchEmployee = async () => {
    if (!searchDni) {
      setSearchError("Por favor ingrese un DNI");
      return;
    }

    setLoading(true);
    setSearchError("");

    try {
      const response = await fetch(
        `http://localhost:4000/api/usuario/empleado-buscar/${searchDni}`
      );

      if (response.ok) {
        const employee = await response.json();
        setEmployeeFound(employee);
        setForm((prev) => ({
          ...prev,
          empleadoId: employee.id.toString(),
          nombreEmpleado: `${employee.apellido}, ${employee.nombre}`,
          cuilEmpleado: employee.cuil || employee.dni,
          categoria: employee.categoria,
          fechaIngreso: employee.fechaIngreso,
          legajo: employee.legajo,
        }));
      } else if (response.status === 404) {
        setEmployeeFound(null);
        setSearchError("No se encontró un empleado con ese DNI");
      } else {
        throw new Error("Error en la búsqueda");
      }
    } catch (error) {
      console.error("Error searching employee:", error);
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

  // =====================
  // 🧩 CONTENIDO DE CADA PASO
  // =====================
  // Cálculo de descuentos automáticos
  const calcularDescuentos = (sueldo: number, adicional: number) => {
    const base = sueldo + adicional;
    return {
      jubilacion: +(base * 0.11).toFixed(2),
      pami: +(base * 0.03).toFixed(2),
      obraSocial: +(base * 0.03).toFixed(2),
      sindicato: +(base * 0.02).toFixed(2),
    };
  };

  // Para el adicional por asistencia y puntualidad (8.33%)
  const calcularAdicional = (sueldo: number, checked: boolean) =>
    checked ? +(sueldo * 0.0833).toFixed(2) : 0;

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Buscar Empresa por nombre
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Nombre de la empresa"
                value={searchEmpresa}
                onChange={(e) => setSearchEmpresa(e.target.value)}
                placeholder="Ej: Supermercado La Estrella"
                required
              />
              <Button
                variant="contained"
                onClick={handleSearchEmpresa}
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                {loading ? <CircularProgress size={24} /> : "Buscar"}
              </Button>
            </Box>

            {empresaError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {empresaError}
              </Alert>
            )}

            {empresaFound && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Empresa Encontrada
                  </Typography>
                  <Typography>
                    <strong>Razón social:</strong> {empresaFound.Nombre_Empresa}
                  </Typography>
                  <Typography>
                    <strong>CUIT:</strong> {empresaFound.CUIL_CUIT}
                  </Typography>
                  <Typography>
                    <strong>Rubro:</strong> {empresaFound.Rubro}
                  </Typography>
                  <Typography>
                    <strong>Dirección:</strong> {empresaFound.Direccion}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case 1:
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
                  <Typography>
                    <strong>Nombre:</strong> {employeeFound.apellido},{" "}
                    {employeeFound.nombre}
                  </Typography>
                  <Typography>
                    <strong>DNI:</strong> {employeeFound.dni}
                  </Typography>
                  <Typography>
                    <strong>CUIL:</strong> {employeeFound.cuil}
                  </Typography>
                  <Typography>
                    <strong>Convenio Colectivo:</strong>{" "}
                    {employeeFound.convenioColectivo}
                  </Typography>
                  <Typography>
                    <strong>Categoría:</strong> {employeeFound.categoria}
                  </Typography>
                  <Typography>
                    <strong>Legajo:</strong> {employeeFound.legajo}
                  </Typography>
                  <Typography>
                    <strong>Fecha Ingreso:</strong>{" "}
                    {new Date(employeeFound.fechaIngreso).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case 2: {
        // Paso 3: Remuneraciones y descuentos automáticos
        const sueldo = parseFloat(form.sueldoBasico) || 0;
        const adicionalChecked = form.presentismo === "true";
        const adicional = calcularAdicional(sueldo, adicionalChecked);
        const descuentos = calcularDescuentos(sueldo, adicional);
        return (
          <Box>
            <Typography
              variant="h4"
              sx={{ mb: 4, fontWeight: 800, color: "#1565C0", textAlign: 'center' }}
            >
              Liquidación: Haberes y Descuentos
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {/* Haberes */}
              <Card
                sx={{
                  minWidth: 400,
                  flex: 1,
                  background: "#e3f2fd",
                  boxShadow: 6,
                  p: 3,
                  fontSize: 22,
                }}
              >
                <CardContent>
                  <Typography
                    variant="h5"
                    sx={{ mb: 3, fontWeight: 700 }}
                    color="primary"
                  >
                    Haberes
                  </Typography>
                  <TextField
                    label="Sueldo básico"
                    name="sueldoBasico"
                    type="number"
                    value={form.sueldoBasico}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 0, step: 0.01, style: { fontSize: 22 } } }}
                    sx={{ mb: 3, width: "100" }}
                    required
                  />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <input
                      type="checkbox"
                      id="presentismo"
                      name="presentismo"
                      checked={adicionalChecked}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          presentismo: e.target.checked ? "true" : "false",
                        }))
                      }
                      style={{ transform: "scale(1.5)", marginRight: 12 }}
                    />
                    <label
                      htmlFor="presentismo"
                      style={{ fontSize: 20, cursor: "pointer" }}
                    >
                      Adicional por asistencia y puntualidad (8,33%)
                    </label>
                  </Box>
                  {adicionalChecked && (
                    <Typography
                      sx={{ ml: 4, color: "#388e3c", fontWeight: 600, fontSize: 20 }}
                    >
                      +${adicional} de adicional
                    </Typography>
                  )}
                  <Box sx={{ mt: 4 }}>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{ fontSize: 20, px: 4, py: 2, borderRadius: 2 }}
                      onClick={() => setHorasExtrasMenu((v) => !v)}
                    >
                      {horasExtrasMenu ? 'Ocultar Horas Extras' : 'Agregar Horas Extras'}
                    </Button>
                    {horasExtrasMenu && (
                      <Box sx={{ mt: 3, pl: 1, pr: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          label="Horas extras al 50%"
                          name="horasExtras50"
                          type="number"
                          value={form.horasExtras50 || ''}
                          onChange={handleChange}
                          InputProps={{ inputProps: { min: 0, step: 0.01, style: { fontSize: 20 } } }}
                          sx={{ width: '100%' }}
                        />
                        <TextField
                          label="Horas extras al 100%"
                          name="horasExtras100"
                          type="number"
                          value={form.horasExtras100 || ''}
                          onChange={handleChange}
                          InputProps={{ inputProps: { min: 0, step: 0.01, style: { fontSize: 20 } } }}
                          sx={{ width: '100%' }}
                        />
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
              {/* Descuentos */}
              <Card
                sx={{
                  minWidth: 400,
                  flex: 1,
                  background: "#f5f5f5",
                  boxShadow: 6,
                  p: 3,
                  fontSize: 22,
                }}
              >
                <CardContent>
                  <Typography
                    variant="h5"
                    sx={{ mb: 3, fontWeight: 700 }}
                    color="primary"
                  >
                    Descuentos automáticos
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Typography sx={{ fontSize: 20 }}>
                      Jubilación – Ley 24.241 (11%): <strong>${descuentos.jubilacion}</strong>
                    </Typography>
                    <Typography sx={{ fontSize: 20 }}>
                      Ley 19.032 – INSSJP (PAMI, 3%): <strong>${descuentos.pami}</strong>
                    </Typography>
                    <Typography sx={{ fontSize: 20 }}>
                      Obra social (3%): <strong>${descuentos.obraSocial}</strong>
                    </Typography>
                    <Typography sx={{ fontSize: 20 }}>
                      Sindicato – Art. 100 CCT 130/75 (2%): <strong>${descuentos.sindicato}</strong>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        );
      }
      default:
        return <Typography>Resto de pasos en desarrollo...</Typography>;
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
          onSubmit={(e) => {
            e.preventDefault();
            if (activeStep === 0 && !empresaFound) {
              setEmpresaError("Debe buscar y seleccionar una empresa primero");
              return;
            }
            if (activeStep === 1 && !employeeFound) {
              setSearchError("Debe buscar y seleccionar un empleado primero");
              return;
            }
            handleNext();
          }}
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
