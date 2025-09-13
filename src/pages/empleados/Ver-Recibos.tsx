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
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";

// Simulación de recibos de sueldo
const recibos = [
  {
    id: 1,
    mes: "Julio",
    anio: 2025,
    monto: "$250.000",
    pdfUrl: "/recibos/recibo_julio_2025.pdf",
  },
  {
    id: 2,
    mes: "Junio",
    anio: 2025,
    monto: "$248.000",
    pdfUrl: "/recibos/recibo_junio_2025.pdf",
  },
  {
    id: 3,
    mes: "Mayo",
    anio: 2025,
    monto: "$245.000",
    pdfUrl: "/recibos/recibo_mayo_2025.pdf",
  },
];

export default function RecibosSueldo() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#C0C0C0",
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

      {/* Botón Volver */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, px: 4 }}>
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

      <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 4,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 600,
              color: "#333",
              textAlign: "center",
            }}
          >
           Ver y descargar Recibos de Sueldo
          </Typography>

      {/* Tabla de recibos */}
      <Box
        sx={{
          px: 4,
          py: 4,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <TableContainer
          component={Paper}
          sx={{
            width: "100%",
            maxWidth: 800,
            borderRadius: 2,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1565C0" }}>
                <TableCell
                  sx={{ color: "#fff", fontWeight: 700, width: "35%" }}
                >
                  Mes
                </TableCell>
                <TableCell
                  sx={{ color: "#fff", fontWeight: 700, width: "35%" }}
                >
                  Año
                </TableCell>
                <TableCell
                  sx={{ color: "#fff", fontWeight: 700, width: "30%" }}
                >
                  Acción
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recibos.map((recibo) => (
                <TableRow key={recibo.id}>
                  <TableCell>{recibo.mes}</TableCell>
                  <TableCell>{recibo.anio}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      href={recibo.pdfUrl}
                      download
                      sx={{
                        textTransform: "none",
                        fontFamily: "Tektur, sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      Descargar PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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
