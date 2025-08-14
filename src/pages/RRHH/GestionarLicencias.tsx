import React from "react";
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

      <Box sx={{ flexGrow: 1, px: 4, mt: 4, boxSizing: "border-box" }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
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
              "&:hover": { backgroundColor: "#0D47A1" },
            }}
          >
            Volver
          </Button>
        </Box>

        {/* Tabla de solicitudes */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#eeeeee" }}>
              <TableRow>
                <TableCell>
                  <strong>Fecha</strong>
                </TableCell>
                <TableCell>
                  <strong>Legajo</strong>
                </TableCell>
                <TableCell>
                  <strong>Nombre y Apellido</strong>
                </TableCell>
                <TableCell>
                  <strong>Descripción de Solicitud</strong>
                </TableCell>
                <TableCell>
                  <strong>Acciones</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Fila de ejemplo */}
              <TableRow>
                <TableCell>02/08/2025</TableCell>
                <TableCell>12345</TableCell>
                <TableCell>Juan Pérez</TableCell>
                <TableCell>Licencia médica por 3 días</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      textTransform: "none",
                      backgroundColor: "#1565C0",
                      ":hover": { backgroundColor: "#0D47A1" },
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
      <Footer />
    </Box>
  );
}
