import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

const MisLicencias: React.FC = () => {
  const [licencias, setLicencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const documento = localStorage.getItem("documento") || "";

  useEffect(() => {
    const fetchLicencias = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:4000/api/licencias/mis-licencias/${documento}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) throw new Error("Error al obtener licencias");
        const data = await res.json();
        setLicencias(data);
      } catch (err) {
        setError("No se pudieron cargar las licencias");
      } finally {
        setLoading(false);
      }
    };
    if (documento) fetchLicencias();
  }, [documento]);

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

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-ES");
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

      {/* Contenido principal */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Botón Volver */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, px: 4 }}>
          <Button
            component={Link}
            to="/empleados"
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

        {/* Tabla de licencias */}
        <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, mb: 6, width: "100%" }}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
            Mis Licencias
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : licencias.length === 0 ? (
            <Typography>No tienes licencias registradas.</Typography>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                overflow: "hidden",
              }}
            >
              <Table>
                <TableHead sx={{ backgroundColor: "#858789ff" }}>
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{ color: "#fff", fontWeight: 600 }}
                    >
                      Motivo
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ color: "#fff", fontWeight: 600 }}
                    >
                      Fecha Inicio
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ color: "#fff", fontWeight: 600 }}
                    >
                      Fecha Fin
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ color: "#fff", fontWeight: 600 }}
                    >
                      Estado
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ color: "#fff", fontWeight: 600 }}
                    >
                      Fecha Respuesta
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ color: "#fff", fontWeight: 600 }}
                    >
                      Motivo Rechazo
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {licencias.map((lic) => (
                    <TableRow
                      key={lic.Id_Licencia}
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" },
                        "&:hover": { backgroundColor: "#e3f2fd" },
                      }}
                    >
                      <TableCell align="center">{lic.Motivo}</TableCell>
                      <TableCell align="center">
                        {formatDate(lic.FechaInicio)}
                      </TableCell>
                      <TableCell align="center">
                        {formatDate(lic.FechaFin)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={lic.Estado}
                          color={getEstadoColor(lic.Estado) as any}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {formatDate(lic.FechaRespuesta)}
                      </TableCell>
                      <TableCell align="center">
                        {lic.MotivoRechazo || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: "auto" }}>
        <Footer />
      </Box>
    </Box>
  );
};

export default MisLicencias;
