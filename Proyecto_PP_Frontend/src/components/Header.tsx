import { Box, Typography } from "@mui/material";

export default function Header() {
  return (
    <Box
      sx={{
        textAlign: "left",
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3, md: 0 },
        background:
          "linear-gradient(to right, #000000, #888888 50%, #d5d2d2ff)", // negro, gris medio, gris claro
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Typography
        component="h1"
        sx={{
          fontFamily: "Tektur, sans-serif",
          fontWeight: 700,
          color: "#333",
          ml: { xs: 0, sm: 1, md: "30px" },
          fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3.75rem" },
          lineHeight: 1.1,
          wordBreak: "break-word",
        }}
      >
        <span style={{ color: "#FF2F2B" }}>360</span>
        <span style={{ color: "#ffffff" }}>Sueldos</span>
      </Typography>
    </Box>
  );
}
