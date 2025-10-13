import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Container,
  TextField,
  Modal,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

const EditarUsuario: React.FC = () => {
  const [dni, setDni] = useState("");
  const [usuario, setUsuario] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editando, setEditando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  // Convierte ISO a DDMMAAAA
  const isoToDDMMAAAA = (iso: string) => {
    if (!iso) return "";
    const date = new Date(iso);
    if (isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}${month}${year}`;
  };

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/usuario/usuario-dni/${dni}`
      );
      if (!response.ok) throw new Error("Usuario no encontrado");
      const user = await response.json();
      // Convertir fechas ISO a DDMMAAAA
      user.Fecha_Nacimiento = isoToDDMMAAAA(user.Fecha_Nacimiento);
      user.Fecha_Desde = isoToDDMMAAAA(user.Fecha_Desde);
      setUsuario(user);
      setOpen(true);
    } catch (err: any) {
      setError(err.message || "Error al buscar usuario");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  // Formatea "DDMMYYYY" a "DD-MM-YYYY" para mostrar
  const formatDateToDisplay = (value: string) => {
    if (!value) return "";
    const clean = value.replace(/-/g, "");
    if (clean.length <= 2) return clean;
    if (clean.length <= 4) return `${clean.slice(0,2)}-${clean.slice(2)}`;
    if (clean.length <= 8) return `${clean.slice(0,2)}-${clean.slice(2,4)}-${clean.slice(4,8)}`;
    return clean;
  };

  // Convierte "DD-MM-YYYY" o "DDMMYYYY" a "YYYY-MM-DD"
  const formatDateToISO = (dateString: string) => {
    if (!dateString) return "";
    const clean = dateString.replace(/-/g, "");
    if (clean.length !== 8) return "";
    const day = clean.slice(0, 2);
    const month = clean.slice(2, 4);
    const year = clean.slice(4, 8);
    return `${year}-${month}-${day}`;
  };

  // Handler: solo números y máximo 8 caracteres, guarda sin guiones
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    setUsuario({ ...usuario, [e.target.name]: value });
  };

  const validarUsuario = (usuario: any) => {
    if (!usuario.Apellido_Nombre || usuario.Apellido_Nombre.trim() === "") {
      setError("El nombre y apellido es obligatorio");
      return false;
    }
    if (!usuario.Tipo_Documento || usuario.Tipo_Documento.trim() === "") {
      setError("El tipo de documento es obligatorio");
      return false;
    }
    if (
      !usuario.Numero_Documento ||
      usuario.Numero_Documento.trim() === "" ||
      !/^\d+$/.test(usuario.Numero_Documento)
    ) {
      setError("El número de documento es obligatorio y debe ser numérico");
      return false;
    }
    if (!usuario.Fecha_Nacimiento || usuario.Fecha_Nacimiento.trim() === "") {
      setError("La fecha de nacimiento es obligatoria");
      return false;
    }
    if (
      !usuario.Correo_Electronico ||
      usuario.Correo_Electronico.trim() === "" ||
      !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(usuario.Correo_Electronico)
    ) {
      setError("El email es obligatorio y debe tener formato válido");
      return false;
    }
    if (!usuario.Telefono || usuario.Telefono.trim() === "") {
      setError("El teléfono es obligatorio");
      return false;
    }
    if (!usuario.Area || usuario.Area.trim() === "") {
      setError("El área es obligatoria");
      return false;
    }
    if (!usuario.Cargo || usuario.Cargo.trim() === "") {
      setError("El cargo es obligatorio");
      return false;
    }
    if (!usuario.Legajo || usuario.Legajo.trim() === "") {
      setError("El legajo es obligatorio");
      return false;
    }
    if (!usuario.Domicilio || usuario.Domicilio.trim() === "") {
      setError("El domicilio es obligatorio");
      return false;
    }
    if (!usuario.Estado_Civil || usuario.Estado_Civil.trim() === "") {
      setError("El estado civil es obligatorio");
      return false;
    }
    if (!usuario.Fecha_Desde || usuario.Fecha_Desde.trim() === "") {
      setError("La fecha de contrato es obligatoria");
      return false;
    }
    return true;
  };

  const handleEditar = async () => {
    setEditando(true);
    setError(null);
    setMensaje(null);

    // Validación antes de enviar
    if (!validarUsuario(usuario)) {
      setEditando(false);
      return;
    }

    // Mapea el campo antes de enviar
    const usuarioParaEditar = {
      ...usuario,
      Fecha_Desde: formatDateToISO(usuario.Fecha_Desde),
      Fecha_Nacimiento: formatDateToISO(usuario.Fecha_Nacimiento),
    };

    try {
      const response = await fetch(
        `http://localhost:4000/api/usuario/editar-usuario-dni/${usuario.Numero_Documento}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(usuarioParaEditar),
        }
      );
      if (!response.ok) throw new Error("No se pudo editar el usuario");
      setMensaje("Usuario editado correctamente");
      setOpen(false);
    } catch (err: any) {
      setError(err.message || "Error al editar usuario");
    } finally {
      setEditando(false);
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

      {/* Botón Volver */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, px: 4 }}>
        <Button
          component={RouterLink}
          to="/superadmin"
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

      {/* Contenido principal */}
      <Container
        maxWidth="sm"
        sx={{
          mt: 8,
          mb: 8,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography
          component="h1"
          variant="h4"
          sx={{
            mb: 12,
            fontFamily: "Tektur, sans-serif",
            fontWeight: 700,
            color: "#333",
            textAlign: "center",
            letterSpacing: 1,
            whiteSpace: "nowrap",
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          Editar datos del Usuario
        </Typography>
        <Box
          component="form"
          onSubmit={handleBuscar}
          sx={{
            backgroundColor: "white",
            borderRadius: 2,
            p: 4,
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 4,
            width: "100%",
          }}
        >
          <Typography
            component="h2"
            variant="h5"
            sx={{
              mb: 4,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 600,
              color: "#333",
              textAlign: "center",
              letterSpacing: 0.5,
            }}
          >
            Buscar por DNI
          </Typography>
          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 3 }}>
              {error}
            </Alert>
          )}
          {mensaje && (
            <Alert severity="success" sx={{ width: "100%", mb: 3 }}>
              {mensaje}
            </Alert>
          )}
          <TextField
            fullWidth
            id="dni"
            label="DNI"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{
              py: 1.5,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 600,
              fontSize: "1.1rem",
              borderRadius: 1,
              textTransform: "none",
              width: "100%",
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Buscar"
            )}
          </Button>
        </Box>
      </Container>

      {/* Modal de edición */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Editar Usuario
          </Typography>
          <TextField
            label="Nombre"
            name="Apellido_Nombre"
            value={usuario?.Apellido_Nombre || ""}
            onChange={handleChange}
          />

          <TextField
            label="Tipo de Documento"
            name="Tipo_Documento"
            value={usuario?.Tipo_Documento || ""}
            onChange={handleChange}
          />

          <TextField
            label="Numero de Documento"
            name="Numero_Documento"
            value={usuario?.Numero_Documento || ""}
            onChange={handleChange}
          />

          <TextField
            label="Fecha de Nacimiento"
            name="Fecha_Nacimiento"
            value={formatDateToDisplay(usuario?.Fecha_Nacimiento || "")}
            onChange={handleDateChange}
            inputProps={{ maxLength: 10 }}
          />

          <TextField
            label="Teléfono"
            name="Telefono"
            value={usuario?.Telefono || ""}
            onChange={handleChange}
          />

          <TextField
            label="Área"
            name="Area"
            value={usuario?.Area || ""}
            onChange={handleChange}
          />

          <TextField
            label="Cargo"
            name="Cargo"
            value={usuario?.Cargo || ""}
            onChange={handleChange}
          />

          <TextField
            label="Legajo"
            name="Legajo"
            value={usuario?.Legajo || ""}
            onChange={handleChange}
          />

          <TextField
            label="Email"
            name="Correo_Electronico"
            value={usuario?.Correo_Electronico || ""}
            onChange={handleChange}
          />

          <TextField
            label="Domicilio"
            name="Domicilio"
            value={usuario?.Domicilio || ""}
            onChange={handleChange}
          />

          <TextField
            label="Estado Civil"
            name="Estado_Civil"
            value={usuario?.Estado_Civil || ""}
            onChange={handleChange}
          />

          <TextField
            label="Fecha de Contrato"
            name="Fecha_Desde"
            value={formatDateToDisplay(usuario?.Fecha_Desde || "")}
            onChange={handleDateChange}
            inputProps={{ maxLength: 10 }}
          />

          <Button
            variant="contained"
            onClick={handleEditar}
            disabled={editando}
          >
            {editando ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </Box>
      </Modal>

      <Footer />
    </Box>
  );
};

export default EditarUsuario;
