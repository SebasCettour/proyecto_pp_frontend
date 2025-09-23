import { Logout } from "@mui/icons-material";
import { Button } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function BtnCerrarSesion() {
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <Button
      onClick={handleCerrarSesion}
      startIcon={<Logout />}
      variant="outlined"
      sx={{
        position: "absolute",
        top: 45,
        right: 95,
        border: "2px solid #3f5ec3ff",
        borderRadius: 3,
        backgroundColor: "#1976d2",
        color: "#fff",
        fontWeight: 600,
        fontFamily: "Tektur, sans-serif",
        textTransform: "none",
        "&:hover": { backgroundColor: "#1565C0", borderColor: "#1565C0" },
      }}
    >
      Cerrar Sesión
    </Button>
  );
}
