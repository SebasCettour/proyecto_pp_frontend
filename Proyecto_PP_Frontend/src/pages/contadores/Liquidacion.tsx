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
