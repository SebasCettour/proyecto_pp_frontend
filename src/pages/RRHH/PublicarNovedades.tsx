import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  TextField,
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
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NovedadFormData>({
    resolver: zodResolver(novedadSchema),
    defaultValues: { contenido: "" },
  });

  const onSubmit = async (data: NovedadFormData) => {
    try {
      setIsLoading(true);
      setError("");
      setMensajeExito("");

      const idEmpleado = 1;

      const response = await fetch("http://localhost:4000/api/novedad/tablon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idEmpleado,
          descripcion: data.contenido,
        }),
      });

      if (!response.ok) throw new Error("Error al publicar la novedad");

      setMensajeExito("Novedad publicada exitosamente");
      reset();
    } catch (err) {
      setError("Ocurrió un error al publicar la novedad.");
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = useNavigate();
  const handleIrAlTablon = () => navigate("/tablon");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#d9d6d6ff",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      {/* Encabezado */}
      <Box
        sx={{
          textAlign: "left",
          py: 4,
          backgroundColor: "#000",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontFamily: "Tektur, sans-serif",
            fontWeight: 700,
            color: "#fff",
            marginLeft: "10px",
          }}
        >
          <span style={{ color: "#CC5500" }}>360</span>
          <span style={{ color: "#ffffff" }}>Sueldos</span>
        </Typography>
      </Box>

      {/* Botón Volver */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, px: 4 }}>
        <Button
          component={Link}
          to="/rrhh-principal"
          variant="contained"
          sx={{
            backgroundColor: "#1565C0",
            color: "#fff",
            width: 180,
            letterSpacing: 2,
            fontSize: 18,
            borderRadius: 3,
            fontFamily: "Tektur, sans-serif",
            fontWeight: 500,
            textTransform: "none",
            "&:hover": { backgroundColor: "#0D47A1" },
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
          mt: 4,
          width: "100%",
          maxWidth: "800px",
          mx: "auto",
          p: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          component="h1"
          variant="h4"
          sx={{
            mb: 5,
            fontFamily: "Tektur, sans-serif",
            fontWeight: 700,
            color: "#333",
            letterSpacing: 1,
          }}
        >
          Publicar Novedad
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{ width: "100%", mb: 3, borderRadius: 2, fontWeight: 500 }}
          >
            {error}
          </Alert>
        )}

        {mensajeExito && (
          <Alert
            severity="success"
            sx={{ width: "100%", mb: 3, borderRadius: 2, fontWeight: 500 }}
          >
            {mensajeExito}
          </Alert>
        )}

        {/* Formulario */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ width: "100%" }}
        >
          <Controller
            name="contenido"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Contenido"
                multiline
                minRows={6}
                fullWidth
                error={!!errors.contenido}
                helperText={errors.contenido?.message}
                sx={{
                  mb: 4,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#f9f9f9",
                  },
                  "& .MuiFormHelperText-root": { ml: 0 },
                }}
                disabled={isLoading}
              />
            )}
          />

          <Box sx={{ textAlign: "center" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                py: 1.5,
                width: 220,
                fontFamily: "Tektur, sans-serif",
                fontWeight: 600,
                fontSize: "1.1rem",
                borderRadius: 3,
                textTransform: "none",
                letterSpacing: 2,
                backgroundColor: "#4c77afff",
                "&:hover": { backgroundColor: "#0a386fff" },
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
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <Button
            onClick={handleIrAlTablon}
            variant="contained"
            sx={{
              mt: 10,
              py: 1.5,
              width: 420,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 600,
              fontSize: "1.1rem",
              borderRadius: 3,
              textTransform: "none",
              letterSpacing: 2,
              backgroundColor: "#4c77afff",
              "&:hover": { backgroundColor: "#0a386fff" },
            }}
          >
            Ir al Tablón
          </Button>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};

export default PublicarNovedad;
