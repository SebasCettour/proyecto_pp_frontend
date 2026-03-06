import React from "react";
import { Box, Typography } from "@mui/material";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: { xs: 4, sm: 6, md: 8 },
        py: { xs: 2, sm: 3 },
        backgroundColor: "#000000",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        alignItems: "center",
        gap: { xs: 1, sm: 1.5, md: 2 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: "#ffffff",
          fontFamily: "Tektur, sans-serif",
          fontWeight: 400,
          textAlign: { xs: "center", md: "left" },
          flex: 1,
          width: "100%",
          fontSize: { xs: "0.8rem", sm: "0.875rem" },
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
          width: "100%",
          fontSize: { xs: "0.8rem", sm: "0.875rem" },
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
          textAlign: { xs: "center", md: "right" },
          flex: 1,
          width: "100%",
          fontSize: { xs: "0.8rem", sm: "0.875rem" },
        }}
      >
        Política de privacidad
      </Typography>
    </Box>
  );
};

export default Footer;
