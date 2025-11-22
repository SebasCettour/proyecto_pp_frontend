import React from "react";
import { Box, Button } from "@mui/material";
import { Link } from "react-router-dom";

interface BackButtonProps {
  to: string;
  label?: string;
}

/**
 * Componente estandarizado para botón "Volver"
 * Uso: <BackButton to="/ruta" />
 */
const BackButton: React.FC<BackButtonProps> = ({ to, label = "Volver" }) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, px: 4 }}>
      <Button
        component={Link}
        to={to}
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
          fontWeight: 600,
          textTransform: "none",
          boxShadow: "0 2px 8px rgba(21,101,192,0.3)",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "#0d47a1",
            boxShadow: "0 4px 12px rgba(21,101,192,0.4)",
            transform: "translateY(-2px)",
          },
        }}
      >
        {label}
      </Button>
    </Box>
  );
};

export default BackButton;
