import React, { useState } from "react";
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
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

interface Licencia {
  Id_Licencia: number;
  Nombre: string;
  Apellido: string;
  Documento: string;
  Area: string;
  Motivo: string;
  Observaciones?: string;
  CertificadoMedico?: string;
  DiagnosticoCIE10_Codigo?: string;
  DiagnosticoCIE10_Descripcion?: string;
  Estado: "Pendiente" | "Aprobada" | "Rechazada";
  FechaSolicitud: string;
  FechaRespuesta?: string;
  MotivoRechazo?: string;
}

export default function GestionarLicencias() {
  // estado para búsqueda por DNI y resultado de historial
  const [dniSearch, setDniSearch] = useState("");
  const [historial, setHistorial] = useState<Licencia[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [searched, setSearched] = useState(false); // <- nuevo

  // mostrar nombre del empleado si el historial contiene datos
  const empleadoNombre =
    historial.length > 0
      ? `${historial[0].Nombre} ${historial[0].Apellido}`
      : dniSearch;

  const userName =
    localStorage.getItem("nombre") ||
    localStorage.getItem("username") ||
    "Usuario";

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-ES");

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

  const fetchHistorial = async (dni: string) => {
    if (!dni) return;
    setSearched(true); // marcar que se inició una búsqueda
    setLoadingHistorial(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:4000/api/licencias/historial/${encodeURIComponent(
          dni
        )}`,
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
    } catch {
      setHistorial([]);
    } finally {
      setLoadingHistorial(false);
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
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, px: 4 }}>
              <Button
                component={RouterLink}
                to="/rrhh-principal"
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


      {/* Contenido principal: buscador + listado (sin botones de acción) */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", pt: 10 }}>
        <Container maxWidth="sm" sx={{ alignSelf: "center", mt: 4, mb: 2 }}>
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
            <Typography
              component="h2"
              variant="h5"
              sx={{
                mb: 0,
                fontFamily: "Tektur, sans-serif",
                fontWeight: 600,
                color: "#333",
                textAlign: "center",
                letterSpacing: 0.5,
              }}
            >
              Buscar por DNI
            </Typography>

            <TextField
              fullWidth
              label="DNI"
              value={dniSearch}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDniSearch(e.target.value)
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
              onClick={() => fetchHistorial(dniSearch.trim())}
              disabled={!dniSearch.trim() || loadingHistorial}
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
                setDniSearch("");
                setHistorial([]);
                setSearched(false); // limpiar flag al resetear
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
            <Typography
              sx={{
                p: 2,
                fontWeight: 700,
                fontSize: { xs: "1rem", sm: "1.25rem" },
                backgroundColor: "#f8f9fb",
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                width: "100%",
                boxSizing: "border-box",
                color: "#333",
              }}
            >
              Historial de licencias de: {empleadoNombre}
            </Typography>
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#6c757d" }}>
                <TableRow>
                  {[
                    "Fecha Solicitud",
                    "Nombre",
                    "Documento",
                    "Área",
                    "Motivo",
                    "Estado",
                    "Certificado",
                  ].map((h: string) => (
                    <TableCell
                      key={h}
                      sx={{
                        color: "#fff",
                        fontWeight: 700,
                        textAlign: "center",
                        fontSize: { xs: "0.85rem", sm: "0.95rem" },
                        py: 1.25,
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {historial.map((lic: Licencia) => (
                  <TableRow
                    key={lic.Id_Licencia}
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "#fbfcfd" },
                      "&:hover": { backgroundColor: "#eaf4ff" },
                    }}
                  >
                    <TableCell
                      align="center"
                      sx={{
                        fontSize: { xs: "0.9rem", sm: "0.95rem" },
                        py: 1.25,
                      }}
                    >
                      {formatDate(lic.FechaSolicitud)}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontSize: { xs: "0.9rem", sm: "0.95rem" },
                        py: 1.25,
                      }}
                    >
                      {`${lic.Nombre} ${lic.Apellido}`}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontSize: { xs: "0.9rem", sm: "0.95rem" },
                        py: 1.25,
                      }}
                    >
                      {lic.Documento}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontSize: { xs: "0.9rem", sm: "0.95rem" },
                        py: 1.25,
                      }}
                    >
                      {lic.Area}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontSize: { xs: "0.9rem", sm: "0.95rem" },
                        py: 1.25,
                      }}
                    >
                      {lic.Motivo}
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
                          href={
                            (lic as any).CertificadoMedicoUrl ||
                            `/uploads/certificados/${lic.CertificadoMedico}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          sx={{ textTransform: "none" }}
                        >
                          Ver
                        </Button>
                      ) : (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: "0.9rem" }}
                        >
                          No
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
