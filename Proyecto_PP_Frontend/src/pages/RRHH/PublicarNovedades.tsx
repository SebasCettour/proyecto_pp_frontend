import React, { useRef, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import BackButton from "../../components/BackButton";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import { Settings, Visibility, VisibilityOff } from "@mui/icons-material";
import { sanitizeNovedadHtml, stripHtml } from "../../utils/sanitizeNovedadHtml";

const novedadSchema = z.object({
  contenido: z
    .string()
    .refine((value) => stripHtml(value).length > 0, "El contenido es obligatorio"),
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
  const [imagenPreview, setImagenPreview] = useState<string>("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setMensajeExito("");
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
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
      formData.append("descripcion", sanitizeNovedadHtml(data.contenido));

      // Validación de imagen (tipo y tamaño)
      if (data.imagen && data.imagen[0]) {
        const file = data.imagen[0];
        if (!file.type.startsWith("image/")) {
          setError("El archivo seleccionado no es una imagen válida.");
          setIsLoading(false);
          return;
        }
        if (file.size > 3 * 1024 * 1024) {
          setError("La imagen no puede superar los 3MB.");
          setIsLoading(false);
          return;
        }
        formData.append("imagen", file);
      }
      // Validación de archivo (máx 5MB)
      if (data.archivo && data.archivo[0]) {
        const file = data.archivo[0];
        if (file.size > 5 * 1024 * 1024) {
          setError("El archivo no puede superar los 5MB.");
          setIsLoading(false);
          return;
        }
        formData.append("archivo", file);
      }

      const response = await fetch("http://localhost:4000/api/novedad/tablon", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Error al publicar la novedad");

      setMensajeExito("Novedad publicada exitosamente");
      setSnackbarOpen(true);
      reset();
      setImagenNombre("");
      setArchivoNombre("");
      setImagenPreview("");
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
      setValue("contenido", "", { shouldValidate: false });
    } catch (err) {
      setError("Ocurrió un error al publicar la novedad.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateEditorValue = () => {
    const html = editorRef.current?.innerHTML || "";
    setValue("contenido", html, { shouldValidate: true });
  };

  const applyFormat = (
    command:
      | "bold"
      | "italic"
      | "underline"
      | "insertUnorderedList"
      | "insertOrderedList"
  ) => {
    editorRef.current?.focus();
    document.execCommand(command, false);
    updateEditorValue();
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
      <Box sx={{ position: "absolute", top: 35, right: 32, display: "flex", alignItems: "center", zIndex: 10 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", mr: 1 }}>
          <Typography sx={{ fontWeight: 400, letterSpacing: 2, fontFamily: "Tektur, sans-serif", fontSize: 16, color: "#333", lineHeight: 1.1 }}>Bienvenido/a</Typography>
          <Typography sx={{ fontWeight: 600, letterSpacing: 2, fontFamily: "Tektur, sans-serif", fontSize: 18, color: "#1976d2", lineHeight: 1.1 }}>{userName}</Typography>
        </Box>
        <IconButton onClick={handleMenuOpen}><Settings sx={{ fontSize: 40 }} /></IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleOpenPasswordModal}>Cambiar Contraseña</MenuItem>
          <MenuItem onClick={handleCerrarSesion}>Cerrar Sesión</MenuItem>
        </Menu>
      </Box>
      {/* Botón Ir al Tablón debajo del título */}
      <BackButton to="/rrhh-principal" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          maxWidth: "920px",
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 1, sm: 2 },
          pb: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 2, fontFamily: "Tektur, sans-serif", fontWeight: 700, color: "#333", letterSpacing: 1 }}>
          Publicar Novedad
        </Typography>
        {error && (<Alert severity="error" sx={{ width: "100%", mb: 2, borderRadius: 2, fontWeight: 500 }}>{error}</Alert>)}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            width: "100%",
            maxWidth: "780px",
            bgcolor: "rgba(255,255,255,0.9)",
            border: "1px solid #dfe5ee",
            borderRadius: 3,
            px: { xs: 2, sm: 3 },
            py: 2,
          }}
          encType="multipart/form-data"
        >
          <Controller
            name="contenido"
            control={control}
            render={() => (
              <Box sx={{ mb: 2.5 }}>
                <Typography
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    fontFamily: "Tektur, sans-serif",
                    color: "#1a1a1a",
                  }}
                >
                  Contenido
                </Typography>

                <ToggleButtonGroup
                  value={[]}
                  size="small"
                  sx={{ mb: 1, background: "#f5f7fa", borderRadius: 2 }}
                >
                  <ToggleButton value="bold" onClick={() => applyFormat("bold")}>
                    <FormatBoldIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="italic" onClick={() => applyFormat("italic")}>
                    <FormatItalicIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="underline" onClick={() => applyFormat("underline")}>
                    <FormatUnderlinedIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton
                    value="ul"
                    onClick={() => applyFormat("insertUnorderedList")}
                  >
                    <FormatListBulletedIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton
                    value="ol"
                    onClick={() => applyFormat("insertOrderedList")}
                  >
                    <FormatListNumberedIcon fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>

                <Box
                  ref={editorRef}
                  contentEditable={!isLoading}
                  suppressContentEditableWarning
                  onInput={updateEditorValue}
                  onBlur={updateEditorValue}
                  onPaste={(event) => {
                    // En pegado forzamos texto plano para evitar HTML externo inseguro.
                    event.preventDefault();
                    const text = event.clipboardData.getData("text/plain");
                    document.execCommand("insertText", false, text);
                    updateEditorValue();
                  }}
                  sx={{
                    minHeight: 140,
                    p: 2,
                    border: errors.contenido ? "1px solid #d32f2f" : "1px solid #c4c4c4",
                    borderRadius: 2,
                    backgroundColor: "#f9f9f9",
                    fontFamily: "Segoe UI, Arial, sans-serif",
                    fontSize: 16,
                    lineHeight: 1.6,
                    outline: "none",
                    "&:focus": {
                      borderColor: "#1976d2",
                      boxShadow: "0 0 0 2px rgba(25,118,210,0.15)",
                    },
                    '&[contenteditable="true"]:empty:before': {
                      content: '"Escribe la novedad aqui..."',
                      color: "#8a8a8a",
                    },
                  }}
                />

                {errors.contenido?.message && (
                  <Typography sx={{ color: "#d32f2f", mt: 0.8, fontSize: 12 }}>
                    {errors.contenido.message}
                  </Typography>
                )}
              </Box>
            )}
          />
          <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
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
                    maxWidth: 320,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    '&:hover': { backgroundColor: "#bbdefb" }
                  }}
                  aria-label="Adjuntar imagen"
                  disabled={isLoading}
                >
                  <Box sx={{ maxWidth: 180, overflowX: 'auto', whiteSpace: 'nowrap', textOverflow: 'ellipsis', flex: 1, textAlign: 'left' }}>
                    {imagenNombre ? imagenNombre : "Imagen"}
                  </Box>
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
                    maxWidth: 220,
                    '&:hover': { backgroundColor: "#bbdefb" }
                  }}
                  aria-label="Adjuntar archivo"
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
          <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                py: 1.5,
                width: { xs: "100%", sm: 420 },
                fontFamily: "Tektur, sans-serif",
                fontWeight: 600,
                fontSize: "1.1rem",
                borderRadius: 3,
                textTransform: "none",
                letterSpacing: 2,
                backgroundColor: "#1976d2",
                '&:hover': { backgroundColor: "#0a386f" }
              }}
              startIcon={isLoading ? <CircularProgress size={22} color="inherit" /> : null}
            >
              {isLoading ? "Publicando..." : "Publicar Novedad"}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5, mb: 0.5 }}>
            <Button
              type="button"
              onClick={() => {
                window.location.href = "/tablon";
              }}
              variant="contained"
              sx={{
                py: 1,
                px: 3,
                fontFamily: "Tektur, sans-serif",
                fontWeight: 600,
                fontSize: "1rem",
                borderRadius: 3,
                textTransform: "none",
                letterSpacing: 2,
                backgroundColor: "#4c77af",
                color: "#fff",
                boxShadow: 'none',
                minWidth: 120,
                height: 40,
                '&:hover': { backgroundColor: "#0a386f" }
              }}
            >
              Ir al Tablón
            </Button>
          </Box>
        </Box>
        <Modal open={modalPasswordOpen} onClose={handleClosePasswordModal}>
          <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", bgcolor: "background.paper", boxShadow: 24, borderRadius: 3, p: 4, minWidth: 350, maxWidth: "90vw", display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Cambiar Contraseña</Typography>
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
              <Typography color={msg.includes("correctamente") ? "success.main" : "error.main"} sx={{ mt: 1 }}>{msg}</Typography>
            )}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
              <Button onClick={handleClosePasswordModal} disabled={loadingPassword}>Cancelar</Button>
              <Button variant="contained" onClick={handleChangePassword} disabled={loadingPassword || !oldPassword || !newPassword}>Cambiar</Button>
            </Box>
          </Box>
        </Modal>
      </Box>

      <Footer />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }}>
          {mensajeExito || "Novedad publicada exitosamente"}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default PublicarNovedad;
