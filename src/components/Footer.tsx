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
        px: 4,
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
        © {currentYear} 360Sueldos. Todos los derechos reservados.
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
        Política de privacidad
      </Typography>
    </Box>
  );
};

export default Footer;
