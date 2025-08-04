import React from "react";
import { Box, Typography } from "@mui/material";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        py: 3,
        backgroundColor: "#000000",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        px: 4, // padding horizontal para separación con bordes
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: "#ffffff",
          fontFamily: "Tektur, sans-serif",
          fontWeight: 400,
          textAlign: "left",
          flex: 1,
        }}
      >
        {/* Texto izquierda */}
        Contacto: contacto@360sueldos.com
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: "#ffffff",
          fontFamily: "Tektur, sans-serif",
          fontWeight: 400,
          textAlign: "center",
          flex: 1,
        }}
      >
        {/* Texto centro */}© {currentYear} 360Sueldos. Todos los derechos
        reservados.
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: "#ffffff",
          fontFamily: "Tektur, sans-serif",
          fontWeight: 400,
          textAlign: "right",
          flex: 1,
        }}
      >
        {/* Texto derecha */}
        Política de privacidad
      </Typography>
    </Box>
  );
};

export default Footer;
