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
import Header from "../../components/Header";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import AttachFileIcon from "@mui/icons-material/AttachFile";

const novedadSchema = z.object({
  contenido: z.string().min(1, "El contenido es obligatorio"),
  imagen: z.any().optional(),
  archivo: z.any().optional(),
});

type NovedadFormData = z.infer<typeof novedadSchema>;

const PublicarNovedad: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [mensajeExito, setMensajeExito] = React.useState<string>("");
  const [imagenNombre, setImagenNombre] = React.useState<string>("");
  const [archivoNombre, setArchivoNombre] = React.useState<string>("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<NovedadFormData>({
    resolver: zodResolver(novedadSchema),
    defaultValues: { contenido: "", imagen: undefined, archivo: undefined },
  });

  const onSubmit = async (data: NovedadFormData) => {
    try {
      setIsLoading(true);
      setError("");
      setMensajeExito("");

      const idEmpleado = 1;
      const formData = new FormData();
      formData.append("idEmpleado", idEmpleado.toString());
      formData.append("descripcion", data.contenido);

      if (data.imagen && data.imagen[0]) {
        formData.append("imagen", data.imagen[0]);
      }
      if (data.archivo && data.archivo[0]) {
        formData.append("archivo", data.archivo[0]);
      }

      const response = await fetch("http://localhost:4000/api/novedad/tablon", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Error al publicar la novedad");

      setMensajeExito("Novedad publicada exitosamente");
      reset();
      setImagenNombre("");
      setArchivoNombre("");
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
        backgroundImage: "url('/fondo.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      <Header />

      {/* Botón Volver */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, px: 4 }}>
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
          encType="multipart/form-data"
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

        
          <Box sx={{ display: "flex", gap: 2, mb: 4, justifyContent: "center" }}>
            {/* Botón para adjuntar imagen */}
            <Controller
              name="imagen"
              control={control}
              render={({ field }) => (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCameraIcon />}
                  sx={{
                    borderRadius: 2,
                    fontFamily: "Tektur, sans-serif",
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: "none",
                    backgroundColor: "#e3f2fd",
                    color: "#1976d2",
                    minWidth: 180,
                    "&:hover": { backgroundColor: "#bbdefb" },
                  }}
                  disabled={isLoading}
                >
                  {imagenNombre ? imagenNombre : "Imagen"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      field.onChange(e.target.files);
                      setImagenNombre(e.target.files?.[0]?.name || "");
                    }}
                  />
                </Button>
              )}
            />

            {/* Botón para adjuntar archivo */}
            <Controller
              name="archivo"
              control={control}
              render={({ field }) => (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachFileIcon />}
                  sx={{
                    borderRadius: 2,
                    fontFamily: "Tektur, sans-serif",
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: "none",
                    backgroundColor: "#e3f2fd",
                    color: "#1976d2",
                    minWidth: 180,
                    "&:hover": { backgroundColor: "#bbdefb" },
                  }}
                  disabled={isLoading}
                >
                  {archivoNombre ? archivoNombre : "Archivo"}
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      field.onChange(e.target.files);
                      setArchivoNombre(e.target.files?.[0]?.name || "");
                    }}
                  />
                </Button>
              )}
            />
          </Box>

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
