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
      top: { xs: 12, sm: 20, md: 28 },
      right: { xs: 10, sm: 18, md: 32 },
      display: "flex",
      alignItems: "center",
      zIndex: 10,
      maxWidth: { xs: "calc(100vw - 20px)", sm: "70vw", md: "50vw" },
    }}
  >
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        mr: { xs: 0.5, sm: 1 },
        minWidth: 0,
      }}
    >
      <Typography
        sx={{
          fontWeight: 400,
          letterSpacing: { xs: 1, sm: 2 },
          fontFamily: "Tektur, sans-serif",
          fontSize: { xs: 12, sm: 14, md: 16 },
          color: "#333",
          lineHeight: 1.1,
        }}
      >
        Bienvenido/a
      </Typography>
      <Typography
        sx={{
          fontWeight: 600,
          letterSpacing: { xs: 0.5, sm: 1.5, md: 2 },
          fontFamily: "Tektur, sans-serif",
          fontSize: { xs: 13, sm: 16, md: 18 },
          color: "#1976d2",
          lineHeight: 1.1,
          maxWidth: { xs: 130, sm: 180, md: 240 },
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={userName}
      >
        {userName}
      </Typography>
    </Box>

    <IconButton
      onClick={handleMenuOpen}
      size="small"
      sx={{ p: { xs: 0.5, sm: 0.75, md: 1 } }}
    >
      <Settings sx={{ fontSize: { xs: 28, sm: 34, md: 40 } }} />
    </IconButton>

    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{
        sx: {
          minWidth: { xs: 180, sm: 210 },
        },
      }}
    >
      <MenuItem onClick={handleOpenModal}>Cambiar Contraseña</MenuItem>
      <MenuItem onClick={handleCerrarSesion}>Cerrar Sesión</MenuItem>
    </Menu>
  </Box>
);

export default MenuUsuario;