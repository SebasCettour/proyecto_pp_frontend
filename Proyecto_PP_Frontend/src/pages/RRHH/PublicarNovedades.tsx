import React, { useState } from "react";
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
  Menu,
  MenuItem,
  Modal,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import BackButton from "../../components/BackButton";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { Settings, Visibility, VisibilityOff } from "@mui/icons-material";

const novedadSchema = z.object({
  contenido: z.string().min(1, "El contenido es obligatorio"),
  imagen: z.any().optional(),
  archivo: z.any().optional(),
});

type NovedadFormData = z.infer<typeof novedadSchema>;

const PublicarNovedad: React.FC = () => {
  // Menú y cambio de contraseña
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const userRole = localStorage.getItem("role") || "";
  const userName =
    localStorage.getItem("nombre") ||
    localStorage.getItem("username") ||
    "Usuario";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [mensajeExito, setMensajeExito] = useState<string>("");
  const [imagenNombre, setImagenNombre] = useState<string>("");
  const [archivoNombre, setArchivoNombre] = useState<string>("");

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

      // Obtener el idEmpleado del localStorage
      const idEmpleado = localStorage.getItem("idEmpleado");
      if (!idEmpleado) {
        setError("No se encontró el ID del empleado. Vuelva a iniciar sesión.");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("idEmpleado", idEmpleado);
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

  // Menú usuario
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleOpenPasswordModal = () => {
    setModalPasswordOpen(true);
    setAnchorEl(null);
    setMsg(null);
    setOldPassword("");
    setNewPassword("");
  };
  const handleClosePasswordModal = () => setModalPasswordOpen(false);

  const handleCerrarSesion = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const handleChangePassword = async () => {
    setLoadingPassword(true);
    setMsg(null);
    try {
      const username =
        localStorage.getItem("username") ||
        localStorage.getItem("nombre") ||
        "";
      const res = await fetch(
        "http://localhost:4000/api/usuario/auth/cambiar-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            oldPassword,
            newPassword,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMsg("Contraseña cambiada correctamente");
        setOldPassword("");
        setNewPassword("");
      } else {
        setMsg(data.error || "Error al cambiar la contraseña");
      }
    } catch (err) {
      setMsg("Error de conexión con el servidor");
    } finally {
      setLoadingPassword(false);
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
      {/* Menú Editar y Cerrar Sesión */}
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
          <MenuItem onClick={handleOpenPasswordModal}>
            Cambiar Contraseña
          </MenuItem>
          <MenuItem onClick={handleCerrarSesion}>Cerrar Sesión</MenuItem>
        </Menu>
      </Box>

      {/* Botón Volver */}
      <BackButton to="/rrhh-principal" />

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

          <Box
            sx={{ display: "flex", gap: 2, mb: 4, justifyContent: "center" }}
          >
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

      {/* Modal para cambiar contraseña */}
      <Modal open={modalPasswordOpen} onClose={handleClosePasswordModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 3,
            p: 4,
            minWidth: 350,
            maxWidth: "90vw",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Cambiar Contraseña
          </Typography>
          <TextField
            label="Contraseña Actual"
            type={showOld ? "text" : "password"}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowOld((v) => !v)} edge="end">
                    {showOld ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Nueva Contraseña"
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNew((v) => !v)} edge="end">
                    {showNew ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {msg && (
            <Typography
              color={
                msg.includes("correctamente") ? "success.main" : "error.main"
              }
              sx={{ mt: 1 }}
            >
              {msg}
            </Typography>
          )}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
          >
            <Button
              onClick={handleClosePasswordModal}
              disabled={loadingPassword}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleChangePassword}
              disabled={loadingPassword || !oldPassword || !newPassword}
            >
              Cambiar
            </Button>
          </Box>
        </Box>
      </Modal>

      <Footer />
    </Box>
  );
};

export default PublicarNovedad;
