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
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

export default function GestionarLicencias() {
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
          mt: 5, mx: 4,
          mb: 5,
          maxWidth: 1200,
          alignSelf: "center",
          borderRadius: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#858789ff" }}>
            <TableRow>
              {["Fecha", "Legajo", "Nombre y Apellido", "Descripción de Solicitud", "Acciones"].map((header) => (
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

      {/* Footer */}
      <Box sx={{ mt: "auto" }}>
        <Footer />
      </Box>
    </Box>
  );
}
