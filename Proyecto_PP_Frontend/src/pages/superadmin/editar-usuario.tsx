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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

const EditarUsuario: React.FC = () => {
  const [dni, setDni] = useState("");
  const [usuario, setUsuario] = useState<any>(null);
  const [familiares, setFamiliares] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [openFamiliarModal, setOpenFamiliarModal] = useState(false);
  const [familiarSeleccionado, setFamiliarSeleccionado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editando, setEditando] = useState(false);
  const [editandoFamiliar, setEditandoFamiliar] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [modoFamiliar, setModoFamiliar] = useState<"crear" | "editar">("crear");

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
      // Buscar usuario
      const response = await fetch(
        `http://localhost:4000/api/usuario/usuario-dni/${dni}`
      );
      if (!response.ok) throw new Error("Usuario no encontrado");
      const apiUser = await response.json();

      // Buscar familiares
      console.log("🔍 Buscando familiares para DNI:", dni);
      const familiariesResponse = await fetch(
        `http://localhost:4000/api/familiares/empleado-dni/${dni}`
      );
      console.log(
        "📡 Respuesta de familiares:",
        familiariesResponse.status,
        familiariesResponse.statusText
      );

      let familiaresData = [];
      if (familiariesResponse.ok) {
        familiaresData = await familiariesResponse.json();
        console.log("✅ Familiares encontrados:", familiaresData);
      } else {
        console.log(
          "❌ Error al obtener familiares:",
          await familiariesResponse.text()
        );
      }

      // Mapear campos del API a los nombres que usa el formulario (soporte para distintos esquemas)
      const mappedUser: any = {
        Apellido_Nombre:
          apiUser.Apellido_Nombre ||
          apiUser.apellido_nombre ||
          `${apiUser.Nombre || ""} ${apiUser.Apellido || ""}`.trim(),
        Tipo_Documento:
          apiUser.Tipo_Documento ||
          apiUser.tipo_documento ||
          apiUser.tipoDocumento ||
          apiUser.tipo ||
          "",
        Numero_Documento:
          apiUser.Numero_Documento ||
          apiUser.numero_documento ||
          apiUser.numeroDocumento ||
          apiUser.documento ||
          apiUser.DNI ||
          "",
        Fecha_Nacimiento:
          apiUser.Fecha_Nacimiento ||
          apiUser.fechaNacimiento ||
          apiUser.fecha_nacimiento ||
          apiUser.nacimiento ||
          "",
        Fecha_Desde:
          apiUser.Fecha_Desde ||
          apiUser.fechaDesde ||
          apiUser.fecha_desde ||
          apiUser.fecha_contrato ||
          "",
        Telefono: apiUser.Telefono || apiUser.telefono || apiUser.celular || "",
        Area: apiUser.Area || apiUser.area || "",
        Cargo: apiUser.Cargo || apiUser.cargo || "",
        Legajo: apiUser.Legajo || apiUser.legajo || "",
        Correo_Electronico:
          apiUser.Correo_Electronico || apiUser.email || apiUser.Correo || "",
        Domicilio: apiUser.Domicilio || apiUser.domicilio || "",
        Estado_Civil:
          apiUser.Estado_Civil ||
          apiUser.estadoCivil ||
          apiUser.estado_civil ||
          "",
        // conservar el resto por si hay campos adicionales
        ...apiUser,
      };

      console.log("📊 Datos del usuario recibidos:", apiUser);
      console.log("📊 Datos del usuario mapeados:", mappedUser);
      console.log("📊 Datos de familiares recibidos:", familiaresData);

      // Convertir fechas ISO (YYYY-MM-DD o YYYY/MM/DD) a DDMMYYYY para el formulario
      if (mappedUser.Fecha_Nacimiento) {
        mappedUser.Fecha_Nacimiento = isoToDDMMAAAA(
          mappedUser.Fecha_Nacimiento
        );
      }
      if (mappedUser.Fecha_Desde) {
        mappedUser.Fecha_Desde = isoToDDMMAAAA(mappedUser.Fecha_Desde);
      }

      // Procesar familiares
      const familiaresConFechasFormateadas = familiaresData.map(
        (familiar: any) => ({
          ...familiar,
          fechaNacimientoFamiliar: familiar.fechaNacimientoFamiliar
            ? isoToDDMMAAAA(familiar.fechaNacimientoFamiliar)
            : "",
        })
      );

      setUsuario(mappedUser);
      setFamiliares(familiaresConFechasFormateadas);
      setOpen(true);
    } catch (err: any) {
      setError(err.message || "Error al buscar usuario");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // si la propiedad no existe aún en usuario, la añadimos
    setUsuario((prev: any) => ({ ...(prev || {}), [name]: value }));
  };

  // Formatea "DDMMYYYY" a "DD-MM-YYYY" para mostrar
  const formatDateToDisplay = (value: string) => {
    if (!value) return "";
    const clean = value.replace(/-/g, "");
    if (clean.length <= 2) return clean;
    if (clean.length <= 4) return `${clean.slice(0, 2)}-${clean.slice(2)}`;
    if (clean.length <= 8)
      return `${clean.slice(0, 2)}-${clean.slice(2, 4)}-${clean.slice(4, 8)}`;
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

  // Funciones para manejar familiares
  const abrirModalFamiliar = (familiar?: any) => {
    if (familiar) {
      setModoFamiliar("editar");
      setFamiliarSeleccionado(familiar);
    } else {
      setModoFamiliar("crear");
      setFamiliarSeleccionado({
        nombreFamiliar: "",
        parentesco: "",
        fechaNacimientoFamiliar: "",
        tipoDocumentoFamiliar: "",
        numeroDocumentoFamiliar: "",
      });
    }
    setOpenFamiliarModal(true);
  };

  const cerrarModalFamiliar = () => {
    setOpenFamiliarModal(false);
    setFamiliarSeleccionado(null);
    setError(null);
  };

  const handleChangeFamiliar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFamiliarSeleccionado((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleDateChangeFamiliar = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    setFamiliarSeleccionado({
      ...familiarSeleccionado,
      [e.target.name]: value,
    });
  };

  const validarFamiliar = (familiar: any) => {
    if (!familiar.nombreFamiliar || familiar.nombreFamiliar.trim() === "") {
      setError("El nombre del familiar es obligatorio");
      return false;
    }
    if (!familiar.parentesco || familiar.parentesco.trim() === "") {
      setError("El parentesco es obligatorio");
      return false;
    }
    if (
      !familiar.fechaNacimientoFamiliar ||
      familiar.fechaNacimientoFamiliar.trim() === ""
    ) {
      setError("La fecha de nacimiento del familiar es obligatoria");
      return false;
    }
    if (
      !familiar.tipoDocumentoFamiliar ||
      familiar.tipoDocumentoFamiliar.trim() === ""
    ) {
      setError("El tipo de documento del familiar es obligatorio");
      return false;
    }
    if (
      !familiar.numeroDocumentoFamiliar ||
      familiar.numeroDocumentoFamiliar.trim() === "" ||
      !/^\d+$/.test(familiar.numeroDocumentoFamiliar)
    ) {
      setError(
        "El número de documento del familiar es obligatorio y debe ser numérico"
      );
      return false;
    }
    return true;
  };

  const guardarFamiliar = async () => {
    setEditandoFamiliar(true);
    setError(null);

    if (!validarFamiliar(familiarSeleccionado)) {
      setEditandoFamiliar(false);
      return;
    }

    const familiarParaGuardar = {
      ...familiarSeleccionado,
      fechaNacimientoFamiliar: formatDateToISO(
        familiarSeleccionado.fechaNacimientoFamiliar
      ),
    };

    try {
      if (modoFamiliar === "crear") {
        // Necesitamos obtener el ID del empleado
        const empleadoResponse = await fetch(
          `http://localhost:4000/api/usuario/usuario-dni/${dni}`
        );
        const empleado = await empleadoResponse.json();

        const response = await fetch(
          `http://localhost:4000/api/familiares/crear`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idEmpleado: empleado.Id_Empleado,
              ...familiarParaGuardar,
            }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "No se pudo crear el familiar");
        }
        setMensaje("Familiar creado correctamente");
      } else {
        const response = await fetch(
          `http://localhost:4000/api/familiares/${familiarSeleccionado.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(familiarParaGuardar),
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "No se pudo actualizar el familiar"
          );
        }
        setMensaje("Familiar actualizado correctamente");
      }

      // Recargar familiares
      const familiariesResponse = await fetch(
        `http://localhost:4000/api/familiares/empleado-dni/${dni}`
      );
      if (familiariesResponse.ok) {
        const familiaresData = await familiariesResponse.json();
        const familiaresConFechasFormateadas = familiaresData.map(
          (familiar: any) => ({
            ...familiar,
            fechaNacimientoFamiliar: familiar.fechaNacimientoFamiliar
              ? isoToDDMMAAAA(familiar.fechaNacimientoFamiliar)
              : "",
          })
        );
        setFamiliares(familiaresConFechasFormateadas);
      }

      cerrarModalFamiliar();
    } catch (err: any) {
      setError(err.message || "Error al guardar familiar");
    } finally {
      setEditandoFamiliar(false);
    }
  };

  const eliminarFamiliar = async (familiarId: number) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este familiar?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:4000/api/familiares/${familiarId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("No se pudo eliminar el familiar");

      // Recargar familiares
      const familiariesResponse = await fetch(
        `http://localhost:4000/api/familiares/empleado-dni/${dni}`
      );
      if (familiariesResponse.ok) {
        const familiaresData = await familiariesResponse.json();
        const familiaresConFechasFormateadas = familiaresData.map(
          (familiar: any) => ({
            ...familiar,
            fechaNacimientoFamiliar: familiar.fechaNacimientoFamiliar
              ? isoToDDMMAAAA(familiar.fechaNacimientoFamiliar)
              : "",
          })
        );
        setFamiliares(familiaresConFechasFormateadas);
      }

      setMensaje("Familiar eliminado correctamente");
    } catch (err: any) {
      setError(err.message || "Error al eliminar familiar");
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
            width: "90%",
            maxWidth: 800,
            maxHeight: "90vh",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, textAlign: "center" }}>
            Editar Usuario
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {mensaje && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {mensaje}
            </Alert>
          )}

          {/* Datos del Usuario */}
          <Accordion defaultExpanded sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Datos del Usuario</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    name="Apellido_Nombre"
                    value={usuario?.Apellido_Nombre || ""}
                    onChange={handleChange}
                    sx={{ minWidth: 200, flex: 1 }}
                  />

                  <TextField
                    fullWidth
                    label="Tipo de Documento"
                    name="Tipo_Documento"
                    value={usuario?.Tipo_Documento || ""}
                    onChange={handleChange}
                    sx={{ minWidth: 200, flex: 1 }}
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <TextField
                    fullWidth
                    label="Numero de Documento"
                    name="Numero_Documento"
                    value={usuario?.Numero_Documento || ""}
                    onChange={handleChange}
                    sx={{ minWidth: 200, flex: 1 }}
                  />

                  <TextField
                    fullWidth
                    label="Fecha de Nacimiento"
                    name="Fecha_Nacimiento"
                    value={formatDateToDisplay(usuario?.Fecha_Nacimiento || "")}
                    onChange={handleDateChange}
                    inputProps={{ maxLength: 10 }}
                    sx={{ minWidth: 200, flex: 1 }}
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="Telefono"
                    value={usuario?.Telefono || ""}
                    onChange={handleChange}
                    sx={{ minWidth: 200, flex: 1 }}
                  />

                  <TextField
                    fullWidth
                    label="Área"
                    name="Area"
                    value={usuario?.Area || ""}
                    onChange={handleChange}
                    sx={{ minWidth: 200, flex: 1 }}
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <TextField
                    fullWidth
                    label="Cargo"
                    name="Cargo"
                    value={usuario?.Cargo || ""}
                    onChange={handleChange}
                    sx={{ minWidth: 200, flex: 1 }}
                  />

                  <TextField
                    fullWidth
                    label="Legajo"
                    name="Legajo"
                    value={usuario?.Legajo || ""}
                    onChange={handleChange}
                    sx={{ minWidth: 200, flex: 1 }}
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="Correo_Electronico"
                    value={usuario?.Correo_Electronico || ""}
                    onChange={handleChange}
                    sx={{ minWidth: 200, flex: 1 }}
                  />

                  <TextField
                    fullWidth
                    label="Domicilio"
                    name="Domicilio"
                    value={usuario?.Domicilio || ""}
                    onChange={handleChange}
                    sx={{ minWidth: 200, flex: 1 }}
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <TextField
                    fullWidth
                    label="Estado Civil"
                    name="Estado_Civil"
                    value={usuario?.Estado_Civil || ""}
                    onChange={handleChange}
                    sx={{ minWidth: 200, flex: 1 }}
                  />

                  <TextField
                    fullWidth
                    label="Fecha de Contrato"
                    name="Fecha_Desde"
                    value={formatDateToDisplay(usuario?.Fecha_Desde || "")}
                    onChange={handleDateChange}
                    inputProps={{ maxLength: 10 }}
                    sx={{ minWidth: 200, flex: 1 }}
                  />
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Familiares */}
          <Accordion sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PersonIcon />
                <Typography variant="h6">
                  Familiares ({familiares.length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => abrirModalFamiliar()}
                  sx={{ mb: 2 }}
                >
                  Agregar Familiar
                </Button>
              </Box>

              {familiares.length === 0 ? (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 2 }}
                >
                  No hay familiares registrados
                </Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {familiares.map((familiar) => (
                    <Box
                      key={familiar.id}
                      sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}
                    >
                      <Card variant="outlined" sx={{ flex: 1, minWidth: 300 }}>
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              mb: 1,
                            }}
                          >
                            <Typography variant="h6" component="div">
                              {familiar.nombreFamiliar}
                            </Typography>
                            <Box>
                              <IconButton
                                size="small"
                                onClick={() => abrirModalFamiliar(familiar)}
                                color="primary"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => eliminarFamiliar(familiar.id)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                          <Chip
                            label={familiar.parentesco}
                            size="small"
                            color="primary"
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            <strong>DNI:</strong>{" "}
                            {familiar.numeroDocumentoFamiliar}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Nacimiento:</strong>{" "}
                            {formatDateToDisplay(
                              familiar.fechaNacimientoFamiliar
                            )}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Tipo Doc:</strong>{" "}
                            {familiar.tipoDocumentoFamiliar}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>

          <Button
            variant="contained"
            onClick={handleEditar}
            disabled={editando}
            sx={{ mt: 2 }}
          >
            {editando ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Guardar Cambios del Usuario"
            )}
          </Button>
        </Box>
      </Modal>

      {/* Modal para Familiares */}
      <Dialog
        open={openFamiliarModal}
        onClose={cerrarModalFamiliar}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {modoFamiliar === "crear" ? "Agregar Familiar" : "Editar Familiar"}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Nombre del Familiar"
              name="nombreFamiliar"
              value={familiarSeleccionado?.nombreFamiliar || ""}
              onChange={handleChangeFamiliar}
            />

            <TextField
              fullWidth
              label="Parentesco"
              name="parentesco"
              value={familiarSeleccionado?.parentesco || ""}
              onChange={handleChangeFamiliar}
              placeholder="ej: Hijo/a, Cónyuge, Padre/Madre"
            />

            <TextField
              fullWidth
              label="Fecha de Nacimiento"
              name="fechaNacimientoFamiliar"
              value={formatDateToDisplay(
                familiarSeleccionado?.fechaNacimientoFamiliar || ""
              )}
              onChange={handleDateChangeFamiliar}
              inputProps={{ maxLength: 10 }}
              placeholder="DDMMAAAA"
            />

            <TextField
              fullWidth
              label="Tipo de Documento"
              name="tipoDocumentoFamiliar"
              value={familiarSeleccionado?.tipoDocumentoFamiliar || ""}
              onChange={handleChangeFamiliar}
              placeholder="ej: DNI, Pasaporte, etc."
            />

            <TextField
              fullWidth
              label="Número de Documento"
              name="numeroDocumentoFamiliar"
              value={familiarSeleccionado?.numeroDocumentoFamiliar || ""}
              onChange={handleChangeFamiliar}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModalFamiliar}>Cancelar</Button>
          <Button
            onClick={guardarFamiliar}
            variant="contained"
            disabled={editandoFamiliar}
          >
            {editandoFamiliar ? (
              <CircularProgress size={24} color="inherit" />
            ) : modoFamiliar === "crear" ? (
              "Agregar"
            ) : (
              "Actualizar"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
};

export default EditarUsuario;
