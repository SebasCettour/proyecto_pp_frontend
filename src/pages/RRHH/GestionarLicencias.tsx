import React, { useState, useEffect } from "react";
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
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  const [licencias, setLicencias] = useState<Licencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLicencia, setSelectedLicencia] = useState<Licencia | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [respuesta, setRespuesta] = useState("");
  const [accion, setAccion] = useState<"Aprobada" | "Rechazada">("Aprobada");

  // Cargar licencias pendientes
  useEffect(() => {
    fetchLicencias();
  }, []);

  const fetchLicencias = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log("Token en fetchLicencias:", token);
      
      const response = await fetch("http://localhost:4000/api/licencias/pendientes", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Licencias recibidas:", data);
        setLicencias(data);
      } else {
        console.error('Error en la respuesta:', response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error cargando licencias:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponder = (licencia: Licencia) => {
    setSelectedLicencia(licencia);
    setModalOpen(true);
    setRespuesta("");
    setAccion("Aprobada");
  };

  const handleEnviarRespuesta = async () => {
    if (!selectedLicencia) return;

    try {
      const response = await fetch(
        `http://localhost:4000/api/licencias/responder/${selectedLicencia.Id_Licencia}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            estado: accion,
            motivoRechazo: accion === "Rechazada" ? respuesta : null,
          }),
        }
      );

      if (response.ok) {
        fetchLicencias();
        setModalOpen(false);
        setSelectedLicencia(null);
      }
    } catch (error) {
      console.error("Error enviando respuesta:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Pendiente": return "warning";
      case "Aprobada": return "success";
      case "Rechazada": return "error";
      default: return "default";
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

      {/* Contenido principal - se expande para empujar el footer hacia abajo */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
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

        {/* Tabla de solicitudes */}
        <TableContainer
          component={Paper}
          sx={{
            mt: 5,
            mx: 4,
            mb: 5,
            maxWidth: 1400,
            alignSelf: "center",
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "#858789ff" }}>
              <TableRow>
                {["Fecha", "Documento", "Nombre y Apellido", "Área", "Motivo", "Estado", "Acciones"].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      color: "#fff",
                      fontWeight: 600,
                      fontFamily: "Tektur, sans-serif",
                      textAlign: "center",
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : licencias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="h6" color="text.secondary">
                      No hay solicitudes pendientes
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                licencias.map((licencia) => (
                  <TableRow
                    key={licencia.Id_Licencia}
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" },
                      "&:hover": { backgroundColor: "#e3f2fd" },
                    }}
                  >
                    <TableCell align="center">
                      {formatDate(licencia.FechaSolicitud)}
                    </TableCell>
                    <TableCell align="center">{licencia.Documento}</TableCell>
                    <TableCell align="center">
                      {`${licencia.Nombre} ${licencia.Apellido}`}
                    </TableCell>
                    <TableCell align="center">{licencia.Area}</TableCell>
                    <TableCell align="center">{licencia.Motivo}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={licencia.Estado}
                        color={getEstadoColor(licencia.Estado) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {licencia.Estado === "Pendiente" && (
                        <Button
                          variant="contained"
                          onClick={() => handleResponder(licencia)}
                          sx={{
                            textTransform: "none",
                            backgroundColor: "#1565C0",
                            ":hover": { backgroundColor: "#0D47A1" },
                            fontSize: 14,
                            py: 0.5,
                            px: 2,
                            borderRadius: 2,
                          }}
                        >
                          Responder
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Modal de respuesta */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 3,
            p: 4,
            minWidth: 500,
            maxWidth: "90vw",
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, fontFamily: "Tektur, sans-serif" }}>
            Responder Solicitud de Licencia
          </Typography>
          
          {selectedLicencia && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Solicitante:</strong> {selectedLicencia.Nombre} {selectedLicencia.Apellido}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Motivo:</strong> {selectedLicencia.Motivo}
              </Typography>
              {selectedLicencia.Observaciones && (
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Observaciones:</strong> {selectedLicencia.Observaciones}
                </Typography>
              )}
              {selectedLicencia.DiagnosticoCIE10_Codigo && (
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Diagnóstico CIE-10:</strong> {selectedLicencia.DiagnosticoCIE10_Codigo} - {selectedLicencia.DiagnosticoCIE10_Descripcion}
                </Typography>
              )}
            </Box>
          )}

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Decisión</InputLabel>
            <Select
              value={accion}
              onChange={(e) => setAccion(e.target.value as "Aprobada" | "Rechazada")}
            >
              <MenuItem value="Aprobada">Aprobar</MenuItem>
              <MenuItem value="Rechazada">Rechazar</MenuItem>
            </Select>
          </FormControl>

          {accion === "Rechazada" && (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Motivo del rechazo"
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              sx={{ mb: 3 }}
              required
            />
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleEnviarRespuesta}
              disabled={accion === "Rechazada" && !respuesta.trim()}
            >
              Enviar Respuesta
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Footer fijo en la parte inferior */}
      <Footer />
    </Box>
  );
}
