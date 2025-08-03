import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { z } from "zod";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";

import Footer from "../../components/Footer";

const novedadSchema = z.object({
  contenido: z.string().min(1, "El contenido es obligatorio"),
});

type NovedadFormData = z.infer<typeof novedadSchema>;

const PublicarNovedad: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [mensajeExito, setMensajeExito] = React.useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NovedadFormData>({
    resolver: zodResolver(novedadSchema),
  });

  const onSubmit = async (data: NovedadFormData) => {
    try {
      setIsLoading(true);
      setError("");
      setMensajeExito("");

      console.log("Publicando novedad:", data);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMensajeExito("Novedad publicada exitosamente");
      reset();
    } catch (err) {
      setError("Ocurrió un error al publicar la novedad.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#C0C0C0",
      }}
    >
      {/* Encabezado */}
      <Box
        sx={{
          textAlign: "left",
          py: 4,
          backgroundColor: "#000000",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontFamily: "Tektur, sans-serif",
            fontWeight: 700,
            color: "#333",
            marginLeft: "10px",
          }}
        >
          <span style={{ color: "#CC5500" }}>360</span>
          <span style={{ color: "#ffffff" }}>Sueldos</span>
        </Typography>
      </Box>

      {/* Botón Volver */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, px: 4 }}>
        <Button
          component={Link}
          to="/rrhh-principal"
          variant="outlined"
          sx={{
            backgroundColor: "#1565C0",
            color: "#ffffff",
            width: 180,
            letterSpacing: 3,
            fontSize: 20,
            borderRadius: 3,
            mr: 5,
            fontFamily: "Tektur, sans-serif",
            fontWeight: 500,
            textTransform: "none",
          }}
        >
          Volver
        </Button>
      </Box>

      {/* Contenedor principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: 4,
          mt: 8,
          width: "100%",
          maxWidth: "1000px",
          mx: "auto",
          backgroundColor: "white",
          borderRadius: 2,
          p: 4,
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          component="h1"
          variant="h4"
          sx={{
            mb: 4,
            fontFamily: "Tektur, sans-serif",
            fontWeight: 600,
            color: "#333",
          }}
        >
          Publicar Novedad
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 3 }}>
            {error}
          </Alert>
        )}

        {mensajeExito && (
          <Alert severity="success" sx={{ width: "100%", mb: 3 }}>
            {mensajeExito}
          </Alert>
        )}

        {/* Formulario */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ width: "100%" }}
        >
          <Box sx={{ width: "100%", mb: 4 }}>
            <Typography
              component="label"
              htmlFor="contenido"
              sx={{
                display: "block",
                mb: 1,
                fontFamily: "Tektur, sans-serif",
                fontWeight: 500,
                color: "#333",
              }}
            >
              Mensaje:
            </Typography>
            <TextField
              fullWidth
              id="contenido"
              multiline
              rows={6}
              {...register("contenido")}
              error={!!errors.contenido}
              helperText={errors.contenido?.message}
              disabled={isLoading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                },
              }}
            />
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                py: 1.5,
                width: 200,
                fontFamily: "Tektur, sans-serif",
                fontWeight: 600,
                fontSize: "1.1rem",
                borderRadius: 1,
                textTransform: "none",
                letterSpacing: 2,
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Enviar"
              )}
            </Button>
          </Box>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};

export default PublicarNovedad;
