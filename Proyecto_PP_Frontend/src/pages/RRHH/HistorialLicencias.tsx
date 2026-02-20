import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Chip,
  TextField,
  Container,
  Link as MuiLink,
  Alert,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import BackButton from "../../components/BackButton";
import ReusableTablePagination from "../../components/ReusableTablePagination";
import useTablePagination from "../../hooks/useTablePagination";
import paginate from "../../utils/paginate";

interface Licencia {
  Id_Licencia: number;
  Nombre?: string;
  Apellido?: string;
  Documento?: string;
  Motivo: string;
  Observaciones?: string;
  CertificadoMedico?: string;
  DiagnosticoCIE10_Codigo?: string;
  DiagnosticoCIE10_Descripcion?: string;
  Estado: "Pendiente" | "Aprobada" | "Rechazada";
  FechaSolicitud: string;
  FechaRespuesta?: string;
  MotivoRechazo?: string;
  NombreEmpleado?: string;
  ApellidoEmpleado?: string;
  FechaInicio?: string;
  FechaFin?: string;
  diasPedidos?: number | null;
  diasRestantes?: number | null;
}

export default function GestionarLicencias() {
  // estado para búsqueda por DNI/nombre y resultado de historial
  const [searchTerm, setSearchTerm] = useState("");
  const [historial, setHistorial] = useState<Licencia[]>([]);
  const {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    resetPagination,
  } = useTablePagination();
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  // Estado para vacaciones
  const [vacaciones, setVacaciones] = useState<{
    antiguedad: number;
    diasVacaciones: number;
    diasTomados: number;
    diasDisponibles: number;
  } | null>(null);
  const [empleadosEncontrados, setEmpleadosEncontrados] = useState<any[]>([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<any | null>(null);

  const empleadoNombre =
    historial.length > 0
      ? `${historial[0].NombreEmpleado || historial[0].Nombre || ''} ${historial[0].ApellidoEmpleado || historial[0].Apellido || ''}`.trim() || searchTerm
      : empleadoSeleccionado?.nombre || searchTerm;
  const empleadoDocumento = historial.length > 0 ? historial[0].Documento || '' : empleadoSeleccionado?.dni || '';

  const userName =
    localStorage.getItem("nombre") ||
    localStorage.getItem("username") ||
    "Usuario";

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";

    const match = String(dateString).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      return new Date(year, month - 1, day).toLocaleDateString("es-ES");
    }

    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString("es-ES");
  };

  const esMotivoConDescuento = (motivo?: string) => {
    const normalizado = String(motivo || "").trim().toLowerCase();
    return normalizado === "vacaciones" || normalizado === "personal";
  };

  const calcularDiasPedidos = (lic: Licencia): number | null => {
    if (typeof lic.diasPedidos === "number" && lic.diasPedidos > 0) {
      return lic.diasPedidos;
    }

    if (!lic.FechaInicio || !lic.FechaFin) return null;

    const inicio = new Date(lic.FechaInicio);
    const fin = new Date(lic.FechaFin);
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) return null;

    const dias =
      Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return dias > 0 ? dias : null;
  };

  const historialConCalculos = useMemo(() => {
    if (!historial.length) return [];

    const calculadoPorId = new Map<
      number,
      { diasPedidosView: number | null; diasRestantesView: number | null }
    >();

    const ordenCronologico = [...historial].sort((a, b) => {
      const fechaA = new Date(a.FechaSolicitud || 0).getTime();
      const fechaB = new Date(b.FechaSolicitud || 0).getTime();
      return fechaA - fechaB;
    });

    let restantesAcumulados =
      typeof vacaciones?.diasVacaciones === "number"
        ? vacaciones.diasVacaciones
        : null;

    ordenCronologico.forEach((lic) => {
      if (!esMotivoConDescuento(lic.Motivo)) {
        calculadoPorId.set(lic.Id_Licencia, {
          diasPedidosView: null,
          diasRestantesView: null,
        });
        return;
      }

      const diasPedidosView = calcularDiasPedidos(lic);

      let diasRestantesView: number | null = null;
      if (typeof lic.diasRestantes === "number") {
        diasRestantesView = lic.diasRestantes;
      } else if (
        restantesAcumulados !== null &&
        diasPedidosView !== null
      ) {
        restantesAcumulados = Math.max(restantesAcumulados - diasPedidosView, 0);
        diasRestantesView = restantesAcumulados;
      }

      calculadoPorId.set(lic.Id_Licencia, {
        diasPedidosView,
        diasRestantesView,
      });
    });

    return historial.map((lic) => ({
      ...lic,
      ...(calculadoPorId.get(lic.Id_Licencia) || {
        diasPedidosView: null,
        diasRestantesView: null,
      }),
    }));
  }, [historial, vacaciones?.diasVacaciones]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return "warning";
      case "Aprobada":
        return "success";
      case "Rechazada":
        return "error";
      default:
        return "default";
    }
  };

  const fetchHistorial = async (search: string) => {
    if (!search.trim()) return;
    setSearched(true);
    resetPagination();
    setLoadingHistorial(true);
    setSearchError(null);
    setVacaciones(null);
    try {
      const token = localStorage.getItem("token");
      const searchRes = await fetch(
        `http://localhost:4000/api/usuario/empleado-buscar/${encodeURIComponent(search)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!searchRes.ok) {
        setSearchError("Empleado no encontrado");
        setHistorial([]);
        setVacaciones(null);
        setEmpleadosEncontrados([]);
        setEmpleadoSeleccionado(null);
        setLoadingHistorial(false);
        return;
      }
      const empleadoData = await searchRes.json();
      let dni: string;
      let vacacionesData = null;
      if (Array.isArray(empleadoData)) {
        if (empleadoData.length === 0) {
          setSearchError("No se encontraron empleados");
          setHistorial([]);
          setVacaciones(null);
          setEmpleadosEncontrados([]);
          setEmpleadoSeleccionado(null);
          setLoadingHistorial(false);
          return;
        } else if (empleadoData.length > 1) {
          setEmpleadosEncontrados(empleadoData);
          setHistorial([]);
          setVacaciones(null);
          setEmpleadoSeleccionado(null);
          setSearchError(null);
          setLoadingHistorial(false);
          return;
        }
        dni = empleadoData[0].dni;
        vacacionesData = empleadoData[0].vacaciones || null;
        setEmpleadoSeleccionado(empleadoData[0]);
        setEmpleadosEncontrados([]);
      } else {
        dni = empleadoData.dni;
        vacacionesData = empleadoData.vacaciones || null;
        setEmpleadoSeleccionado(empleadoData);
        setEmpleadosEncontrados([]);
      }
      setVacaciones(vacacionesData);
      const res = await fetch(
        `http://localhost:4000/api/licencias/historial/${encodeURIComponent(dni)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setHistorial(data);
      } else {
        setHistorial([]);
      }
    } catch (error) {
      setSearchError("Error al buscar el historial");
      setHistorial([]);
      setVacaciones(null);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const historialConCalculosPaginado = paginate(
    historialConCalculos,
    page,
    rowsPerPage
  );

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

      {/* Encabezado usuario / menú reducido */}
      <Box
        sx={{
          position: "absolute",
          top: 35,
          right: 32,
          display: "flex",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            mr: 1,
          }}
        >
          <Typography sx={{ fontWeight: 400, fontSize: 16 }}>
            Bienvenido/a
          </Typography>
          <Typography sx={{ fontWeight: 600, fontSize: 18, color: "#1976d2" }}>
            {userName}
          </Typography>
        </Box>
      </Box>

            {/* Botón Volver */}
            <BackButton to="/rrhh-principal" />


      {/* Contenido principal: buscador + listado (sin botones de acción) */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", pt: 10 }}>
        <Container maxWidth="lg" sx={{ alignSelf: "center", mt: 4, mb: 2 }}>
          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 6,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 700,
              color: "#333",
              textAlign: "center",
              letterSpacing: 1,
            }}
          >
            Historial de Licencias
          </Typography>
          
          <Box
            sx={{
              backgroundColor: "white",
              borderRadius: 2,
              p: 4,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            {searchError && (
              <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
                {searchError}
              </Alert>
            )}

            <TextField
              fullWidth
              label="DNI, Nombre o Apellido"
              placeholder="Ej: 12345678, Juan, Pérez"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              disabled={loadingHistorial}
              sx={{
                mt: 1,
                mb: 1.5,
                "& .MuiOutlinedInput-root": { borderRadius: 1 },
                fontFamily: "Tektur, sans-serif",
              }}
            />

            <Button
              variant="contained"
              onClick={() => fetchHistorial(searchTerm.trim())}
              disabled={!searchTerm.trim() || loadingHistorial}
              sx={{
                py: 1.5,
                fontFamily: "Tektur, sans-serif",
                fontWeight: 600,
                fontSize: "1.1rem",
                borderRadius: 1,
                textTransform: "none",
                width: "100%",
              }}
            >
              {loadingHistorial ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Buscar"
              )}
            </Button>

            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm("");
                setHistorial([]);
                resetPagination();
                setSearched(false);
                setSearchError(null);
                setEmpleadosEncontrados([]);
                setEmpleadoSeleccionado(null);
                setVacaciones(null);
              }}
              sx={{
                mt: 1,
                width: "100%",
                textTransform: "none",
                borderRadius: 1,
                fontFamily: "Tektur, sans-serif",
              }}
            >
              Limpiar
            </Button>
          </Box>
        </Container>

        {loadingHistorial ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <CircularProgress />
          </Box>
        ) : empleadosEncontrados.length > 0 ? (
          <TableContainer
            component={Paper}
            sx={{
              mt: 2,
              mx: 4,
              mb: 3,
              maxWidth: 900,
              alignSelf: "center",
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.15rem' }, p: 2 }}>
              Seleccione un empleado:
            </Typography>
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#1976d2" }}>
                <TableRow>
                  <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Nombre</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Apellido</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 700 }}>DNI</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Categoría</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Antigüedad</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Vacaciones</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 700 }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {empleadosEncontrados.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>{emp.nombre}</TableCell>
                    <TableCell>{emp.apellido}</TableCell>
                    <TableCell>{emp.dni}</TableCell>
                    <TableCell>{emp.categoria}</TableCell>
                    <TableCell>{emp.vacaciones?.antiguedad ?? '-'}</TableCell>
                    <TableCell>{emp.vacaciones ? `${emp.vacaciones.diasDisponibles} / ${emp.vacaciones.diasVacaciones}` : '-'}</TableCell>
                    <TableCell>
                      <Button variant="contained" size="small" onClick={async () => {
                        setEmpleadoSeleccionado(emp);
                        setVacaciones(emp.vacaciones || null);
                        setEmpleadosEncontrados([]);
                        resetPagination();
                        setLoadingHistorial(true);
                        setHistorial([]);
                        const token = localStorage.getItem("token");
                        const res = await fetch(`http://localhost:4000/api/licencias/historial/${encodeURIComponent(emp.dni)}`, {
                          headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                          },
                        });
                        if (res.ok) {
                          const data = await res.json();
                          setHistorial(data);
                        } else {
                          setHistorial([]);
                        }
                        setLoadingHistorial(false);
                      }}>Ver historial</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : historial.length > 0 ? (
          <TableContainer
            component={Paper}
            sx={{
              mt: 1,
              mx: 4,
              mb: 3,
              maxWidth: 1200,
              alignSelf: "center",
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              backgroundColor: '#f8f9fb',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              width: '100%',
              boxSizing: 'border-box',
              color: '#333',
              gap: 2
            }}>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Historial de licencias de: {empleadoNombre}
              </Typography>
              {vacaciones && (
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  background: '#e3f2fd',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  minWidth: 180
                }}>
                  <Typography sx={{ fontWeight: 600, color: '#1976d2', fontSize: '1rem' }}>
                    Vacaciones: {vacaciones.diasDisponibles} / {vacaciones.diasVacaciones} días
                  </Typography>
                  <Typography sx={{ fontSize: '0.95rem', color: '#333' }}>
                    Tomados: {vacaciones.diasTomados}
                  </Typography>
                </Box>
              )}
            </Box>
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#6c757d" }}>
                <TableRow>
                  <TableCell sx={{ color: "#fff", fontWeight: 700, textAlign: "center", fontSize: { xs: "0.85rem", sm: "0.95rem" }, py: 1.25 }}>Fecha Solicitud</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 700, textAlign: "center", fontSize: { xs: "0.85rem", sm: "0.95rem" }, py: 1.25 }}>Nombre</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 700, textAlign: "center", fontSize: { xs: "0.85rem", sm: "0.95rem" }, py: 1.25 }}>Documento</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 700, textAlign: "center", fontSize: { xs: "0.85rem", sm: "0.95rem" }, py: 1.25 }}>Motivo</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 700, textAlign: "center", fontSize: { xs: "0.85rem", sm: "0.95rem" }, py: 1.25 }}>Días Pedidos</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 700, textAlign: "center", fontSize: { xs: "0.85rem", sm: "0.95rem" }, py: 1.25 }}>Días Restantes</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 700, textAlign: "center", fontSize: { xs: "0.85rem", sm: "0.95rem" }, py: 1.25 }}>Estado</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 700, textAlign: "center", fontSize: { xs: "0.85rem", sm: "0.95rem" }, py: 1.25 }}>Certificado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historialConCalculosPaginado.map((lic: any) => (
                  <TableRow key={lic.Id_Licencia} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fbfcfd" }, "&:hover": { backgroundColor: "#eaf4ff" } }}>
                    <TableCell align="center" sx={{ fontSize: { xs: "0.9rem", sm: "0.95rem" }, py: 1.25 }}>
                      {formatDate(lic.FechaSolicitud)}
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: { xs: "0.9rem", sm: "0.95rem" }, py: 1.25 }}>
                      {`${lic.NombreEmpleado || lic.Nombre || ''} ${lic.ApellidoEmpleado || lic.Apellido || ''}`.trim()}
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: { xs: "0.9rem", sm: "0.95rem" }, py: 1.25 }}>
                      {lic.Documento}
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: { xs: "0.9rem", sm: "0.95rem" }, py: 1.25 }}>
                      {lic.Motivo}
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: { xs: "0.9rem", sm: "0.95rem" }, py: 1.25 }}>
                      {lic.diasPedidosView ?? "-"}
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: { xs: "0.9rem", sm: "0.95rem" }, py: 1.25 }}>
                      {lic.diasRestantesView ?? "-"}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.25 }}>
                      <Chip
                        label={lic.Estado}
                        color={getEstadoColor(lic.Estado) as any}
                        size="medium"
                        sx={{ fontWeight: 600, fontSize: "0.85rem" }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.25 }}>
                      {lic.CertificadoMedico ? (
                        <Button
                          component="a"
                          href={(lic as any).CertificadoMedicoUrl || `/uploads/certificados/${lic.CertificadoMedico}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          sx={{ textTransform: "none" }}
                        >
                          Ver
                        </Button>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.9rem" }}>
                          No
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <ReusableTablePagination
              count={historialConCalculos.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        ) : searched && historial.length === 0 ? (
          <Box sx={{ mx: 4, alignSelf: "center", mb: 3 }}>
            <Typography
              color="text.secondary"
              sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
            >
              No se encontraron licencias para ese empleado.
            </Typography>
          </Box>
        ) : null}
      </Box>

      <Footer />
    </Box>
  );
}