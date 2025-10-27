import { Box, Typography } from "@mui/material";

export default function Header() {
  return (
    <Box
      sx={{
        textAlign: "left",
        py: 4,
        background:
          "linear-gradient(to right, #000000, #888888 50%, #d5d2d2ff)", // negro, gris medio, gris claro
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontFamily: "Tektur, sans-serif",
          fontWeight: 700,
          color: "#333",
          marginLeft: "30px",
        }}
      >
        <span style={{ color: "#FF2F2B" }}>360</span>
        <span style={{ color: "#ffffff" }}>Sueldos</span>
      </Typography>
    </Box>
  );
}
