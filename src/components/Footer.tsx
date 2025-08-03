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
        textAlign: "center",
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: "#ffffff",
          fontFamily: "Tektur, sans-serif",
          fontWeight: 400,
        }}
      >
        © {currentYear} 360Sueldos. Todos los derechos reservados.
      </Typography>
    </Box>
  );
};

export default Footer;
