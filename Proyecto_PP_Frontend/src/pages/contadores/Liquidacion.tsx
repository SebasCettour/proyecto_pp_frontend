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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

const steps = [
  "Buscar Empresa",
  "Buscar Empleado",
  "Liquidación de Haberes",
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
  const [jornadaAccordionOpen, setJornadaAccordionOpen] = useState(false);
  const navigate = useNavigate();
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

  const horasMensualesPorJornada: Record<string, number> = {
    completa: 192,
    dos_tercios: 128,
    media: 96,
  };

  const recalcularValoresCalculados = useCallback(() => {
    const sueldoBasico = parseFloat(valores["Sueldo básico"]) || 0;
    const horasMensuales = horasMensualesPorJornada[tipoJornada];
    const valorHora =
      sueldoBasico > 0 && horasMensuales > 0
        ? +(sueldoBasico / horasMensuales).toFixed(2)
        : 0;
    setValorHoraNormal(valorHora);

    const nuevosValores: { [key: string]: number } = {};
    conceptos.forEach((c: any) => {
      // Adicional por asistencia y puntualidad
      if (
        c.nombre
          .toLowerCase()
          .includes("adicional por asistencia y puntualidad") &&
        !asistenciaActiva
      ) {
        nuevosValores[c.nombre] = 0;
        return;
      }
      // Antigüedad: detectar por nombre flexible
      const nombreAntiguedad = c.nombre.toLowerCase();
      if (
        nombreAntiguedad.includes("adicional por antigüedad") ||
        nombreAntiguedad.includes("antigüedad")
      ) {
        if (employeeFound && employeeFound.fechaIngreso) {
          const fechaIngreso = new Date(employeeFound.fechaIngreso);
          const hoy = new Date();
          let antiguedad = hoy.getFullYear() - fechaIngreso.getFullYear();
          // Ajuste si aún no cumplió el año este año
          if (
            hoy.getMonth() < fechaIngreso.getMonth() ||
            (hoy.getMonth() === fechaIngreso.getMonth() &&
              hoy.getDate() < fechaIngreso.getDate())
          ) {
            antiguedad--;
          }
          const monto = +(sueldoBasico * 0.01 * antiguedad).toFixed(2);
          nuevosValores[c.nombre] = monto > 0 ? monto : 0;
        } else {
          nuevosValores[c.nombre] = 0;
        }
        return;
      }
      // Porcentaje fijo
      if (c.porcentaje && !c.editable) {
        nuevosValores[c.nombre] = +(
          sueldoBasico * parseFloat(c.porcentaje)
        ).toFixed(2);
      }
      if (c.nombre.toLowerCase().includes("horas extras 50")) {
        const cantidad = parseFloat(valores[c.nombre]) || 0;
        nuevosValores[c.nombre] = +(cantidad * valorHora * 1.5).toFixed(2);
      }
      if (c.nombre.toLowerCase().includes("horas extras 100")) {
        const cantidad = parseFloat(valores[c.nombre]) || 0;
        nuevosValores[c.nombre] = +(cantidad * valorHora * 2).toFixed(2);
      }
    });
    setValoresCalculados(nuevosValores);
  }, [valores, conceptos, tipoJornada, asistenciaActiva, employeeFound]);

  useEffect(() => {
    recalcularValoresCalculados();
  }, [conceptos, valores, recalcularValoresCalculados]);

  // Sincronizar display del sueldo cuando no se está editando
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
          // Log para depuración: mostrar nombres de conceptos
          console.log("Conceptos recibidos:", data.map((c: any) => c.nombre));
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
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'primary.main', letterSpacing: 1 }}>
              Buscar Empresa por nombre
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <MuiTextField
                fullWidth
                label="Nombre de la empresa"
                value={searchEmpresa}
                onChange={(e) => setSearchEmpresa(e.target.value)}
                sx={{ background: '#f7fafd', borderRadius: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleSearchEmpresa}
                disabled={loading}
                sx={{ minWidth: 120, fontWeight: 600, borderRadius: 2, boxShadow: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : "Buscar"}
              </Button>
            </Box>
            {empresaError && <Alert severity="error" sx={{ mb: 2 }}>{empresaError}</Alert>}
            {empresaFound && (
              <Card sx={{ mt: 2, background: '#f5faff', borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                    {empresaFound.Nombre_Empresa}
                  </Typography>
                  <Typography sx={{ fontSize: 15, color: 'text.secondary' }}>CUIT: {empresaFound.CUIL_CUIT}</Typography>
                  <Typography sx={{ fontSize: 15, color: 'text.secondary' }}>Rubro: {empresaFound.Rubro}</Typography>
                  <Typography sx={{ fontSize: 15, color: 'text.secondary' }}>Dirección: {empresaFound.Direccion}</Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'primary.main', letterSpacing: 1 }}>
              Buscar Empleado por DNI
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <MuiTextField
                fullWidth
                label="DNI"
                value={searchDni}
                onChange={(e) => setSearchDni(e.target.value)}
                sx={{ background: '#f7fafd', borderRadius: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleSearchEmployee}
                disabled={loading}
                sx={{ minWidth: 120, fontWeight: 600, borderRadius: 2, boxShadow: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : "Buscar"}
              </Button>
            </Box>
            {searchError && <Alert severity="error" sx={{ mb: 2 }}>{searchError}</Alert>}
            {employeeFound && (
              <Card sx={{ mt: 2, background: '#f5faff', borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                    {employeeFound.apellido}, {employeeFound.nombre}
                  </Typography>
                  <Typography sx={{ fontSize: 15, color: 'text.secondary' }}>DNI: {employeeFound.dni}</Typography>
                  <Typography sx={{ fontSize: 15, color: 'text.secondary' }}>CUIL: {employeeFound.cuil}</Typography>
                  <Typography sx={{ fontSize: 15, color: 'text.secondary' }}>Categoría: {employeeFound.categoria}</Typography>
                  <Typography sx={{ fontSize: 15, color: 'text.secondary' }}>
                    Fecha Ingreso: {new Date(employeeFound.fechaIngreso).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case 2:
        if (conceptosLoading)
          return <Typography sx={{ color: 'primary.main', fontWeight: 500 }}>Cargando conceptos...</Typography>;
        if (!conceptos.length)
          return <Typography sx={{ color: 'text.secondary' }}>No hay conceptos disponibles.</Typography>;

        // Separar conceptos de horas extras y el resto
        const horasExtras = conceptos.filter((c) =>
          c.nombre.toLowerCase().includes("horas extras")
        );
        const otrosConceptos = conceptos.filter(
          (c) => !c.nombre.toLowerCase().includes("horas extras")
        );

        return (
          <Box>
            <Typography
              variant="h5"
              sx={{ mb: 2, color: "primary.main", fontWeight: 700, letterSpacing: 1 }}
            >
              Liquidación de Haberes
            </Typography>

            <Accordion
              sx={{ mb: 3, boxShadow: 2, borderRadius: 2, background: '#f7fafd' }}
              expanded={jornadaAccordionOpen}
              onChange={(_, expanded) => setJornadaAccordionOpen(expanded)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Tipo de Jornada: {tipoJornada === "completa"
                    ? "Completa"
                    : tipoJornada === "dos_tercios"
                    ? "2/3 Jornada"
                    : "Media Jornada"}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                  <Button
                    variant={tipoJornada === "completa" ? "contained" : "outlined"}
                    onClick={() => {
                      setTipoJornada("completa");
                      setJornadaAccordionOpen(false);
                    }}
                    sx={{ fontWeight: 600, borderRadius: 2 }}
                  >
                    Completa
                  </Button>
                  <Button
                    variant={tipoJornada === "dos_tercios" ? "contained" : "outlined"}
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

            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3, gap: 4, justifyContent: 'space-between' }}>
              <MuiTextField
                label="Período a liquidar"
                type="month"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                sx={{ width: 260, background: '#f7fafd', borderRadius: 2 }}
                InputLabelProps={{ shrink: true }}
              />
              {employeeFound && (
                <Card sx={{ minWidth: 260, maxWidth: 320, background: '#f5faff', borderRadius: 3, boxShadow: 2, ml: 'auto' }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                      {employeeFound.apellido}, {employeeFound.nombre}
                    </Typography>
                    <Typography sx={{ fontSize: 15, color: 'text.secondary' }}>DNI: {employeeFound.dni}</Typography>
                    <Typography sx={{ fontSize: 15, color: 'text.secondary' }}>CUIL: {employeeFound.cuil}</Typography>
                    <Typography sx={{ fontSize: 15, color: 'text.secondary' }}>Categoría: {employeeFound.categoria}</Typography>
                    <Typography sx={{ fontSize: 15, color: 'text.secondary' }}>
                      Fecha Ingreso: {new Date(employeeFound.fechaIngreso).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Box>

            <Box sx={{ overflowX: "auto", mb: 2 }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  fontSize: 15,
                  background: "#f9f9f9",
                  borderRadius: 12,
                  boxShadow: "0 2px 12px #e3e3e3",
                  marginTop: 8,
                }}
              >
                <thead style={{ background: "#e3eafc" }}>
                  <tr>
                    <th align="left" style={{ padding: 10, fontWeight: 700, fontSize: 16, color: '#1976d2' }}>
                      Concepto
                    </th>
                    <th style={{ padding: 10, fontWeight: 700, fontSize: 16, color: '#1976d2' }}>Tipo</th>
                    <th style={{ padding: 10, fontWeight: 700, fontSize: 16, color: '#1976d2' }}>Porcentaje</th>
                    <th style={{ padding: 10, fontWeight: 700, fontSize: 16, color: '#1976d2' }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {otrosConceptos.map((c) => {
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
                    // Detectar si es Sueldo básico
                    const isSueldoBasico =
                      c.nombre.toLowerCase() === "sueldo básico";
                    // Detectar si es Adicional por asistencia y puntualidad
                    const isAsistencia = c.nombre
                      .toLowerCase()
                      .includes("adicional por asistencia y puntualidad");
                    // Formatear el valor para mostrarlo con separador de miles
                    const rawValue = valores[c.nombre] || "";
                    const displayValue =
                      rawValue !== "" && !isNaN(Number(rawValue))
                        ? Number(rawValue).toLocaleString("es-AR")
                        : "";
                    return (
                      <tr
                        key={c.id}
                        style={{ borderBottom: "1.5px solid #e0e0e0" }}
                      >
                        <td
                          style={{
                            padding: 10,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            fontWeight: 500,
                          }}
                        >
                          {c.nombre}
                          {isAsistencia && (
                            <Checkbox
                              checked={asistenciaActiva}
                              onChange={(_, checked) =>
                                setAsistenciaActiva(checked)
                              }
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </td>
                        <td style={{ padding: 10, fontWeight: 500 }}>{c.tipo}</td>
                        <td style={{ padding: 10, fontWeight: 500 }}>{porcentaje}</td>
                        <td style={{ padding: 10, fontWeight: 600, color: isSueldoBasico ? '#1976d2' : '#388e3c' }}>
                          <Box>
                            <input
                              type="text"
                              value={
                                isSueldoBasico
                                  ? sueldoDisplay
                                  : valoresCalculados[c.nombre] !== undefined &&
                                    valoresCalculados[c.nombre] !== 0
                                  ? valoresCalculados[c.nombre].toLocaleString(
                                      "es-AR"
                                    )
                                  : ""
                              }
                              inputMode="text"
                              pattern="[0-9.,]*"
                              maxLength={12}
                              onChange={
                                isSueldoBasico
                                  ? (
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
                                        intPart +
                                        (decPart ? "." + decPart : "");
                                      if (cleanVal === ".") cleanVal = "";
                                      setValores((prev) => ({
                                        ...prev,
                                        [c.nombre]: cleanVal,
                                      }));
                                    }
                                  : undefined
                              }
                              onFocus={
                                isSueldoBasico
                                  ? () => setEditingSueldo(true)
                                  : undefined
                              }
                              onBlur={
                                isSueldoBasico
                                  ? (e: React.FocusEvent<HTMLInputElement>) => {
                                      setEditingSueldo(false);
                                      let raw = valores[c.nombre];
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
                                    }
                                  : undefined
                              }
                              onWheel={
                                isSueldoBasico
                                  ? (e: React.WheelEvent<HTMLInputElement>) =>
                                      e.currentTarget.blur()
                                  : undefined
                              }
                              onKeyDown={
                                isSueldoBasico
                                  ? (
                                      e: React.KeyboardEvent<HTMLInputElement>
                                    ) => {
                                      if (
                                        e.key === "ArrowUp" ||
                                        e.key === "ArrowDown"
                                      )
                                        e.preventDefault();
                                    }
                                  : undefined
                              }
                              style={{
                                width: "100px",
                                maxWidth: "100px",
                                minWidth: "60px",
                                border: "1.5px solid #bdbdbd",
                                outline: "none",
                                background: isSueldoBasico
                                  ? "#f7fafd"
                                  : "#f0f0f0",
                                fontSize: "15px",
                                textAlign: "right",
                                paddingRight: "8px",
                                borderRadius: "6px",
                                MozAppearance: "textfield",
                                appearance: "textfield",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                transition: "border 0.2s",
                                color: isSueldoBasico ? '#1976d2' : '#388e3c',
                                fontWeight: isSueldoBasico ? 700 : 600,
                              }}
                              disabled={!isSueldoBasico}
                            />
                          </Box>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>
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
