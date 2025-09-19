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
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import Footer from "../../components/Footer";

export default function GestionarLicencias() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#d9d6d6ff",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      {/* Encabezado */}
      <Box
        sx={{
          textAlign: "left",
          py: 4,
          backgroundColor: "#000000",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontFamily: "Tektur, sans-serif",
            fontWeight: 700,
            color: "#333",
            marginLeft: "10px",
            userSelect: "none",
          }}
        >
          <span style={{ color: "#CC5500" }}>360</span>
          <span style={{ color: "#ffffff" }}>Sueldos</span>
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, px: 4, mt: 4, boxSizing: "border-box" }}>
        {/* Botón Volver */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
          <Button
            component={RouterLink}
            to="/rrhh-principal"
            variant="contained"
            sx={{
              backgroundColor: "#1565C0",
              color: "#ffffff",
              width: 180,
              letterSpacing: 2,
              fontSize: 18,
              borderRadius: 3,
              mr: 5,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 500,
              textTransform: "none",
              "&:hover": { backgroundColor: "#0D47A1" },
            }}
          >
            Volver
          </Button>
        </Box>

        {/* Tabla de solicitudes */}
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
                {[
                  "Fecha",
                  "Legajo",
                  "Nombre y Apellido",
                  "Descripción de Solicitud",
                  "Acciones",
                ].map((header) => (
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
              {/* Fila de ejemplo */}
              <TableRow
                sx={{
                  "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" },
                  "&:hover": { backgroundColor: "#e3f2fd" },
                }}
              >
                <TableCell align="center">02/08/2025</TableCell>
                <TableCell align="center">12345</TableCell>
                <TableCell align="center">Juan Pérez</TableCell>
                <TableCell align="center">Licencia médica por 3 días</TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
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
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: "auto" }}>
        <Footer />
      </Box>
    </Box>
  );
}
