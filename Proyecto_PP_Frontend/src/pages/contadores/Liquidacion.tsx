import React, { useState, useEffect } from "react";
import { TextField as MuiTextField } from "@mui/material";
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
  const [periodo, setPeriodo] = useState<string>("");

  // Empresa
  const [searchEmpresa, setSearchEmpresa] = useState("");
  const [empresaFound, setEmpresaFound] = useState<Empresa | null>(null);
  const [empresaError, setEmpresaError] = useState("");

  // Empleado
  const [searchDni, setSearchDni] = useState("");
  const [employeeFound, setEmployeeFound] = useState<Employee | null>(null);
  const [searchError, setSearchError] = useState("");

  // Estado para conceptos dinámicos
  const [conceptos, setConceptos] = useState<any[]>([]);
  const [valores, setValores] = useState<{ [key: string]: string }>({});
  const [conceptosLoading, setConceptosLoading] = useState(false);
  // Estado para valores calculados de descuentos/adicionales
  const [valoresCalculados, setValoresCalculados] = useState<{
    [key: string]: number;
  }>({});
  // Recalcular descuentos/adicionales cuando el input pierde el foco o al cargar conceptos
  const recalcularValoresCalculados = React.useCallback(() => {
    const sueldoBasico = parseFloat(valores["Sueldo básico"]) || 0;
    const nuevosValores: { [key: string]: number } = {};
    conceptos.forEach((c: any) => {
      if (c.porcentaje && !c.editable) {
        nuevosValores[c.nombre] = +(
          sueldoBasico * parseFloat(c.porcentaje)
        ).toFixed(2);
      }
    });
    setValoresCalculados(nuevosValores);
  }, [valores["Sueldo básico"], conceptos]);

  // Inicializar valores calculados al cargar conceptos
  useEffect(() => {
    recalcularValoresCalculados();
  }, [conceptos, recalcularValoresCalculados]);
  // Cargar conceptos desde el backend al montar el componente (ejemplo para CCT 130/75)
  useEffect(() => {
    if (activeStep === 2 && conceptos.length === 0) {
      setConceptosLoading(true);
      fetch("http://localhost:4000/api/conceptos/cct130_75")
        .then((res) => res.json())
        .then((data) => {
          setConceptos(data);
          // Inicializar valores editables
          const inicial: { [key: string]: string } = {};
          data.forEach((c: any) => {
            inicial[c.nombre] = "";
          });
          setValores(inicial);
        })
        .finally(() => setConceptosLoading(false));
    }
  }, [activeStep, conceptos.length]);

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

  // Eliminar handleChange y handleSelectChange porque ahora se usan setValores para los conceptos dinámicos

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
        // Paso 3: Renderizar conceptos dinámicos en tabla
        if (conceptosLoading)
          return <Typography>Cargando conceptos...</Typography>;
        if (!conceptos.length)
          return <Typography>No hay conceptos para mostrar.</Typography>;
        // ...

        const getUnidad = (c: any) => {
          if (c.nombre === "Sueldo básico") return 30;
          if (c.porcentaje)
            return (parseFloat(c.porcentaje) * 100).toFixed(2) + "%";
          return "";
        };
        // Horas extras: inputs ocultos y desplegables
        const esHorasExtras = (c: any) =>
          c.nombre.toLowerCase().includes("horas extras");
        return (
          <Box>
            <Typography
              variant="h4"
              sx={{
                mb: 2,
                fontWeight: 800,
                color: "#1565C0",
                textAlign: "center",
              }}
            >
              Liquidación de haberes
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                mb: 3,
                gap: 2,
                pl: 1,
              }}
            >
              {/* Datos del empleado */}
              {employeeFound && (
                <Box
                  sx={{
                    background: "#f5f5f5",
                    borderRadius: 2,
                    p: 1.2,
                    minWidth: 200,
                    maxWidth: 230,
                    boxShadow: "0 1px 6px #bbb",
                    fontSize: 14,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                    mr: 1,
                  }}
                >
                  <span>
                    <strong>Nombre:</strong> {employeeFound.nombre}
                  </span>
                  <span>
                    <strong>Apellido:</strong> {employeeFound.apellido}
                  </span>
                  <span>
                    <strong>DNI:</strong> {employeeFound.dni}
                  </span>
                </Box>
              )}
              <MuiTextField
                label="Periodo a liquidar"
                type="month"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                sx={{
                  minWidth: 200,
                  ml: 35,
                  fontSize: 16,
                  background: "#f5f5f5",
                  borderRadius: 2,
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <table
                style={{
                  fontSize: 22,
                  minWidth: 800,
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 2px 12px #bbb",
                  borderCollapse: "collapse",
                  fontFamily: "Segoe UI, Arial, sans-serif",
                }}
              >
                <thead>
                  <tr style={{ background: "#e3f2fd" }}>
                    <th
                      style={{ padding: 16, borderBottom: "2px solid #90caf9" }}
                    >
                      Concepto
                    </th>
                    <th
                      style={{ padding: 16, borderBottom: "2px solid #90caf9" }}
                    >
                      Unidad
                    </th>
                    <th
                      style={{ padding: 16, borderBottom: "2px solid #90caf9" }}
                    >
                      Tipo
                    </th>
                    <th
                      style={{ padding: 16, borderBottom: "2px solid #90caf9" }}
                    >
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {conceptos.map((c, idx, arr) => {
                    if (esHorasExtras(c)) {
                      return (
                        <tr key={c.id}>
                          <td style={{ padding: 12 }}>{c.nombre}</td>
                          <td style={{ padding: 12, textAlign: "center" }}>
                            {getUnidad(c)}
                          </td>
                          <td style={{ padding: 12 }}>{c.tipo}</td>
                          <td style={{ padding: 12 }}>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                              }}
                            >
                              <input
                                type="number"
                                style={{
                                  fontSize: 20,
                                  padding: 6,
                                  width: 110,
                                  borderRadius: 6,
                                  border: "1px solid #90caf9",
                                  marginBottom: 2,
                                }}
                                value={valores[c.nombre] || ""}
                                onChange={(e) =>
                                  setValores((v) => ({
                                    ...v,
                                    [c.nombre]: e.target.value,
                                  }))
                                }
                              />
                              <span
                                style={{
                                  fontSize: 13,
                                  color: "#888",
                                  marginTop: 2,
                                }}
                              >
                                {c.tipo.charAt(0).toUpperCase() +
                                  c.tipo.slice(1)}
                              </span>
                            </Box>
                          </td>
                        </tr>
                      );
                    }
                    const isSueldoBasico = c.nombre === "Sueldo básico";
                    const isAdicional =
                      c.nombre.toLowerCase().includes("asistencia") ||
                      c.nombre.toLowerCase().includes("puntualidad");
                    const nextIsNotAdicional =
                      arr[idx + 1] &&
                      !(
                        arr[idx + 1].nombre
                          .toLowerCase()
                          .includes("asistencia") ||
                        arr[idx + 1].nombre
                          .toLowerCase()
                          .includes("puntualidad")
                      );
                    return (
                      <React.Fragment key={c.id}>
                        <tr>
                          <td style={{ padding: 12 }}>{c.nombre}</td>
                          <td style={{ padding: 12, textAlign: "center" }}>
                            {getUnidad(c)}
                          </td>
                          <td style={{ padding: 12 }}>{c.tipo}</td>
                          <td style={{ padding: 12 }}>
                            {isSueldoBasico ? (
                              <input
                                type="number"
                                style={{
                                  fontSize: 20,
                                  padding: 6,
                                  width: 140,
                                  borderRadius: 6,
                                  border: "1px solid #90caf9",
                                }}
                                value={valores[c.nombre] || ""}
                                onChange={(e) =>
                                  setValores((v) => ({
                                    ...v,
                                    [c.nombre]: e.target.value,
                                  }))
                                }
                                onBlur={recalcularValoresCalculados}
                              />
                            ) : c.editable ? (
                              <input
                                type="number"
                                style={{
                                  fontSize: 20,
                                  padding: 6,
                                  width: 140,
                                  borderRadius: 6,
                                  border: "1px solid #90caf9",
                                }}
                                value={valores[c.nombre] || ""}
                                onChange={(e) =>
                                  setValores((v) => ({
                                    ...v,
                                    [c.nombre]: e.target.value,
                                  }))
                                }
                              />
                            ) : (
                              <input
                                type="number"
                                style={{
                                  fontSize: 20,
                                  padding: 6,
                                  width: 140,
                                  borderRadius: 6,
                                  border: "1px solid #90caf9",
                                  background: "#f0f4f8",
                                  color: "#1976d2",
                                  fontWeight: 600,
                                }}
                                value={valoresCalculados[c.nombre] ?? ""}
                                readOnly
                                tabIndex={-1}
                              />
                            )}
                          </td>
                        </tr>
                        {/* Insertar el Accordion debajo del adicional por asistencia y puntualidad */}
                        {isAdicional &&
                          (nextIsNotAdicional || idx === arr.length - 1) && (
                            <tr>
                              <td colSpan={4} style={{ padding: 0, border: 0 }}>
                                <Accordion
                                  sx={{
                                    mt: 1,
                                    mb: 2,
                                    width: 350,
                                    marginLeft: 2,
                                  }}
                                >
                                  <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                  >
                                    <Typography
                                      sx={{ fontSize: 16, fontWeight: 500 }}
                                    >
                                      Agregar Horas Extras
                                    </Typography>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        gap: 2,
                                        justifyContent: "center",
                                      }}
                                    >
                                      {conceptos
                                        .filter(esHorasExtras)
                                        .map((c) => (
                                          <Box
                                            key={c.id}
                                            sx={{
                                              display: "flex",
                                              flexDirection: "column",
                                              alignItems: "center",
                                            }}
                                          >
                                            <Typography
                                              sx={{ fontSize: 15, mb: 0.5 }}
                                            >
                                              {c.nombre}
                                            </Typography>
                                            <Typography
                                              sx={{
                                                fontSize: 13,
                                                color: "#888",
                                                mb: 1,
                                              }}
                                            >
                                              {c.tipo.charAt(0).toUpperCase() +
                                                c.tipo.slice(1)}
                                            </Typography>
                                            <input
                                              type="number"
                                              style={{
                                                fontSize: 18,
                                                padding: 5,
                                                width: 110,
                                                borderRadius: 6,
                                                border: "1px solid #90caf9",
                                              }}
                                              value={valores[c.nombre] || ""}
                                              onChange={(e) =>
                                                setValores((v) => ({
                                                  ...v,
                                                  [c.nombre]: e.target.value,
                                                }))
                                              }
                                            />
                                          </Box>
                                        ))}
                                    </Box>
                                  </AccordionDetails>
                                </Accordion>
                              </td>
                            </tr>
                          )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
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
