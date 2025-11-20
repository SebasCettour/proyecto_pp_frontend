import React, { useState, useEffect, useCallback } from "react";
import Checkbox from "@mui/material/Checkbox";
import {
  Typography,
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Container,
  TextField as MuiTextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import BackButton from "../../components/BackButton";

const steps = [
  "Buscar Empresa",
  "Buscar Empleado",
  "Liquidación de Haberes",
  "Revisión Final y Confirmación",
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
  const [jornadaAccordionOpen, setJornadaAccordionOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [periodo, setPeriodo] = useState<string>("");

  // Empresa
  const [searchEmpresa, setSearchEmpresa] = useState("");
  const [empresaFound, setEmpresaFound] = useState<Empresa | null>(null);
  const [empresaError, setEmpresaError] = useState("");

  // Empleado
  const [searchDni, setSearchDni] = useState("");
  const [employeeFound, setEmployeeFound] = useState<Employee | null>(null);
  const [searchError, setSearchError] = useState("");
  const [multipleEmployees, setMultipleEmployees] = useState<Employee[]>([]);

  // Conceptos
  const [conceptos, setConceptos] = useState<any[]>([]);
  const [valores, setValores] = useState<{ [key: string]: string }>({});
  const [asistenciaActiva, setAsistenciaActiva] = useState(true);
  const [sacActivo, setSacActivo] = useState(false);

  // Estados para Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "warning" | "info">("info");

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  const [conceptosLoading, setConceptosLoading] = useState(false);
  const [valoresCalculados, setValoresCalculados] = useState<{
    [key: string]: number;
  }>({});
  const [valorHoraNormal, setValorHoraNormal] = useState<number>(0);
  const [tipoJornada, setTipoJornada] = useState<
    "completa" | "dos_tercios" | "media"
  >("completa");

  // Estados para el input de sueldo básico
  const [sueldoDisplay, setSueldoDisplay] = useState<string>("");
  const [editingSueldo, setEditingSueldo] = useState<boolean>(false);

  // Estados para suma fija no remunerativa
  const [sumaFijaNoRemunerativa, setSumaFijaNoRemunerativa] =
    useState<string>("");
  const [sumaFijaDisplay, setSumaFijaDisplay] = useState<string>("");
  const [editingSumaFija, setEditingSumaFija] = useState<boolean>(false);

  // Estados para horas extras
  const [horasExtras50, setHorasExtras50] = useState<string>("");
  const [horasExtras100, setHorasExtras100] = useState<string>("");

  // Estado para adicional de traslado
  const [adicionalTrasladoSeleccionado, setAdicionalTrasladoSeleccionado] =
    useState<string>("");

  // Estado para afiliación al sindicato
  const [esAfiliadoSindicato, setEsAfiliadoSindicato] = useState(true);

  // Estados para guardar liquidación
  const [guardandoLiquidacion, setGuardandoLiquidacion] = useState(false);
  const [liquidacionGuardada, setLiquidacionGuardada] = useState(false);

  // Función para verificar si el periodo es válido para SAC
  const esPeriodoSAC = (periodo: string): boolean => {
    if (!periodo) return false;
    const mes = parseInt(periodo.split("-")[1]);
    return mes === 6 || mes === 12; // Junio o Diciembre
  };

  const calcularLiquidacion = useCallback(async () => {
    const sueldoBasicoKey = Object.keys(valores).find(
      (k) => k.toLowerCase() === "sueldo básico"
    );
    const sueldoBasico = sueldoBasicoKey
      ? parseFloat(valores[sueldoBasicoKey]) || 0
      : 0;

    if (!employeeFound || sueldoBasico <= 0) {
      setValoresCalculados({});
      setValorHoraNormal(0);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:4000/api/liquidacion/calcular",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            dni: employeeFound.dni,
            sueldoBasico: sueldoBasico.toString(),
            tipoJornada,
            periodo,
            asistenciaActiva,
            sacActivo,
            sumaFijaNoRemunerativa: sumaFijaNoRemunerativa || "0",
            horasExtras50: horasExtras50 || "0",
            horasExtras100: horasExtras100 || "0",
            adicionalTrasladoSeleccionado: adicionalTrasladoSeleccionado || "",
            esAfiliadoSindicato,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setValorHoraNormal(data.valorHoraNormal || 0);

        const nuevosValores: { [key: string]: number } = {};
        data.conceptos.forEach((c: any) => {
          nuevosValores[c.nombre] = c.valorCalculado;
        });
        setValoresCalculados(nuevosValores);
      } else {
        console.error("Error calculando liquidación");
      }
    } catch (error) {
      console.error("Error en calcularLiquidacion:", error);
    }
  }, [
    valores,
    employeeFound,
    tipoJornada,
    periodo,
    asistenciaActiva,
    sacActivo,
    sumaFijaNoRemunerativa,
    horasExtras50,
    horasExtras100,
    adicionalTrasladoSeleccionado,
    esAfiliadoSindicato,
  ]);

  useEffect(() => {
    calcularLiquidacion();
  }, [calcularLiquidacion]);

  // Función para guardar la liquidación
  const guardarLiquidacion = async () => {
    if (!employeeFound || !periodo) {
      setSnackbarMessage("Faltan datos del empleado o periodo");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    setGuardandoLiquidacion(true);
    setLiquidacionGuardada(false);

    try {
      // Calcular totales
      const sueldoBasicoKey = Object.keys(valores).find(
        (k) => k.toLowerCase() === "sueldo básico"
      );
      const sueldoBasico = sueldoBasicoKey
        ? parseFloat(valores[sueldoBasicoKey]) || 0
        : 0;

      const sumaFija = sumaFijaNoRemunerativa
        ? parseFloat(
            sumaFijaNoRemunerativa.replace(/\./g, "").replace(",", ".")
          )
        : 0;

      // Obtener otros conceptos filtrados
      const otrosConceptos = conceptos.filter(
        (c) => !c.nombre.toLowerCase().includes("horas extras")
      );

      const totalOtrosConceptos = otrosConceptos
        .filter((c) => c.tipo !== "descuento")
        .reduce((sum, c) => sum + (valoresCalculados[c.nombre] || 0), 0);

      const horasExtras50Val = valoresCalculados["Horas extras al 50%"] || 0;
      const horasExtras100Val = valoresCalculados["Horas extras al 100%"] || 0;

      const totalHaberes =
        sueldoBasico +
        sumaFija +
        totalOtrosConceptos +
        horasExtras50Val +
        horasExtras100Val;

      const totalDescuentos = otrosConceptos
        .filter((c) => c.tipo === "descuento")
        .reduce((sum, c) => sum + (valoresCalculados[c.nombre] || 0), 0);

      const netoAPagar = totalHaberes - totalDescuentos;

      // Calcular total remunerativo y no remunerativo
      const totalRemunerativo =
        sueldoBasico +
        otrosConceptos
          .filter((c) => c.tipo !== "descuento" && !c.suma_fija_no_remunerativa)
          .reduce((sum, c) => sum + (valoresCalculados[c.nombre] || 0), 0) +
        horasExtras50Val +
        horasExtras100Val;

      const totalNoRemunerativo =
        sumaFija +
        otrosConceptos
          .filter((c) => c.tipo !== "descuento" && c.suma_fija_no_remunerativa)
          .reduce((sum, c) => sum + (valoresCalculados[c.nombre] || 0), 0);

      // Construir array de conceptos detalle
      const conceptosDetalle = [];

      // Agregar sueldo básico
      if (sueldoBasico > 0) {
        conceptosDetalle.push({
          concepto: "Sueldo Básico",
          monto: sueldoBasico,
        });
      }

      // Agregar suma fija no remunerativa
      if (sumaFija > 0) {
        conceptosDetalle.push({
          concepto: "Suma Fija No Remunerativa",
          monto: sumaFija,
        });
      }

      // Agregar otros conceptos con valor
      otrosConceptos.forEach((c) => {
        const valor = valoresCalculados[c.nombre] || 0;
        if (valor !== 0) {
          conceptosDetalle.push({ concepto: c.nombre, monto: valor });
        }
      });

      // Agregar horas extras
      if (horasExtras50Val > 0) {
        conceptosDetalle.push({
          concepto: "Horas extras al 50%",
          monto: horasExtras50Val,
        });
      }
      if (horasExtras100Val > 0) {
        conceptosDetalle.push({
          concepto: "Horas extras al 100%",
          monto: horasExtras100Val,
        });
      }

      const body = {
        idEmpleado: employeeFound.id,
        periodo: periodo,
        totalRemunerativo: Math.round(totalRemunerativo * 100) / 100,
        totalNoRemunerativo: Math.round(totalNoRemunerativo * 100) / 100,
        totalHaberes: Math.round(totalHaberes * 100) / 100,
        totalDescuentos: Math.round(totalDescuentos * 100) / 100,
        netoAPagar: Math.round(netoAPagar * 100) / 100,
        sumaFijaNoRemunerativa: Math.round(sumaFija * 100) / 100,
        horasExtras50: parseFloat(horasExtras50 || "0"),
        horasExtras100: parseFloat(horasExtras100 || "0"),
        sacActivo: sacActivo,
        asistenciaActiva: asistenciaActiva,
        esAfiliadoSindicato: esAfiliadoSindicato,
        adicionalTrasladoSeleccionado: adicionalTrasladoSeleccionado || null,
        tipoJornada: tipoJornada,
        conceptosDetalle: conceptosDetalle,
        estado: "confirmada",
      };

      const response = await fetch(
        "http://localhost:4000/api/liquidacion/guardar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLiquidacionGuardada(true);
        setSnackbarMessage(`Liquidación guardada exitosamente. ID: ${data.idLiquidacion}`);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        
        setTimeout(() => {
          navigate("/contadores");
        }, 100);
      } else {
        const error = await response.json();
        setSnackbarMessage(`Error al guardar: ${error.message}`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error guardando liquidación:", error);
      setSnackbarMessage("Error al guardar la liquidación");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setGuardandoLiquidacion(false);
    }
  };

  useEffect(() => {
    if (!editingSueldo) {
      const raw = valores["Sueldo básico"] || "";
      let formatted = "";
      if (raw) {
        const num = Number(raw);
        if (!isNaN(num)) {
          formatted = num.toLocaleString("es-AR");
        } else {
          formatted = raw;
        }
      }
      setSueldoDisplay(formatted);
    }
  }, [valores["Sueldo básico"], editingSueldo]);

  useEffect(() => {
    if (activeStep === 2 && conceptos.length === 0) {
      setConceptosLoading(true);
      fetch("http://localhost:4000/api/conceptos/cct130_75")
        .then((res) => res.json())
        .then((data) => {
          setConceptos(data);
          const inicial: { [key: string]: string } = {};
          data.forEach((c: any) => (inicial[c.nombre] = ""));
          setValores(inicial);
        })
        .finally(() => setConceptosLoading(false));
    }
  }, [activeStep, conceptos.length]);

  // --- Buscar empresa ---
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

  // --- Buscar empleado ---
  const handleSearchEmployee = async () => {
    if (!searchDni) {
      setSearchError("Por favor ingrese un DNI, nombre o apellido");
      return;
    }

    setLoading(true);
    setSearchError("");
    setMultipleEmployees([]);
    setEmployeeFound(null);

    try {
      const response = await fetch(
        `http://localhost:4000/api/usuario/empleado-buscar/${encodeURIComponent(
          searchDni
        )}`
      );

      if (response.ok) {
        const data = await response.json();

        // Verificar si es un array (múltiples resultados) o un objeto (un solo resultado)
        if (Array.isArray(data)) {
          setMultipleEmployees(data);
          setSearchError(
            `Se encontraron ${data.length} empleados. Seleccione uno:`
          );
        } else {
          setEmployeeFound(data);
        }
      } else if (response.status === 404) {
        setEmployeeFound(null);
        setMultipleEmployees([]);
        setSearchError("No se encontró un empleado con ese criterio");
      } else {
        throw new Error("Error en la búsqueda");
      }
    } catch (error) {
      console.error("Error buscando empleado:", error);
      setSearchError("Error al buscar el empleado. Intente nuevamente.");
      setEmployeeFound(null);
      setMultipleEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmployee = (employee: Employee) => {
    setEmployeeFound(employee);
    setMultipleEmployees([]);
    setSearchError("");
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  // Calcular otrosConceptos para usar en múltiples steps
  const otrosConceptos = conceptos
    .filter((c) => !c.nombre.toLowerCase().includes("horas extras"))
    .sort((a, b) => {
      const aIsSAC =
        a.nombre.toLowerCase().includes("sac") ||
        a.nombre.toLowerCase().includes("aguinaldo");
      const bIsSAC =
        b.nombre.toLowerCase().includes("sac") ||
        b.nombre.toLowerCase().includes("aguinaldo");

      if (aIsSAC && !bIsSAC) return 1;
      if (!aIsSAC && bIsSAC) return -1;
      return 0;
    });

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: 700,
                color: "primary.main",
                letterSpacing: 1,
              }}
            >
              Buscar Empresa por nombre
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
              <MuiTextField
                fullWidth
                label="Nombre de la empresa"
                value={searchEmpresa}
                onChange={(e) => setSearchEmpresa(e.target.value)}
                sx={{ background: "#f7fafd", borderRadius: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleSearchEmpresa}
                disabled={loading}
                sx={{
                  minWidth: 120,
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: 2,
                }}
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
              <Card
                sx={{
                  mt: 2,
                  background: "#f5faff",
                  borderRadius: 3,
                  boxShadow: 2,
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    color="primary"
                    sx={{ fontWeight: 700, mb: 1 }}
                  >
                    {empresaFound.Nombre_Empresa}
                  </Typography>
                  <Typography sx={{ fontSize: 15, color: "text.secondary" }}>
                    CUIT: {empresaFound.CUIL_CUIT}
                  </Typography>
                  <Typography sx={{ fontSize: 15, color: "text.secondary" }}>
                    Rubro: {empresaFound.Rubro}
                  </Typography>
                  <Typography sx={{ fontSize: 15, color: "text.secondary" }}>
                    Dirección: {empresaFound.Direccion}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: 700,
                color: "primary.main",
                letterSpacing: 1,
              }}
            >
              Buscar Empleado por DNI, Nombre o Apellido
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
              <MuiTextField
                fullWidth
                label="DNI, Nombre o Apellido"
                value={searchDni}
                onChange={(e) => setSearchDni(e.target.value)}
                placeholder="Ej: 12345678, Juan, Pérez"
                sx={{ background: "#f7fafd", borderRadius: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleSearchEmployee}
                disabled={loading}
                sx={{
                  minWidth: 120,
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: 2,
                }}
              >
                {loading ? <CircularProgress size={24} /> : "Buscar"}
              </Button>
            </Box>
            {searchError && (
              <Alert
                severity={multipleEmployees.length > 0 ? "info" : "error"}
                sx={{ mb: 2 }}
              >
                {searchError}
              </Alert>
            )}
            {multipleEmployees.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Seleccione un empleado:
                </Typography>
                {multipleEmployees.map((emp) => (
                  <Card
                    key={emp.id}
                    sx={{
                      mb: 2,
                      background: "#f5faff",
                      borderRadius: 3,
                      boxShadow: 2,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow: 4,
                        transform: "translateY(-2px)",
                      },
                    }}
                    onClick={() => handleSelectEmployee(emp)}
                  >
                    <CardContent>
                      <Typography
                        variant="h6"
                        color="primary"
                        sx={{ fontWeight: 700, mb: 1 }}
                      >
                        {emp.apellido}, {emp.nombre}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 15, color: "text.secondary" }}
                      >
                        DNI: {emp.dni}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 15, color: "text.secondary" }}
                      >
                        CUIL: {emp.cuil}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 15, color: "text.secondary" }}
                      >
                        Categoría: {emp.categoria}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 15, color: "text.secondary" }}
                      >
                        Fecha Ingreso:{" "}
                        {new Date(emp.fechaIngreso).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
            {employeeFound && (
              <Card
                sx={{
                  mt: 2,
                  background: "#f5faff",
                  borderRadius: 3,
                  boxShadow: 2,
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    color="primary"
                    sx={{ fontWeight: 700, mb: 1 }}
                  >
                    {employeeFound.apellido}, {employeeFound.nombre}
                  </Typography>
                  <Typography sx={{ fontSize: 15, color: "text.secondary" }}>
                    DNI: {employeeFound.dni}
                  </Typography>
                  <Typography sx={{ fontSize: 15, color: "text.secondary" }}>
                    CUIL: {employeeFound.cuil}
                  </Typography>
                  <Typography sx={{ fontSize: 15, color: "text.secondary" }}>
                    Categoría: {employeeFound.categoria}
                  </Typography>
                  <Typography sx={{ fontSize: 15, color: "text.secondary" }}>
                    Fecha Ingreso:{" "}
                    {new Date(employeeFound.fechaIngreso).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case 2:
        if (conceptosLoading)
          return (
            <Typography sx={{ color: "primary.main", fontWeight: 500 }}>
              Cargando conceptos...
            </Typography>
          );
        if (!conceptos.length)
          return (
            <Typography sx={{ color: "text.secondary" }}>
              No hay conceptos disponibles.
            </Typography>
          );

        return (
          <Box>
            <Typography
              variant="h5"
              sx={{
                mb: 2,
                color: "primary.main",
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              Liquidación de Haberes
            </Typography>

            <Accordion
              sx={{
                mb: 3,
                boxShadow: 2,
                borderRadius: 2,
                background: "#f7fafd",
              }}
              expanded={jornadaAccordionOpen}
              onChange={(_, expanded) => setJornadaAccordionOpen(expanded)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600, color: "primary.main" }}>
                  Tipo de Jornada:{" "}
                  {tipoJornada === "completa"
                    ? "Completa"
                    : tipoJornada === "dos_tercios"
                    ? "2/3 Jornada"
                    : "Media Jornada"}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                  <Button
                    variant={
                      tipoJornada === "completa" ? "contained" : "outlined"
                    }
                    onClick={() => {
                      setTipoJornada("completa");
                      setJornadaAccordionOpen(false);
                    }}
                    sx={{ fontWeight: 600, borderRadius: 2 }}
                  >
                    Completa
                  </Button>
                  <Button
                    variant={
                      tipoJornada === "dos_tercios" ? "contained" : "outlined"
                    }
                    onClick={() => {
                      setTipoJornada("dos_tercios");
                      setJornadaAccordionOpen(false);
                    }}
                    sx={{ fontWeight: 600, borderRadius: 2 }}
                  >
                    2/3 Jornada
                  </Button>
                  <Button
                    variant={tipoJornada === "media" ? "contained" : "outlined"}
                    onClick={() => {
                      setTipoJornada("media");
                      setJornadaAccordionOpen(false);
                    }}
                    sx={{ fontWeight: 600, borderRadius: 2 }}
                  >
                    Media Jornada
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                mb: 3,
                gap: 4,
                justifyContent: "space-between",
              }}
            >
              <MuiTextField
                label="Período a liquidar"
                type="month"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                sx={{ width: 260, background: "#f7fafd", borderRadius: 2 }}
                InputLabelProps={{ shrink: true }}
              />

              {sacActivo && !esPeriodoSAC(periodo) && periodo && (
                <Alert severity="warning" sx={{ maxWidth: 400 }}>
                  ⚠️ El SAC generalmente se paga en <strong>junio</strong> y{" "}
                  <strong>diciembre</strong>. Has seleccionado otro mes.
                </Alert>
              )}

              {employeeFound && (
                <Card
                  sx={{
                    minWidth: 260,
                    maxWidth: 320,
                    background: "#f5faff",
                    borderRadius: 3,
                    boxShadow: 2,
                    ml: "auto",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      color="primary"
                      sx={{ fontWeight: 700, mb: 1 }}
                    >
                      {employeeFound.apellido}, {employeeFound.nombre}
                    </Typography>
                    <Typography sx={{ fontSize: 15, color: "text.secondary" }}>
                      DNI: {employeeFound.dni}
                    </Typography>
                    <Typography sx={{ fontSize: 15, color: "text.secondary" }}>
                      CUIL: {employeeFound.cuil}
                    </Typography>
                    <Typography sx={{ fontSize: 15, color: "text.secondary" }}>
                      Categoría: {employeeFound.categoria}
                    </Typography>
                    <Typography sx={{ fontSize: 15, color: "text.secondary" }}>
                      Fecha Ingreso:{" "}
                      {new Date(
                        employeeFound.fechaIngreso
                      ).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Box>

            {/* CONCEPTOS AGRUPADOS POR SECCIONES */}
            <Box sx={{ mt: 3 }}>
              {/* Sección: Sueldo Básico y Suma Fija */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    background: "#1976d2",
                    color: "#ffffff",
                    border: "1px solid #1565c0",
                    borderRadius: 2,
                    mb: 2,
                    p: 1.5,
                  }}
                >
                  Conceptos Básicos
                </Typography>
                {otrosConceptos
                  .filter((c) => c.nombre.toLowerCase() === "sueldo básico")
                  .map((c, index) => {
                    return (
                      <React.Fragment key={index}>
                        <Card
                          sx={{
                            background: "#fff",
                            borderRadius: 2,
                            boxShadow: 2,
                            border: "1px solid #e0e0e0",
                            transition: "all 0.2s ease",
                            mb: 2,
                            "&:hover": {
                              boxShadow: 4,
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          <CardContent
                            sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: 2,
                              }}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: 600,
                                    color: "#000",
                                    fontSize: 19,
                                  }}
                                >
                                  {c.nombre}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-end",
                                  minWidth: 150,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "text.secondary",
                                    fontSize: 11,
                                    mb: 0.5,
                                    display: "block",
                                  }}
                                >
                                  Ingrese monto
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontWeight: 700,
                                      color: "#000",
                                      fontSize: 20,
                                    }}
                                  >
                                    $
                                  </Typography>
                                  <input
                                    type="text"
                                    value={
                                      editingSueldo
                                        ? valores[c.nombre] || ""
                                        : sueldoDisplay
                                    }
                                    inputMode="decimal"
                                    pattern="[0-9.,]*"
                                    maxLength={14}
                                    onChange={(
                                      e: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                      const typed = e.target.value;
                                      // Solo permitir números, punto y coma
                                      let cleaned = typed.replace(/[^0-9.,]/g, "");
                                      
                                      // Contar puntos y comas
                                      const commaCount = (cleaned.match(/,/g) || []).length;
                                      const dotCount = (cleaned.match(/\./g) || []).length;
                                      
                                      // Si tiene coma, usarla como decimal y eliminar puntos (miles)
                                      if (commaCount > 0) {
                                        cleaned = cleaned.replace(/\./g, "").replace(",", ".");
                                      }
                                      
                                      // Validar formato: solo un punto decimal
                                      const parts = cleaned.split(".");
                                      if (parts.length > 2) {
                                        return; // No permitir más de un punto decimal
                                      }
                                      
                                      let intPart = parts[0] ? parts[0].slice(0, 8) : "";
                                      let decPart = parts[1] ? parts[1].slice(0, 2) : "";
                                      
                                      let cleanVal = intPart + (parts.length > 1 ? "." + decPart : "");
                                      
                                      setValores((prev) => ({
                                        ...prev,
                                        [c.nombre]: cleanVal,
                                      }));
                                      if (editingSueldo) {
                                        setSueldoDisplay(cleanVal);
                                      }
                                    }}
                                    onFocus={() => {
                                      setEditingSueldo(true);
                                      setSueldoDisplay(valores[c.nombre] || "");
                                    }}
                                    onBlur={(
                                      e: React.FocusEvent<HTMLInputElement>
                                    ) => {
                                      setEditingSueldo(false);
                                      let raw = valores[c.nombre] || "";
                                      let formatted = "";
                                      let newRaw = raw;
                                      if (raw) {
                                        let num = Number(raw);
                                        if (!isNaN(num)) {
                                          if (num > 99999999.98) {
                                            newRaw = "99999999.98";
                                            num = 99999999.98;
                                          }
                                          formatted =
                                            num.toLocaleString("es-AR");
                                        } else {
                                          formatted = "";
                                          newRaw = "";
                                        }
                                      }
                                      if (newRaw !== raw) {
                                        setValores((prev) => ({
                                          ...prev,
                                          [c.nombre]: newRaw,
                                        }));
                                      }
                                      setSueldoDisplay(formatted);
                                    }}
                                    onWheel={(
                                      e: React.WheelEvent<HTMLInputElement>
                                    ) => e.currentTarget.blur()}
                                    onKeyDown={(
                                      e: React.KeyboardEvent<HTMLInputElement>
                                    ) => {
                                      if (
                                        e.key === "ArrowUp" ||
                                        e.key === "ArrowDown"
                                      )
                                        e.preventDefault();
                                    }}
                                    style={{
                                      width: "140px",
                                      padding: "10px 12px",
                                      border: "2px solid #000",
                                      outline: "none",
                                      background: "#fff",
                                      fontSize: "18px",
                                      fontWeight: 700,
                                      textAlign: "right",
                                      borderRadius: "8px",
                                      color: "#000",
                                      boxShadow:
                                        "0 2px 4px rgba(0, 0, 0, 0.15)",
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>

                        {/* Suma Fija No Remunerativa */}
                        <Card
                          sx={{
                            background: "#fff",
                            borderRadius: 2,
                            boxShadow: 2,
                            border: "1px solid #e0e0e0",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              boxShadow: 4,
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          <CardContent
                            sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: 2,
                              }}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: 600,
                                    color: "#000",
                                    fontSize: 19,
                                  }}
                                >
                                  Suma Fija No Remunerativa
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-end",
                                  minWidth: 150,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "text.secondary",
                                    fontSize: 11,
                                    mb: 0.5,
                                    display: "block",
                                  }}
                                >
                                  Ingrese monto
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontWeight: 700,
                                      color: "#000",
                                      fontSize: 20,
                                    }}
                                  >
                                    $
                                  </Typography>
                                  <input
                                    type="text"
                                    value={
                                      editingSumaFija
                                        ? sumaFijaNoRemunerativa
                                        : sumaFijaDisplay
                                    }
                                    inputMode="decimal"
                                    pattern="[0-9.,]*"
                                    maxLength={14}
                                    onChange={(
                                      e: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                      const typed = e.target.value;
                                      // Solo permitir números, punto y coma
                                      let cleaned = typed.replace(/[^0-9.,]/g, "");
                                      
                                      // Contar puntos y comas
                                      const commaCount = (cleaned.match(/,/g) || []).length;
                                      const dotCount = (cleaned.match(/\./g) || []).length;
                                      
                                      // Si tiene coma, usarla como decimal y eliminar puntos (miles)
                                      if (commaCount > 0) {
                                        cleaned = cleaned.replace(/\./g, "").replace(",", ".");
                                      }
                                      
                                      // Validar formato: solo un punto decimal
                                      const parts = cleaned.split(".");
                                      if (parts.length > 2) {
                                        return; // No permitir más de un punto decimal
                                      }
                                      
                                      let intPart = parts[0] ? parts[0].slice(0, 8) : "";
                                      let decPart = parts[1] ? parts[1].slice(0, 2) : "";
                                      
                                      let cleanVal = intPart + (parts.length > 1 ? "." + decPart : "");
                                      
                                      setSumaFijaNoRemunerativa(cleanVal);
                                      if (editingSumaFija) {
                                        setSumaFijaDisplay(cleanVal);
                                      }
                                    }}
                                    onFocus={() => {
                                      setEditingSumaFija(true);
                                      setSumaFijaDisplay(
                                        sumaFijaNoRemunerativa
                                      );
                                    }}
                                    onBlur={(
                                      e: React.FocusEvent<HTMLInputElement>
                                    ) => {
                                      setEditingSumaFija(false);
                                      let raw = sumaFijaNoRemunerativa;
                                      let formatted = "";
                                      let newRaw = raw;
                                      if (raw) {
                                        let num = Number(raw);
                                        if (!isNaN(num)) {
                                          if (num > 99999999.98) {
                                            newRaw = "99999999.98";
                                            num = 99999999.98;
                                          }
                                          formatted =
                                            num.toLocaleString("es-AR");
                                        } else {
                                          formatted = "";
                                          newRaw = "";
                                        }
                                      }
                                      if (newRaw !== raw) {
                                        setSumaFijaNoRemunerativa(newRaw);
                                      }
                                      setSumaFijaDisplay(formatted);
                                    }}
                                    onWheel={(
                                      e: React.WheelEvent<HTMLInputElement>
                                    ) => e.currentTarget.blur()}
                                    onKeyDown={(
                                      e: React.KeyboardEvent<HTMLInputElement>
                                    ) => {
                                      if (
                                        e.key === "ArrowUp" ||
                                        e.key === "ArrowDown"
                                      )
                                        e.preventDefault();
                                    }}
                                    style={{
                                      width: "140px",
                                      padding: "10px 12px",
                                      border: "2px solid #000",
                                      outline: "none",
                                      background: "#fff",
                                      fontSize: "18px",
                                      fontWeight: 700,
                                      textAlign: "right",
                                      borderRadius: "8px",
                                      color: "#000",
                                      boxShadow:
                                        "0 2px 4px rgba(0, 0, 0, 0.15)",
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </React.Fragment>
                    );
                  })}
              </Box>

              {/* Sección: ADICIONALES */}
              {otrosConceptos.some(
                (c) =>
                  c.tipo !== "descuento" &&
                  !c.nombre.toLowerCase().includes("sac") &&
                  c.nombre.toLowerCase() !== "sueldo básico"
              ) && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      background: "#01a201ff",
                      color: "#ffffff",
                      border: "1px solid #015f01ff",
                      borderRadius: 2,
                      mb: 2,
                      p: 1.5,
                    }}
                  >
                    Adicionales
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {/* Selector de Adicional de Traslado */}
                    {otrosConceptos.some((c) =>
                      c.nombre.toLowerCase().includes("adicional traslado")
                    ) && (
                      <Card
                        sx={{
                          background: "#fff",
                          borderRadius: 2,
                          boxShadow: 2,
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        <CardContent
                          sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}
                        >
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 700,
                                color: "#000",
                                fontSize: 17,
                                mb: 1,
                              }}
                            >
                              Adicional por Traslado
                            </Typography>
                            <FormControl fullWidth size="small">
                              <InputLabel>Seleccionar distancia</InputLabel>
                              <Select
                                value={adicionalTrasladoSeleccionado}
                                label="Seleccionar distancia"
                                onChange={(e) =>
                                  setAdicionalTrasladoSeleccionado(
                                    e.target.value
                                  )
                                }
                                sx={{
                                  background: "#fff",
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#388e3c",
                                  },
                                }}
                              >
                                <MenuItem value="">
                                  <em>Ninguno</em>
                                </MenuItem>
                                {otrosConceptos
                                  .filter((c) =>
                                    c.nombre
                                      .toLowerCase()
                                      .includes("adicional traslado")
                                  )
                                  .map((c) => (
                                    <MenuItem key={c.id} value={c.nombre}>
                                      {c.nombre} - {c.descripcion}
                                    </MenuItem>
                                  ))}
                              </Select>
                            </FormControl>
                          </Box>
                          {adicionalTrasladoSeleccionado && (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                p: 1.5,
                                background: "#f1f8f4",
                                borderRadius: 1,
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600, color: "#000" }}
                                >
                                  {adicionalTrasladoSeleccionado}
                                </Typography>
                                {(() => {
                                  const concepto = otrosConceptos.find(
                                    (c) =>
                                      c.nombre === adicionalTrasladoSeleccionado
                                  );
                                  if (concepto && concepto.porcentaje) {
                                    return (
                                      <Chip
                                        label={`${(
                                          concepto.porcentaje * 100
                                        ).toFixed(2)}%`}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          fontSize: 11,
                                          borderColor: "#388e3c",
                                          color: "#388e3c",
                                          mt: 0.5,
                                        }}
                                      />
                                    );
                                  }
                                })()}
                              </Box>
                              <Typography
                                variant="h6"
                                sx={{ fontWeight: 700, color: "#2e7d32" }}
                              >
                                {valoresCalculados[
                                  adicionalTrasladoSeleccionado
                                ] !== undefined
                                  ? `$${valoresCalculados[
                                      adicionalTrasladoSeleccionado
                                    ].toLocaleString("es-AR")}`
                                  : "$0"}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Resto de adicionales (excluyendo traslado) */}
                    {otrosConceptos
                      .filter(
                        (c) =>
                          c.tipo !== "descuento" &&
                          !c.nombre.toLowerCase().includes("sac") &&
                          c.nombre.toLowerCase() !== "sueldo básico" &&
                          !c.nombre.toLowerCase().includes("adicional traslado")
                      )
                      .map((c, index) => {
                        let porcentaje = "-";
                        if (typeof c.porcentaje === "number") {
                          porcentaje = (c.porcentaje * 100).toFixed(2) + "%";
                        } else if (
                          typeof c.porcentaje === "string" &&
                          c.porcentaje !== ""
                        ) {
                          const num = Number(c.porcentaje);
                          if (!isNaN(num))
                            porcentaje = (num * 100).toFixed(2) + "%";
                        }

                        const isAsistencia = c.nombre
                          .toLowerCase()
                          .includes("adicional por asistencia y puntualidad");

                        const isTraslado = c.nombre
                          .toLowerCase()
                          .includes("adicional traslado");

                        return (
                          <Card
                            key={index}
                            sx={{
                              background: "#fff",
                              borderRadius: 2,
                              boxShadow: 2,
                              border: "1px solid #e0e0e0",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                boxShadow: 4,
                                transform: "translateY(-2px)",
                              },
                            }}
                          >
                            <CardContent
                              sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  gap: 2,
                                }}
                              >
                                <Box sx={{ flex: 1 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      mb: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="h6"
                                      sx={{
                                        fontWeight: 600,
                                        color: "#000",
                                        fontSize: 19,
                                      }}
                                    >
                                      {c.nombre}
                                    </Typography>
                                    {isAsistencia && (
                                      <Checkbox
                                        checked={asistenciaActiva}
                                        onChange={(_, checked) =>
                                          setAsistenciaActiva(checked)
                                        }
                                        size="small"
                                        title="Activar/desactivar adicional por asistencia y puntualidad"
                                      />
                                    )}
                                  </Box>
                                  {porcentaje !== "-" && (
                                    <Chip
                                      label={porcentaje}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        fontSize: 12,
                                        borderColor: "#388e3c",
                                        color: "#388e3c",
                                      }}
                                    />
                                  )}
                                  {isTraslado && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "text.secondary",
                                        fontSize: 11,
                                        display: "block",
                                        mt: 1,
                                      }}
                                    >
                                      {c.descripcion}
                                    </Typography>
                                  )}
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-end",
                                    minWidth: 150,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "text.secondary",
                                      fontSize: 11,
                                      mb: 0.5,
                                      display: "block",
                                    }}
                                  >
                                    Valor calculado
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontWeight: 700,
                                      color: "#000",
                                      textAlign: "right",
                                      fontSize: 20,
                                    }}
                                  >
                                    {valoresCalculados[c.nombre] !== undefined
                                      ? `$${valoresCalculados[
                                          c.nombre
                                        ].toLocaleString("es-AR")}`
                                      : "-"}
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </Box>

                  {/* Subtotal Adicionales */}
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      background: "#f1f8f4",
                      borderRadius: 2,
                      border: "2px solid #388e3c",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#2e7d32",
                      }}
                    >
                      Subtotal Adicionales
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: "#2e7d32",
                      }}
                    >
                      $
                      {(() => {
                        // Sumar adicionales normales (excluyendo traslado)
                        let total = otrosConceptos
                          .filter(
                            (c) =>
                              c.tipo !== "descuento" &&
                              !c.nombre.toLowerCase().includes("sac") &&
                              c.nombre.toLowerCase() !== "sueldo básico" &&
                              !c.nombre
                                .toLowerCase()
                                .includes("adicional traslado")
                          )
                          .reduce((sum, c) => {
                            return sum + (valoresCalculados[c.nombre] || 0);
                          }, 0);

                        // Agregar el adicional de traslado seleccionado si existe
                        if (
                          adicionalTrasladoSeleccionado &&
                          valoresCalculados[adicionalTrasladoSeleccionado]
                        ) {
                          total +=
                            valoresCalculados[adicionalTrasladoSeleccionado];
                        }

                        return total.toLocaleString("es-AR");
                      })()}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Sección: SAC*/}
              {otrosConceptos.some((c) =>
                c.nombre.toLowerCase().includes("sac")
              ) && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      background: "#0277fbff",
                      color: "#ffffff",
                      border: "1px solid #023ebeff",
                      borderRadius: 2,
                      mb: 2,
                      p: 1.5,
                    }}
                  >
                    SAC - Sueldo Anual Complementario
                  </Typography>
                  {otrosConceptos
                    .filter((c) => c.nombre.toLowerCase().includes("sac"))
                    .map((c, index) => {
                      return (
                        <Card
                          key={index}
                          sx={{
                            background: "#fff",
                            borderRadius: 2,
                            boxShadow: 2,
                            border: "1px solid #e0e0e0",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              boxShadow: 4,
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          <CardContent
                            sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: 2,
                              }}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 1,
                                  }}
                                >
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      fontWeight: 600,
                                      color: "#000",
                                      fontSize: 19,
                                    }}
                                  >
                                    {c.nombre}
                                  </Typography>
                                  <Checkbox
                                    checked={sacActivo}
                                    onChange={(_, checked) =>
                                      setSacActivo(checked)
                                    }
                                    size="small"
                                    sx={{
                                      color: "#000",
                                      "&.Mui-checked": {
                                        color: "#000",
                                      },
                                    }}
                                    title="Activar SAC (se paga en junio y diciembre). Corresponde al 50% de la mejor remuneración del semestre"
                                  />
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "#666",
                                    fontStyle: "italic",
                                  }}
                                >
                                  50% de la mejor remuneración del semestre
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-end",
                                  minWidth: 150,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "text.secondary",
                                    fontSize: 11,
                                    mb: 0.5,
                                    display: "block",
                                  }}
                                >
                                  Valor calculado
                                </Typography>
                                <Typography
                                  sx={{
                                    fontWeight: 700,
                                    color: "#000",
                                    textAlign: "right",
                                    fontSize: 20,
                                  }}
                                >
                                  {valoresCalculados[c.nombre] !== undefined
                                    ? `$${valoresCalculados[
                                        c.nombre
                                      ].toLocaleString("es-AR")}`
                                    : "-"}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      );
                    })}
                </Box>
              )}
            </Box>

            {/* Sección de Horas Extras */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  background: "#5e35b1",
                  color: "#ffffff",
                  border: "1px solid #7e57c2",
                  borderRadius: 2,
                  mb: 2,
                  p: 1.5,
                }}
              >
                Horas Extras
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 3,
                  flexWrap: "wrap",
                }}
              >
                {/* Horas Extras 50% */}
                <Box sx={{ flex: "1 1 250px" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: "#000",
                      mb: 1,
                    }}
                  >
                    Horas Extras al 50%
                  </Typography>
                  <MuiTextField
                    type="number"
                    value={horasExtras50}
                    onChange={(e) => {
                      const valor = e.target.value;
                      setHorasExtras50(valor);
                    }}
                    placeholder="0"
                    inputProps={{
                      min: 0,
                      max: 30,
                      step: 0.5,
                    }}
                    sx={{
                      width: "100%",
                      background: "#fff",
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#bdbdbd",
                        },
                        "&:hover fieldset": {
                          borderColor: "#1976d2",
                        },
                      },
                    }}
                    error={
                      (parseFloat(horasExtras50) || 0) +
                        (parseFloat(horasExtras100) || 0) >
                      30
                    }
                    helperText={
                      (parseFloat(horasExtras50) || 0) +
                        (parseFloat(horasExtras100) || 0) >
                      30
                        ? "⚠️ Total de horas extras no puede superar 30"
                        : valorHoraNormal > 0 && horasExtras50
                        ? `Valor: $${(
                            parseFloat(horasExtras50) *
                            valorHoraNormal *
                            1.5
                          ).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : "Ingrese cantidad de horas"
                    }
                  />
                </Box>

                {/* Horas Extras 100% */}
                <Box sx={{ flex: "1 1 250px" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: "#000",
                      mb: 1,
                    }}
                  >
                    Horas Extras al 100%
                  </Typography>
                  <MuiTextField
                    type="number"
                    value={horasExtras100}
                    onChange={(e) => {
                      const valor = e.target.value;
                      setHorasExtras100(valor);
                    }}
                    placeholder="0"
                    inputProps={{
                      min: 0,
                      max: 30,
                      step: 0.5,
                    }}
                    sx={{
                      width: "100%",
                      background: "#fff",
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#bdbdbd",
                        },
                        "&:hover fieldset": {
                          borderColor: "#1976d2",
                        },
                      },
                    }}
                    error={
                      (parseFloat(horasExtras50) || 0) +
                        (parseFloat(horasExtras100) || 0) >
                      30
                    }
                    helperText={
                      (parseFloat(horasExtras50) || 0) +
                        (parseFloat(horasExtras100) || 0) >
                      30
                        ? "⚠️ Total de horas extras no puede superar 30"
                        : valorHoraNormal > 0 && horasExtras100
                        ? `Valor: $${(
                            parseFloat(horasExtras100) *
                            valorHoraNormal *
                            2
                          ).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : "Ingrese cantidad de horas"
                    }
                  />
                </Box>

                {/* Información del valor hora y total de horas */}
                <Box
                  sx={{
                    flex: "1 1 100%",
                    mt: 1,
                    p: 2,
                    background:
                      (parseFloat(horasExtras50) || 0) +
                        (parseFloat(horasExtras100) || 0) >
                      30
                        ? "#ffebee"
                        : "#f5f5f5",
                    borderRadius: 2,
                    border:
                      (parseFloat(horasExtras50) || 0) +
                        (parseFloat(horasExtras100) || 0) >
                      30
                        ? "2px solid #d32f2f"
                        : "1px solid #e0e0e0",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#000",
                        fontWeight: 600,
                      }}
                    >
                      {valorHoraNormal > 0 ? (
                        <>
                          ℹ️ Valor hora normal: $
                          {valorHoraNormal.toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </>
                      ) : (
                        "ℹ️ Información de Horas Extras"
                      )}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          (parseFloat(horasExtras50) || 0) +
                            (parseFloat(horasExtras100) || 0) >
                          30
                            ? "#d32f2f"
                            : "#1976d2",
                        fontWeight: 700,
                      }}
                    >
                      Total horas:{" "}
                      {(
                        (parseFloat(horasExtras50) || 0) +
                        (parseFloat(horasExtras100) || 0)
                      ).toFixed(1)}{" "}
                      / 30
                    </Typography>
                  </Box>
                  {valorHoraNormal > 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#666",
                        display: "block",
                        mt: 0.5,
                      }}
                    >
                      • Horas al 50%: $
                      {(valorHoraNormal * 1.5).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      por hora
                      <br />• Horas al 100%: $
                      {(valorHoraNormal * 2).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      por hora
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Mostrar valores calculados de horas extras */}
              {(horasExtras50 || horasExtras100) &&
                Object.keys(valoresCalculados).length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color: "#1976d2",
                        mb: 1,
                      }}
                    >
                      Valores calculados:
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      {horasExtras50 &&
                        valoresCalculados["Horas extras al 50%"] !==
                          undefined && (
                          <Box
                            sx={{
                              flex: "1 1 200px",
                              p: 2,
                              background: "#fff",
                              borderRadius: 2,
                              border: "1px solid #e0e0e0",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: "text.secondary" }}
                            >
                              Horas extras al 50%
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                color: "#388e3c",
                                fontWeight: 700,
                              }}
                            >
                              $
                              {valoresCalculados[
                                "Horas extras al 50%"
                              ].toLocaleString("es-AR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                          </Box>
                        )}
                      {horasExtras100 &&
                        valoresCalculados["Horas extras al 100%"] !==
                          undefined && (
                          <Box
                            sx={{
                              flex: "1 1 200px",
                              p: 2,
                              background: "#fff",
                              borderRadius: 2,
                              border: "1px solid #e0e0e0",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: "text.secondary" }}
                            >
                              Horas extras al 100%
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                color: "#388e3c",
                                fontWeight: 700,
                              }}
                            >
                              $
                              {valoresCalculados[
                                "Horas extras al 100%"
                              ].toLocaleString("es-AR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                          </Box>
                        )}
                    </Box>
                  </Box>
                )}

              {/* Subtotal Horas Extras */}
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  background: "#f3e5f5",
                  borderRadius: 2,
                  border: "2px solid #7e57c2",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#5e35b1",
                  }}
                >
                  Subtotal Horas Extras
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "#5e35b1",
                  }}
                >
                  $
                  {(() => {
                    const total =
                      (valoresCalculados["Horas extras al 50%"] || 0) +
                      (valoresCalculados["Horas extras al 100%"] || 0);
                    return total.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    });
                  })()}
                </Typography>
              </Box>
            </Box>

            {/* Sección: DESCUENTOS */}
            {otrosConceptos.some((c) => c.tipo === "descuento") && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    background: "#e53e35ff",
                    color: "#ffffff",
                    border: "1px solid #f62020ff",
                    borderRadius: 2,
                    mb: 2,
                    p: 1.5,
                  }}
                >
                  Descuentos
                </Typography>

                {/* Checkbox: ¿Es afiliado al sindicato? */}
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    background: "#fff3e0",
                    borderRadius: 2,
                    border: "2px solid #ff9800",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Checkbox
                    checked={esAfiliadoSindicato}
                    onChange={(_, checked) => setEsAfiliadoSindicato(checked)}
                    sx={{
                      color: "#f57c00",
                      "&.Mui-checked": {
                        color: "#f57c00",
                      },
                    }}
                  />
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#000",
                        fontSize: 16,
                      }}
                    >
                      ¿Es afiliado al sindicato?
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#666",
                        display: "block",
                        mt: 0.5,
                      }}
                    >
                      {esAfiliadoSindicato
                        ? "✓ Afiliado: Se aplicará Cuota Sindical (2%)"
                        : "✗ No afiliado: Se aplicarán Cuota Solidaria (1%) + Aporte Solidario Extraordinario (1.5%)"}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {otrosConceptos
                    .filter((c) => c.tipo === "descuento")
                    .sort((a, b) => {
                      // Ordenar descuentos: sindicato primero
                      const esSindicatoA =
                        a.nombre.toLowerCase().includes("cuota sindical") ||
                        a.nombre.toLowerCase().includes("cuota solidaria") ||
                        a.nombre.toLowerCase().includes("aporte solidario");
                      const esSindicatoB =
                        b.nombre.toLowerCase().includes("cuota sindical") ||
                        b.nombre.toLowerCase().includes("cuota solidaria") ||
                        b.nombre.toLowerCase().includes("aporte solidario");

                      if (esSindicatoA && !esSindicatoB) return -1;
                      if (!esSindicatoA && esSindicatoB) return 1;

                      // Dentro de conceptos de sindicato, orden específico
                      if (esSindicatoA && esSindicatoB) {
                        if (a.nombre.includes("Cuota Sindical Afiliado"))
                          return -1;
                        if (b.nombre.includes("Cuota Sindical Afiliado"))
                          return 1;
                        if (a.nombre.includes("Cuota Solidaria")) return -1;
                        if (b.nombre.includes("Cuota Solidaria")) return 1;
                      }

                      return 0; // Mantener orden original para los demás
                    })
                    .map((c, index) => {
                      let porcentaje = "-";
                      if (typeof c.porcentaje === "number") {
                        porcentaje = (c.porcentaje * 100).toFixed(2) + "%";
                      } else if (
                        typeof c.porcentaje === "string" &&
                        c.porcentaje !== ""
                      ) {
                        const num = Number(c.porcentaje);
                        if (!isNaN(num))
                          porcentaje = (num * 100).toFixed(2) + "%";
                      }

                      return (
                        <Card
                          key={index}
                          sx={{
                            background: "#fff",
                            borderRadius: 2,
                            boxShadow: 2,
                            border: "1px solid #e0e0e0",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              boxShadow: 4,
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          <CardContent
                            sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: 2,
                              }}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: 600,
                                    color: "#000",
                                    fontSize: 19,
                                    mb: 0.5,
                                  }}
                                >
                                  {c.nombre}
                                </Typography>
                                {porcentaje !== "-" && (
                                  <Chip
                                    label={porcentaje}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      fontSize: 12,
                                      borderColor: "#000",
                                      color: "#000",
                                    }}
                                  />
                                )}
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-end",
                                  minWidth: 150,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "text.secondary",
                                    fontSize: 11,
                                    mb: 0.5,
                                    display: "block",
                                  }}
                                >
                                  Valor calculado
                                </Typography>
                                <Typography
                                  sx={{
                                    fontWeight: 700,
                                    color: "#000",
                                    textAlign: "right",
                                    fontSize: 20,
                                  }}
                                >
                                  {valoresCalculados[c.nombre] !== undefined
                                    ? `$${valoresCalculados[
                                        c.nombre
                                      ].toLocaleString("es-AR")}`
                                    : "-"}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      );
                    })}
                </Box>

                {/* Subtotal Descuentos */}
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    background: "#ffebee",
                    borderRadius: 2,
                    border: "2px solid #d32f2f",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#c62828",
                    }}
                  >
                    Subtotal Descuentos
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: "#c62828",
                    }}
                  >
                    $
                    {(() => {
                      const total = otrosConceptos
                        .filter((c) => c.tipo === "descuento")
                        .reduce((sum, c) => {
                          return sum + (valoresCalculados[c.nombre] || 0);
                        }, 0);
                      return total.toLocaleString("es-AR");
                    })()}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* TOTALES FINALES */}
            <Box sx={{ mt: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  background: "#424242",
                  color: "#ffffff",
                  border: "1px solid #616161",
                  borderRadius: 2,
                  mb: 3,
                  p: 1.5,
                }}
              >
                Resumen de Liquidación
              </Typography>

              {/* Total Remunerativo Bruto */}
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  background: "#e3f2fd",
                  borderRadius: 2,
                  border: "2px solid #1976d2",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "#0d47a1",
                  }}
                >
                  Total Remunerativo Bruto
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#0d47a1",
                  }}
                >
                  $
                  {(() => {
                    const sueldoBasicoKey = Object.keys(valores).find(
                      (k) => k.toLowerCase() === "sueldo básico"
                    );
                    const sueldoBasico = sueldoBasicoKey
                      ? parseFloat(valores[sueldoBasicoKey]) || 0
                      : 0;

                    // Sumar todos los haberes remunerativos (sin suma_fija_no_remunerativa)
                    const totalOtrosConceptos = otrosConceptos
                      .filter(
                        (c) =>
                          c.tipo !== "descuento" && !c.suma_fija_no_remunerativa
                      )
                      .reduce((sum, c) => {
                        return sum + (valoresCalculados[c.nombre] || 0);
                      }, 0);

                    // Sumar horas extras (que no están en otrosConceptos)
                    const horasExtras50Val =
                      valoresCalculados["Horas extras al 50%"] || 0;
                    const horasExtras100Val =
                      valoresCalculados["Horas extras al 100%"] || 0;

                    const totalRemunerativo =
                      sueldoBasico +
                      totalOtrosConceptos +
                      horasExtras50Val +
                      horasExtras100Val;
                    return totalRemunerativo.toLocaleString("es-AR");
                  })()}
                </Typography>
              </Box>

              {/* Total No Remunerativo */}
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  background: "#f3e5f5",
                  borderRadius: 2,
                  border: "2px solid #9c27b0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "#6a1b9a",
                  }}
                >
                  Total No Remunerativo
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#6a1b9a",
                  }}
                >
                  $
                  {(() => {
                    const sumaFija = sumaFijaNoRemunerativa
                      ? parseFloat(
                          sumaFijaNoRemunerativa
                            .replace(/\./g, "")
                            .replace(",", ".")
                        )
                      : 0;
                    const totalNoRemunerativo = otrosConceptos
                      .filter(
                        (c) =>
                          c.tipo !== "descuento" && c.suma_fija_no_remunerativa
                      )
                      .reduce((sum, c) => {
                        return sum + (valoresCalculados[c.nombre] || 0);
                      }, sumaFija);
                    return totalNoRemunerativo.toLocaleString("es-AR");
                  })()}
                </Typography>
              </Box>

              {/* Total Haberes Brutos */}
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  background: "#e8f5e9",
                  borderRadius: 2,
                  border: "2px solid #388e3c",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "#1b5e20",
                  }}
                >
                  Total Haberes Brutos (Rem + No Rem)
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#1b5e20",
                  }}
                >
                  $
                  {(() => {
                    const sueldoBasicoKey = Object.keys(valores).find(
                      (k) => k.toLowerCase() === "sueldo básico"
                    );
                    const sueldoBasico = sueldoBasicoKey
                      ? parseFloat(valores[sueldoBasicoKey]) || 0
                      : 0;
                    const sumaFija = sumaFijaNoRemunerativa
                      ? parseFloat(
                          sumaFijaNoRemunerativa
                            .replace(/\./g, "")
                            .replace(",", ".")
                        )
                      : 0;

                    // Sumar otros conceptos (adicionales, SAC, etc.)
                    const totalOtrosConceptos = otrosConceptos
                      .filter((c) => c.tipo !== "descuento")
                      .reduce((sum, c) => {
                        return sum + (valoresCalculados[c.nombre] || 0);
                      }, 0);

                    // Sumar horas extras
                    const horasExtras50Val =
                      valoresCalculados["Horas extras al 50%"] || 0;
                    const horasExtras100Val =
                      valoresCalculados["Horas extras al 100%"] || 0;

                    const totalHaberes =
                      sueldoBasico +
                      sumaFija +
                      totalOtrosConceptos +
                      horasExtras50Val +
                      horasExtras100Val;
                    return totalHaberes.toLocaleString("es-AR");
                  })()}
                </Typography>
              </Box>

              {/* Total Descuentos */}
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  background: "#ffebee",
                  borderRadius: 2,
                  border: "2px solid #d32f2f",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "#c62828",
                  }}
                >
                  Total Descuentos
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#c62828",
                  }}
                >
                  $
                  {(() => {
                    const total = otrosConceptos
                      .filter((c) => c.tipo === "descuento")
                      .reduce((sum, c) => {
                        return sum + (valoresCalculados[c.nombre] || 0);
                      }, 0);
                    return total.toLocaleString("es-AR");
                  })()}
                </Typography>
              </Box>

              {/* Neto a Cobrar */}
              <Box
                sx={{
                  mt: 3,
                  p: 3,
                  background:
                    "linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)",
                  borderRadius: 2,
                  border: "3px solid #0d47a1",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "#ffffff",
                  }}
                >
                  Neto a Cobrar
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: "#ffffff",
                  }}
                >
                  $
                  {(() => {
                    const sueldoBasicoKey = Object.keys(valores).find(
                      (k) => k.toLowerCase() === "sueldo básico"
                    );
                    const sueldoBasico = sueldoBasicoKey
                      ? parseFloat(valores[sueldoBasicoKey]) || 0
                      : 0;
                    const sumaFija = sumaFijaNoRemunerativa
                      ? parseFloat(
                          sumaFijaNoRemunerativa
                            .replace(/\./g, "")
                            .replace(",", ".")
                        )
                      : 0;

                    // Total de otros conceptos (no descuentos)
                    const totalOtrosConceptos = otrosConceptos
                      .filter((c) => c.tipo !== "descuento")
                      .reduce((sum, c) => {
                        return sum + (valoresCalculados[c.nombre] || 0);
                      }, 0);

                    // Horas extras
                    const horasExtras50Val =
                      valoresCalculados["Horas extras al 50%"] || 0;
                    const horasExtras100Val =
                      valoresCalculados["Horas extras al 100%"] || 0;

                    // Total haberes
                    const totalHaberes =
                      sueldoBasico +
                      sumaFija +
                      totalOtrosConceptos +
                      horasExtras50Val +
                      horasExtras100Val;

                    // Total descuentos
                    const totalDescuentos = otrosConceptos
                      .filter((c) => c.tipo === "descuento")
                      .reduce((sum, c) => {
                        return sum + (valoresCalculados[c.nombre] || 0);
                      }, 0);

                    const neto = totalHaberes - totalDescuentos;
                    return neto.toLocaleString("es-AR");
                  })()}
                </Typography>
              </Box>
            </Box>
          </Box>
        );

      case 3:
        // Paso 4: Revisión Final y Confirmación
        const sueldoBasicoKey = Object.keys(valores).find(
          (k) => k.toLowerCase() === "sueldo básico"
        );
        const sueldoBasico = sueldoBasicoKey
          ? parseFloat(valores[sueldoBasicoKey]) || 0
          : 0;

        const sumaFija = sumaFijaNoRemunerativa
          ? parseFloat(
              sumaFijaNoRemunerativa.replace(/\./g, "").replace(",", ".")
            )
          : 0;

        const totalOtrosConceptos = otrosConceptos
          .filter((c) => c.tipo !== "descuento")
          .reduce((sum, c) => sum + (valoresCalculados[c.nombre] || 0), 0);

        const horasExtras50Val = valoresCalculados["Horas extras al 50%"] || 0;
        const horasExtras100Val =
          valoresCalculados["Horas extras al 100%"] || 0;

        const totalHaberes =
          sueldoBasico +
          sumaFija +
          totalOtrosConceptos +
          horasExtras50Val +
          horasExtras100Val;

        const totalDescuentos = otrosConceptos
          .filter((c) => c.tipo === "descuento")
          .reduce((sum, c) => sum + (valoresCalculados[c.nombre] || 0), 0);

        const netoAPagar = totalHaberes - totalDescuentos;

        const totalRemunerativo =
          sueldoBasico +
          otrosConceptos
            .filter(
              (c) => c.tipo !== "descuento" && !c.suma_fija_no_remunerativa
            )
            .reduce((sum, c) => sum + (valoresCalculados[c.nombre] || 0), 0) +
          horasExtras50Val +
          horasExtras100Val;

        const totalNoRemunerativo =
          sumaFija +
          otrosConceptos
            .filter(
              (c) => c.tipo !== "descuento" && c.suma_fija_no_remunerativa
            )
            .reduce((sum, c) => sum + (valoresCalculados[c.nombre] || 0), 0);

        return (
          <Box>
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: 700,
                color: "primary.main",
                letterSpacing: 1,
                textAlign: "center",
              }}
            >
              Revisión Final de la Liquidación
            </Typography>

            {/* Información del Empleado */}
            {employeeFound && (
              <Card
                sx={{
                  mb: 3,
                  background:
                    "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                  borderRadius: 3,
                  boxShadow: 4,
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#fff", mb: 2 }}
                  >
                    Datos del Empleado
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: 14, color: "#e3f2fd" }}>
                        Nombre Completo
                      </Typography>
                      <Typography
                        sx={{ fontSize: 16, color: "#fff", fontWeight: 600 }}
                      >
                        {employeeFound.apellido}, {employeeFound.nombre}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 14, color: "#e3f2fd" }}>
                        DNI
                      </Typography>
                      <Typography
                        sx={{ fontSize: 16, color: "#fff", fontWeight: 600 }}
                      >
                        {employeeFound.dni}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 14, color: "#e3f2fd" }}>
                        CUIL
                      </Typography>
                      <Typography
                        sx={{ fontSize: 16, color: "#fff", fontWeight: 600 }}
                      >
                        {employeeFound.cuil}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 14, color: "#e3f2fd" }}>
                        Categoría
                      </Typography>
                      <Typography
                        sx={{ fontSize: 16, color: "#fff", fontWeight: 600 }}
                      >
                        {employeeFound.categoria}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 14, color: "#e3f2fd" }}>
                        Período
                      </Typography>
                      <Typography
                        sx={{ fontSize: 16, color: "#fff", fontWeight: 600 }}
                      >
                        {periodo
                          ? new Date(periodo + "-01").toLocaleDateString(
                              "es-AR",
                              { month: "long", year: "numeric" }
                            )
                          : "-"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 14, color: "#e3f2fd" }}>
                        Tipo de Jornada
                      </Typography>
                      <Typography
                        sx={{ fontSize: 16, color: "#fff", fontWeight: 600 }}
                      >
                        {tipoJornada === "completa"
                          ? "Completa"
                          : tipoJornada === "dos_tercios"
                          ? "2/3 Jornada"
                          : "Media Jornada"}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Resumen de Haberes */}
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#2e7d32", mb: 2 }}
                >
                  Haberes
                </Typography>

                {/* Sueldo Básico */}
                {sueldoBasico > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      py: 1,
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography sx={{ fontSize: 16 }}>Sueldo Básico</Typography>
                    <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
                      ${sueldoBasico.toLocaleString("es-AR")}
                    </Typography>
                  </Box>
                )}

                {/* Suma Fija No Remunerativa */}
                {sumaFija > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      py: 1,
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography sx={{ fontSize: 16 }}>
                      Suma Fija No Remunerativa
                    </Typography>
                    <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
                      ${sumaFija.toLocaleString("es-AR")}
                    </Typography>
                  </Box>
                )}

                {/* Otros Conceptos (Adicionales, SAC) */}
                {otrosConceptos
                  .filter(
                    (c) =>
                      c.tipo !== "descuento" &&
                      (valoresCalculados[c.nombre] || 0) > 0
                  )
                  .map((c, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 1,
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      <Typography sx={{ fontSize: 16 }}>{c.nombre}</Typography>
                      <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
                        ${valoresCalculados[c.nombre].toLocaleString("es-AR")}
                      </Typography>
                    </Box>
                  ))}

                {/* Horas Extras */}
                {horasExtras50Val > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      py: 1,
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography sx={{ fontSize: 16 }}>
                      Horas Extras al 50% ({horasExtras50} hs)
                    </Typography>
                    <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
                      ${horasExtras50Val.toLocaleString("es-AR")}
                    </Typography>
                  </Box>
                )}
                {horasExtras100Val > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      py: 1,
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography sx={{ fontSize: 16 }}>
                      Horas Extras al 100% ({horasExtras100} hs)
                    </Typography>
                    <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
                      ${horasExtras100Val.toLocaleString("es-AR")}
                    </Typography>
                  </Box>
                )}

                {/* Subtotal Haberes */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 2,
                    mt: 1,
                    background: "#e8f5e9",
                    borderRadius: 2,
                    px: 2,
                  }}
                >
                  <Typography
                    sx={{ fontSize: 18, fontWeight: 700, color: "#2e7d32" }}
                  >
                    Total Haberes
                  </Typography>
                  <Typography
                    sx={{ fontSize: 18, fontWeight: 700, color: "#2e7d32" }}
                  >
                    ${totalHaberes.toLocaleString("es-AR")}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Resumen de Descuentos */}
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#d32f2f", mb: 2 }}
                >
                  Descuentos
                </Typography>

                {otrosConceptos
                  .filter(
                    (c) =>
                      c.tipo === "descuento" &&
                      (valoresCalculados[c.nombre] || 0) > 0
                  )
                  .map((c, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 1,
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      <Typography sx={{ fontSize: 16 }}>{c.nombre}</Typography>
                      <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
                        ${valoresCalculados[c.nombre].toLocaleString("es-AR")}
                      </Typography>
                    </Box>
                  ))}

                {/* Subtotal Descuentos */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 2,
                    mt: 1,
                    background: "#ffebee",
                    borderRadius: 2,
                    px: 2,
                  }}
                >
                  <Typography
                    sx={{ fontSize: 18, fontWeight: 700, color: "#c62828" }}
                  >
                    Total Descuentos
                  </Typography>
                  <Typography
                    sx={{ fontSize: 18, fontWeight: 700, color: "#c62828" }}
                  >
                    ${totalDescuentos.toLocaleString("es-AR")}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Totales Finales */}
            <Card
              sx={{
                mb: 3,
                borderRadius: 3,
                boxShadow: 4,
                background: "linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography sx={{ fontSize: 16, color: "#e3f2fd" }}>
                    Total Remunerativo
                  </Typography>
                  <Typography
                    sx={{ fontSize: 16, fontWeight: 600, color: "#fff" }}
                  >
                    ${totalRemunerativo.toLocaleString("es-AR")}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Typography sx={{ fontSize: 16, color: "#e3f2fd" }}>
                    Total No Remunerativo
                  </Typography>
                  <Typography
                    sx={{ fontSize: 16, fontWeight: 600, color: "#fff" }}
                  >
                    ${totalNoRemunerativo.toLocaleString("es-AR")}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 2,
                    borderTop: "2px solid #fff",
                  }}
                >
                  <Typography
                    sx={{ fontSize: 22, fontWeight: 700, color: "#fff" }}
                  >
                    Neto a Cobrar
                  </Typography>
                  <Typography
                    sx={{ fontSize: 28, fontWeight: 700, color: "#fff" }}
                  >
                    ${netoAPagar.toLocaleString("es-AR")}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Botón Confirmar y Guardar */}
            <Box
              sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2 }}
            >
              <Button
                variant="outlined"
                size="large"
                onClick={handleBack}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                }}
              >
                Volver a Editar
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={guardarLiquidacion}
                disabled={guardandoLiquidacion || liquidacionGuardada}
                sx={{
                  backgroundColor: liquidacionGuardada ? "#4caf50" : "#1976d2",
                  color: "#fff",
                  px: 6,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  "&:hover": {
                    backgroundColor: liquidacionGuardada
                      ? "#45a049"
                      : "#1565c0",
                  },
                  "&:disabled": {
                    backgroundColor: "#bdbdbd",
                    color: "#757575",
                  },
                }}
              >
                {guardandoLiquidacion
                  ? "Guardando..."
                  : liquidacionGuardada
                  ? "✓ Liquidación Guardada"
                  : "Confirmar y Guardar Liquidación"}
              </Button>
            </Box>
          </Box>
        );

      default:
        return <Typography>Paso no disponible</Typography>;
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

      <BackButton to="/contadores" />

      <Container maxWidth="md" sx={{ mt: 4, mb: 6, flex: 1 }}>
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
              setEmpresaError("Debe buscar y seleccionar una empresa");
              return;
            }
            if (activeStep === 1 && !employeeFound) {
              setSearchError("Debe buscar y seleccionar un empleado");
              return;
            }
            handleNext();
          }}
          sx={{
            backgroundColor: "#fff",
            borderRadius: 2,
            p: 4,
            mt: 4,
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
};

export default Liquidacion;
