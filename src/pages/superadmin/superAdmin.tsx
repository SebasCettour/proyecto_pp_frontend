import React from "react";
import { useNavigate } from "react-router-dom";
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
import Footer from "../../components/Footer";

export const SuperAdminView: React.FC = () => {
  const navigate = useNavigate();

  // Funciones de navegación
  const handleIrANovedades = () => navigate("/novedades");
  const handleIrALicencias = () => navigate("/licencias");
  const handleIrAlTablon = () => navigate("/tablon");
  const handleIrALiquidacion = () => navigate("/liquidacion");
  const handleIrARecibos = () => navigate("/mis-recibos");
  const handleCerrarSesion = () => {
    localStorage.clear(); // Limpiar token y role
    navigate("/");
  };

  // Datos de ejemplo para la tabla (puedes reemplazarlos por datos reales)
  const usuarios = [
    { id: 1, nombre: "Juan Pérez", rol: "RRHH" },
    { id: 2, nombre: "Ana Gómez", rol: "Contador" },
    { id: 3, nombre: "Carlos Díaz", rol: "Empleado" },
  ];

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

      {/* Contenido principal */}
      <Box
        sx={{
          flexGrow: 1,
          px: 4,
          mt: 8,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Botón de cerrar sesión */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
          <Button
            onClick={handleCerrarSesion}
            variant="outlined"
            sx={{
              backgroundColor: "#1565C0",
              color: "#ffffff",
              width: 220,
              letterSpacing: 2,
              fontSize: 18,
              borderRadius: 3,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 500,
              textTransform: "none",
              "&:hover": { backgroundColor: "#0D47A1" },
            }}
          >
            Cerrar Sesión
          </Button>
        </Box>

        {/* Botones de navegación rápida */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 4 }}>
          <Button onClick={handleIrANovedades} variant="contained">
            Novedades
          </Button>
          <Button onClick={handleIrALicencias} variant="contained">
            Licencias
          </Button>
          <Button onClick={handleIrAlTablon} variant="contained">
            Tablón
          </Button>
          <Button onClick={handleIrALiquidacion} variant="contained">
            Liquidación
          </Button>
          <Button onClick={handleIrARecibos} variant="contained">
            Recibos
          </Button>
        </Box>

        {/* Tabla de ejemplo de usuarios */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Rol</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuarios.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.nombre}</TableCell>
                  <TableCell>{u.rol}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

// 🔹 Esto convierte el archivo en módulo y soluciona TS1208
export {};
