import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Collapse,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";
import { Link } from "react-router-dom";

interface Liquidacion {
  Id_Liquidacion: number;
  Id_Empleado: number;
  Periodo: string;
  FechaLiquidacion: string;
  FechaGeneracion: string;
  TotalHaberes: number;
  TotalDescuentos: number;
  TotalRemunerativo: number;
  TotalNoRemunerativo: number;
  NetoAPagar: number;
  Estado: "borrador" | "confirmada" | "pagada";
  EmpleadoNombre: string;
  EmpleadoApellido: string;
  EmpleadoDNI: string;
  SACActivo: boolean;
  AsistenciaActiva: boolean;
  EsAfiliadoSindicato: boolean;
  TipoJornada: string;
  HorasExtras50: number;
  HorasExtras100: number;
  SumaFijaNoRemunerativa: number;
  AdicionalTrasladoSeleccionado: string | null;
}

interface DetalleConcepto {
  Id_DetalleLiquidacion: number;
  Concepto: string;
  Monto: number;
}

const Historial: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [liquidaciones, setLiquidaciones] = useState<Liquidacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [detalles, setDetalles] = useState<{ [key: number]: DetalleConcepto[] }>({});
  const [loadingDetalles, setLoadingDetalles] = useState<{ [key: number]: boolean }>({});
  const [generandoPDF, setGenerandoPDF] = useState<{ [key: number]: boolean }>({});

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Por favor ingrese un DNI o Nombre/Apellido");
      return;
    }

    setLoading(true);
    setError("");
    setLiquidaciones([]);

    try {
      const response = await fetch(
        `http://localhost:4000/api/liquidacion/buscar?search=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLiquidaciones(data);
        if (data.length === 0) {
          setError("No se encontraron liquidaciones para la búsqueda");
        }
      } else {
        setError("Error al buscar liquidaciones");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExpandRow = async (idLiquidacion: number) => {
    if (expandedRow === idLiquidacion) {
      setExpandedRow(null);
      return;
    }

    setExpandedRow(idLiquidacion);

    // Si ya tenemos los detalles, no volver a buscarlos
    if (detalles[idLiquidacion]) {
      return;
    }

    // Cargar detalles de la liquidación
    setLoadingDetalles({ ...loadingDetalles, [idLiquidacion]: true });

    try {
      const response = await fetch(
        `http://localhost:4000/api/liquidacion/${idLiquidacion}/detalle`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDetalles({ ...detalles, [idLiquidacion]: data });
      }
    } catch (err) {
      console.error("Error cargando detalles:", err);
    } finally {
      setLoadingDetalles({ ...loadingDetalles, [idLiquidacion]: false });
    }
  };

  const handleGenerarPDF = async (idLiquidacion: number) => {
    setGenerandoPDF({ ...generandoPDF, [idLiquidacion]: true });

    try {
      // Primero generar el PDF
      const responseGenerar = await fetch(
        `http://localhost:4000/api/liquidacion/${idLiquidacion}/generar-pdf`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!responseGenerar.ok) {
        throw new Error("Error generando PDF");
      }

      // Luego descargarlo
      const responseDescargar = await fetch(
        `http://localhost:4000/api/liquidacion/${idLiquidacion}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!responseDescargar.ok) {
        throw new Error("Error descargando PDF");
      }

      // Crear blob y descargar
      const blob = await responseDescargar.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recibo_liquidacion_${idLiquidacion}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error("Error con PDF:", err);
      alert("Error al generar/descargar el PDF");
    } finally {
      setGenerandoPDF({ ...generandoPDF, [idLiquidacion]: false });
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "confirmada":
        return "success";
      case "pagada":
        return "primary";
      case "borrador":
        return "warning";
      default:
        return "default";
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

      <Container maxWidth="xl" sx={{ mt: 4, mb: 6, flexGrow: 1 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography
            variant="h4"
            sx={{
              mb: 4,
              fontWeight: 700,
              color: "#1565C0",
              textAlign: "center",
            }}
          >
            Historial de Liquidaciones
          </Typography>

          {/* Buscador */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 4,
              alignItems: "center",
            }}
          >
            <TextField
              fullWidth
              label="Buscar por DNI o Nombre/Apellido"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Ej: 12345678 o Juan Pérez"
            />
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={loading}
              sx={{
                minWidth: 150,
                height: 56,
                backgroundColor: "#1565C0",
                "&:hover": {
                  backgroundColor: "#0d47a1",
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Buscar"}
            </Button>
          </Box>

          {/* Mensajes de error */}
          {error && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Tabla de resultados */}
          {liquidaciones.length > 0 && (
            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
              <Table>
                <TableHead sx={{ backgroundColor: "#1565C0" }}>
                  <TableRow>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Empleado</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>DNI</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Periodo</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }} align="right">
                      Total Haberes
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }} align="right">
                      Total Descuentos
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }} align="right">
                      Neto a Pagar
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Estado</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }} align="center">
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {liquidaciones.map((liq) => (
                    <React.Fragment key={liq.Id_Liquidacion}>
                      <TableRow hover>
                        <TableCell>
                          {liq.EmpleadoApellido}, {liq.EmpleadoNombre}
                        </TableCell>
                        <TableCell>{liq.EmpleadoDNI}</TableCell>
                        <TableCell>{liq.Periodo}</TableCell>
                        <TableCell align="right">
                          ${liq.TotalHaberes.toLocaleString("es-AR")}
                        </TableCell>
                        <TableCell align="right">
                          ${liq.TotalDescuentos.toLocaleString("es-AR")}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: "#1565C0" }}>
                          ${liq.NetoAPagar.toLocaleString("es-AR")}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={liq.Estado.toUpperCase()}
                            color={getEstadoColor(liq.Estado) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleExpandRow(liq.Id_Liquidacion)}
                            color="primary"
                            title="Ver detalle"
                          >
                            {expandedRow === liq.Id_Liquidacion ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleGenerarPDF(liq.Id_Liquidacion)}
                            disabled={generandoPDF[liq.Id_Liquidacion]}
                            color="error"
                            title="Generar PDF"
                            sx={{ ml: 1 }}
                          >
                            {generandoPDF[liq.Id_Liquidacion] ? (
                              <CircularProgress size={20} />
                            ) : (
                              <PictureAsPdfIcon />
                            )}
                          </IconButton>
                        </TableCell>
                      </TableRow>

                      {/* Fila expandida con detalles */}
                      <TableRow>
                        <TableCell colSpan={8} sx={{ p: 0, borderBottom: "none" }}>
                          <Collapse
                            in={expandedRow === liq.Id_Liquidacion}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box sx={{ p: 3, backgroundColor: "#f5f5f5" }}>
                              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                                Detalle de Liquidación #{liq.Id_Liquidacion}
                              </Typography>

                              {/* Información general */}
                              <Box sx={{ mb: 3, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
                                <Paper sx={{ p: 2 }}>
                                  <Typography variant="caption" color="textSecondary">
                                    Total Remunerativo
                                  </Typography>
                                  <Typography variant="h6" color="primary">
                                    ${liq.TotalRemunerativo.toLocaleString("es-AR")}
                                  </Typography>
                                </Paper>
                                <Paper sx={{ p: 2 }}>
                                  <Typography variant="caption" color="textSecondary">
                                    Total No Remunerativo
                                  </Typography>
                                  <Typography variant="h6" color="secondary">
                                    ${liq.TotalNoRemunerativo.toLocaleString("es-AR")}
                                  </Typography>
                                </Paper>
                                <Paper sx={{ p: 2 }}>
                                  <Typography variant="caption" color="textSecondary">
                                    Tipo de Jornada
                                  </Typography>
                                  <Typography variant="h6">
                                    {liq.TipoJornada === "completa" ? "Completa" : 
                                     liq.TipoJornada === "dos_tercios" ? "2/3" : "Media"}
                                  </Typography>
                                </Paper>
                              </Box>

                              {/* Conceptos detallados */}
                              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
                                Conceptos:
                              </Typography>

                              {loadingDetalles[liq.Id_Liquidacion] ? (
                                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                                  <CircularProgress />
                                </Box>
                              ) : detalles[liq.Id_Liquidacion] ? (
                                <TableContainer component={Paper}>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Concepto</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                                          Monto
                                        </TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {detalles[liq.Id_Liquidacion].map((det) => (
                                        <TableRow key={det.Id_DetalleLiquidacion}>
                                          <TableCell>{det.Concepto}</TableCell>
                                          <TableCell align="right">
                                            ${det.Monto.toLocaleString("es-AR")}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              ) : (
                                <Alert severity="info">No hay detalles disponibles</Alert>
                              )}

                              {/* Información adicional */}
                              <Box sx={{ mt: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
                                {liq.SACActivo && <Chip label="SAC Activo" color="primary" size="small" />}
                                {liq.AsistenciaActiva && (
                                  <Chip label="Con Presentismo" color="success" size="small" />
                                )}
                                {liq.EsAfiliadoSindicato && (
                                  <Chip label="Afiliado Sindicato" color="info" size="small" />
                                )}
                                {(liq.HorasExtras50 > 0 || liq.HorasExtras100 > 0) && (
                                  <Chip
                                    label={`Horas Extras: ${liq.HorasExtras50 + liq.HorasExtras100}`}
                                    color="warning"
                                    size="small"
                                  />
                                )}
                              </Box>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
};

export default Historial;
