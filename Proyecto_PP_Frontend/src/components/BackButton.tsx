import React from "react";
import { Box, Button } from "@mui/material";
import { Link } from "react-router-dom";

interface BackButtonProps {
  to: string;
  label?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ to, label = "Volver" }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: { xs: "center", sm: "flex-end" },
        mt: { xs: 1, sm: 1.5, md: 2 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Button
        component={Link}
        to={to}
        variant="contained"
        sx={{
          backgroundColor: "#1976d2",
          color: "#fff",
          width: { xs: "100%", sm: 170, md: 180 },
          maxWidth: 260,
          letterSpacing: { xs: 1, sm: 1.5, md: 2 },
          fontSize: { xs: 15, sm: 16, md: 18 },
          borderRadius: 3,
          fontFamily: "Tektur, sans-serif",
          fontWeight: 600,
          textTransform: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          "&:hover": { backgroundColor: "#115293" },
        }}
      >
        {label}
      </Button>
    </Box>
  );
};

export default BackButton;
