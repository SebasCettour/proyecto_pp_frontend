import React from "react";
import { Box, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import { Settings } from "@mui/icons-material";

interface MenuUsuarioProps {
  userName: string;
  anchorEl: null | HTMLElement;
  handleMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  handleMenuClose: () => void;
  handleOpenModal: () => void;
  handleCerrarSesion: () => void;
}

const MenuUsuario: React.FC<MenuUsuarioProps> = ({
  userName,
  anchorEl,
  handleMenuOpen,
  handleMenuClose,
  handleOpenModal,
  handleCerrarSesion,
}) => (
  <Box
    sx={{
      position: "absolute",
      top: 35,
      right: 32,
      display: "flex",
      alignItems: "center",
      zIndex: 10,
    }}
  >
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        mr: 1,
      }}
    >
      <Typography
        sx={{
          fontWeight: 400,
          letterSpacing: 2,
          fontFamily: "Tektur, sans-serif",
          fontSize: 16,
          color: "#333",
          lineHeight: 1.1,
        }}
      >
        Bienvenido/a
      </Typography>
      <Typography
        sx={{
          fontWeight: 600,
          letterSpacing: 2,
          fontFamily: "Tektur, sans-serif",
          fontSize: 18,
          color: "#1976d2",
          lineHeight: 1.1,
        }}
      >
        {userName}
      </Typography>
    </Box>
    <IconButton onClick={handleMenuOpen}>
      <Settings sx={{ fontSize: 40 }} />
    </IconButton>
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleOpenModal}>Cambiar Contraseña</MenuItem>
      <MenuItem onClick={handleCerrarSesion}>Cerrar Sesión</MenuItem>
    </Menu>
  </Box>
);

export default MenuUsuario;