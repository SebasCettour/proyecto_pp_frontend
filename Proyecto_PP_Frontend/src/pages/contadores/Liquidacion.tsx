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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

const steps = [
  "Buscar Empresa",
  "Buscar Empleado",
  "Liquidación de Haberes",
  "Revisión y Confirmación",
  "Generar Liquidación",
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

  // Conceptos
  const [conceptos, setConceptos] = useState<any[]>([]);
  const [valores, setValores] = useState<{ [key: string]: string }>({});
  const [asistenciaActiva, setAsistenciaActiva] = useState(true);
  const [sacActivo, setSacActivo] = useState(false);
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
  ]);

  useEffect(() => {
    calcularLiquidacion();
  }, [calcularLiquidacion]);

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
      } else if (response.status === 404) {
        setEmployeeFound(null);
        setSearchError("No se encontró un empleado con ese DNI");
      } else {
        throw new Error("Error en la búsqueda");
      }
    } catch (error) {
      console.error("Error buscando empleado:", error);
      setSearchError("Error al buscar el empleado. Intente nuevamente.");
      setEmployeeFound(null);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

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
              Buscar Empleado por DNI
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
              <MuiTextField
                fullWidth
                label="DNI"
                value={searchDni}
                onChange={(e) => setSearchDni(e.target.value)}
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
              <Alert severity="error" sx={{ mb: 2 }}>
                {searchError}
              </Alert>
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
                                    fontWeight: 700,
                                    color: "#000",
                                    fontSize: 17,
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
                                <input
                                  type="text"
                                  value={sueldoDisplay}
                                  inputMode="text"
                                  pattern="[0-9.,]*"
                                  maxLength={12}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    const typed = e.target.value;
                                    setSueldoDisplay(typed);
                                    let cleaned = typed
                                      .replace(/\./g, "")
                                      .replace(/,/g, ".")
                                      .replace(/[^0-9.]/g, "");
                                    const dotIndex = cleaned.indexOf(".");
                                    let intPart =
                                      dotIndex !== -1
                                        ? cleaned
                                            .substring(0, dotIndex)
                                            .slice(0, 8)
                                        : cleaned.slice(0, 8);
                                    let decPart =
                                      dotIndex !== -1
                                        ? cleaned
                                            .substring(dotIndex + 1)
                                            .slice(0, 2)
                                        : "";
                                    let cleanVal =
                                      intPart + (decPart ? "." + decPart : "");
                                    if (cleanVal === ".") cleanVal = "";
                                    setValores((prev) => ({
                                      ...prev,
                                      [c.nombre]: cleanVal,
                                    }));
                                  }}
                                  onFocus={() => setEditingSueldo(true)}
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
                                        formatted = num.toLocaleString("es-AR");
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
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
                                  }}
                                />
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
                                    fontWeight: 700,
                                    color: "#000",
                                    fontSize: 17,
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
                                <input
                                  type="text"
                                  value={sumaFijaDisplay}
                                  inputMode="text"
                                  pattern="[0-9.,]*"
                                  maxLength={12}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    const typed = e.target.value;
                                    setSumaFijaDisplay(typed);
                                    let cleaned = typed
                                      .replace(/\./g, "")
                                      .replace(/,/g, ".")
                                      .replace(/[^0-9.]/g, "");
                                    const dotIndex = cleaned.indexOf(".");
                                    let intPart =
                                      dotIndex !== -1
                                        ? cleaned
                                            .substring(0, dotIndex)
                                            .slice(0, 8)
                                        : cleaned.slice(0, 8);
                                    let decPart =
                                      dotIndex !== -1
                                        ? cleaned
                                            .substring(dotIndex + 1)
                                            .slice(0, 2)
                                        : "";
                                    let cleanVal =
                                      intPart + (decPart ? "." + decPart : "");
                                    if (cleanVal === ".") cleanVal = "";
                                    setSumaFijaNoRemunerativa(cleanVal);
                                  }}
                                  onFocus={() => setEditingSumaFija(true)}
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
                                        formatted = num.toLocaleString("es-AR");
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
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
                                  }}
                                />
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
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 4,
                        height: 24,
                        background: "#388e3c",
                        borderRadius: 1,
                      }}
                    />
                    Adicionales
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {otrosConceptos
                      .filter(
                        (c) =>
                          c.tipo !== "descuento" &&
                          !c.nombre.toLowerCase().includes("sac") &&
                          c.nombre.toLowerCase() !== "sueldo básico"
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
                                        fontWeight: 700,
                                        color: "#000",
                                        fontSize: 17,
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
                                    variant="h5"
                                    sx={{
                                      fontWeight: 700,
                                      color: "#000",
                                      textAlign: "right",
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
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 4,
                        height: 24,
                        background:
                          "linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)",
                        borderRadius: 1,
                      }}
                    />
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
                                      fontWeight: 700,
                                      color: "#000",
                                      fontSize: 17,
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
                                  variant="h5"
                                  sx={{
                                    fontWeight: 700,
                                    color: "#000",
                                    textAlign: "right",
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
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 4,
                    height: 24,
                    background:
                      "linear-gradient(135deg, #5e35b1 0%, #7e57c2 100%)",
                    borderRadius: 1,
                  }}
                />
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
                    onChange={(e) => setHorasExtras50(e.target.value)}
                    placeholder="0"
                    inputProps={{
                      min: 0,
                      max: 999,
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
                    helperText={
                      valorHoraNormal > 0 && horasExtras50
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
                    onChange={(e) => setHorasExtras100(e.target.value)}
                    placeholder="0"
                    inputProps={{
                      min: 0,
                      max: 999,
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
                    helperText={
                      valorHoraNormal > 0 && horasExtras100
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

                {/* Información del valor hora */}
                {valorHoraNormal > 0 && (
                  <Box
                    sx={{
                      flex: "1 1 100%",
                      mt: 1,
                      p: 2,
                      background: "#f5f5f5",
                      borderRadius: 2,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#000",
                        fontWeight: 600,
                      }}
                    >
                      ℹ️ Valor hora normal: $
                      {valorHoraNormal.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
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
                  </Box>
                )}
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
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 4,
                      height: 24,
                      background: "#d32f2f",
                      borderRadius: 1,
                    }}
                  />
                  Descuentos
                </Typography>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  {otrosConceptos
                    .filter((c) => c.tipo === "descuento")
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
                                    fontWeight: 700,
                                    color: "#000",
                                    fontSize: 17,
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
                                  variant="h5"
                                  sx={{
                                    fontWeight: 700,
                                    color: "#000",
                                    textAlign: "right",
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
              </Box>
            )}
          </Box>
        );
      default:
        return <Typography>Próximos pasos en desarrollo...</Typography>;
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

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, px: 4 }}>
        <Button
          component={Link}
          to="/contadores"
          variant="outlined"
          sx={{
            backgroundColor: "#1565C0",
            color: "#fff",
            width: 180,
            letterSpacing: 2,
            borderRadius: 3,
            mr: 5,
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

      <Footer />
    </Box>
  );
};

export default Liquidacion;
