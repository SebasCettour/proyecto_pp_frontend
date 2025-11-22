import React, { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Button,
  Typography,
  Container,
  TextField,
  Alert,
  CircularProgress,
  MenuItem,
  IconButton,
  Card,
  CardContent,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/es";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import BackButton from "../../components/BackButton";
import { Link as RouterLink } from "react-router-dom";

type ObraSocial = { id: string; nombre: string };
type Sindicato = { id: string; nombre: string };
type Convenio = { id: number; nombre: string };
type Categoria = { Id_Categoria: number; Nombre_Categoria: string };

// Fix: Assign schema to a variable
const schema = z.object({
  Nombre: z.string().min(1),
  Apellido: z.string().min(1),
  Categoria: z.string().min(1),
  Correo_Electronico: z.string().email().min(1),
  Domicilio: z.string().min(1),
  Estado_Civil: z.string().min(1),
  Fecha_Desde: z.string().min(1),
  Fecha_Nacimiento: z.string().min(1),
  Legajo: z.string().max(20),
  Telefono: z
    .string()
    .min(8)
    .max(20)
    .regex(/^[0-9+\-\s()]+$/),
  Tipo_Documento: z.string().min(1),
  Numero_Documento: z
    .string()
    .min(7)
    .max(20)
    .regex(/^[0-9]+$/),
  // Eliminados Id_Departamento y Id_Cargo
  Id_Sindicato: z.string().min(1),
  Id_ObraSocial: z.string().min(1),
  id_convenio: z.string().min(1),
  familiares: z
    .array(
      z.object({
        nombreFamiliar: z
          .string()
          .min(2)
          .max(100)
          .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
        parentesco: z.string().min(1),
        fechaNacimientoFamiliar: z
          .string()
          .min(1)
          .refine(
            (value) => dayjs(value).isValid() && dayjs(value).isBefore(dayjs())
          ),
        tipoDocumentoFamiliar: z.string().min(1),
        numeroDocumentoFamiliar: z
          .string()
          .min(7)
          .max(50)
          .regex(/^[0-9]+$/),
      })
    )
    .optional(),
});

type FormData = z.infer<typeof schema>;

const EditarUsuario = () => {
  // Estado local para el formulario de familiar
  const [nuevoFamiliar, setNuevoFamiliar] = useState({
    nombreFamiliar: "",
    parentesco: "",
    fechaNacimientoFamiliar: "",
    tipoDocumentoFamiliar: "",
    numeroDocumentoFamiliar: "",
  });
  const [errorFamiliar, setErrorFamiliar] = useState<string | null>(null);

  // Estados para Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "warning" | "info">("info");

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Handler para agregar familiar
  const handleAgregarFamiliar = () => {
    setErrorFamiliar(null);
    const { nombreFamiliar, parentesco, fechaNacimientoFamiliar, tipoDocumentoFamiliar, numeroDocumentoFamiliar } = nuevoFamiliar;
    if (
      !nombreFamiliar.trim() ||
      !parentesco ||
      !fechaNacimientoFamiliar ||
      !tipoDocumentoFamiliar ||
      !numeroDocumentoFamiliar.trim()
    ) {
      setErrorFamiliar("Complete todos los campos del familiar");
      return;
    }
    append({ ...nuevoFamiliar });
    setNuevoFamiliar({
      nombreFamiliar: "",
      parentesco: "",
      fechaNacimientoFamiliar: "",
      tipoDocumentoFamiliar: "",
      numeroDocumentoFamiliar: "",
    });
  };
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([]);
  const [sindicatos, setSindicatos] = useState<Sindicato[]>([]);
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [usuarioDni, setUsuarioDni] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      Nombre: "",
      Apellido: "",
      // Area eliminado
      Categoria: "",
      Correo_Electronico: "",
      Domicilio: "",
      Estado_Civil: "",
      Fecha_Desde: "",
      Fecha_Nacimiento: "",
      Legajo: "",
      Telefono: "",
      Tipo_Documento: "",
      Numero_Documento: "",
      // Eliminados Id_Departamento y Id_Cargo
      Id_Sindicato: "",
      Id_ObraSocial: "",
      id_convenio: "",
      familiares: [],
    },
  });

  // useFieldArray para familiares
  const { fields, append, remove } = useFieldArray({
    control,
    name: "familiares",
  });

  // convenioValue para el efecto de categorías
  const convenioValue = watch("id_convenio");

  // Cargar obras sociales
  useEffect(() => {
    fetch("http://localhost:4000/api/obras-sociales")
      .then((res) => res.json())
      .then((data) =>
        setObrasSociales(
          data.map((os: any) => ({
            id: String(os.ID_ObraSocial || os.id),
            nombre: os.Nombre || os.nombre,
          }))
        )
      )
      .catch(() => setObrasSociales([{ id: "1", nombre: "OSECAC" }]));
  }, []);

  // Cargar sindicatos
  useEffect(() => {
    fetch("http://localhost:4000/api/sindicatos")
      .then((res) => res.json())
      .then((data) =>
        setSindicatos(
          data.map((s: any) => ({
            id: String(s.ID_Sindicato || s.id),
            nombre: s.Nombre || s.nombre,
          }))
        )
      )
      .catch(() =>
        setSindicatos([{ id: "1", nombre: "Sindicato Empleados de Comercio" }])
      );
  }, []);

  useEffect(() => {
    fetch("http://localhost:4000/api/convenios")
      .then((res) => res.json())
      .then((data) =>
        setConvenios(
          data.map((c: any) => ({
            id: c.id,
            nombre: c.nombre,
          }))
        )
      );
  }, []);

  useEffect(() => {
    if (!convenioValue) {
      setCategorias([]);
      return;
    }
    setLoadingCategorias(true);
    fetch(`http://localhost:4000/api/empleado/categorias/${convenioValue}`)
      .then((res) => res.json())
      .then((data) => setCategorias(Array.isArray(data) ? data : []))
      .finally(() => setLoadingCategorias(false));
  }, [convenioValue]);

  // Buscar usuario por DNI o nombre
  const handleBuscar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSearchError(null);
    setSearchLoading(true);
    
    try {
      if (!searchTerm.trim()) {
        setSearchError("Ingrese un DNI, nombre o apellido");
        return;
      }

      const response = await fetch(
        `http://localhost:4000/api/usuario/empleado-buscar/${encodeURIComponent(searchTerm)}`
      );
      
      if (!response.ok) {
        setSearchError("Usuario no encontrado");
        return;
      }

      const result = await response.json();
      
      // Si es un array, verificar cantidad de resultados
      if (Array.isArray(result)) {
        if (result.length === 0) {
          setSearchError("No se encontraron usuarios");
          return;
        } else if (result.length > 1) {
          setSearchError(`Se encontraron ${result.length} usuarios. Por favor, sea más específico.`);
          return;
        }
        // Usar el primer (y único) resultado
        await cargarDatosUsuario(result[0].dni);
      } else {
        // Es un objeto único
        await cargarDatosUsuario(result.dni);
      }
    } catch (err: any) {
      setSearchError(err.message || "Error al buscar usuario");
    } finally {
      setSearchLoading(false);
    }
  };

  // Función separada para cargar datos del usuario
  const cargarDatosUsuario = async (dni: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/usuario/usuario-dni/${dni}`
      );
      const result = await response.json();
      console.log("Respuesta backend usuario-dni:", result);
      if (!response.ok || !result) {
        setError(result?.error || "Error al cargar datos del usuario");
        return;
      }

      // Normalizar valores para selects y evitar undefined/null
      const validTipoDocumento = ["DNI", "Pasaporte", "LC", "LE"];
      const validEstadoCivil = [
        "Soltero/a",
        "Casado/a",
        "Divorciado/a",
        "Viudo/a",
        "En unión convivencial",
      ];
      const user = result;
      const safe = (v: any) => (v === undefined || v === null ? "" : v);

      // Esperar a que los selects estén listos (opciones cargadas, menos categorias)
      const waitForOptions = () => {
        return new Promise<void>((resolve) => {
          const check = () => {
            if (
              sindicatos.length > 0 &&
              obrasSociales.length > 0 &&
              convenios.length > 0
            ) {
              resolve();
            } else {
              setTimeout(check, 50);
            }
          };
          check();
        });
      };

      await waitForOptions();

      const sindicatoNombre =
        sindicatos.find((s) => String(s.id) === String(user.Id_Sindicato))
          ?.nombre || "";
      const obraSocialNombre =
        obrasSociales.find((o) => String(o.id) === String(user.Id_ObraSocial))
          ?.nombre || "";

      // Para convenio, usar el id como valor, pero mostrar el nombre en el select
      const convenioId =
        convenios.find((c) => String(c.id) === String(user.id_convenio))?.id ||
        "";

      // Primero establecer el formulario sin categoría
      reset({
        ...user,
        Categoria: "", // Temporalmente vacío
        Id_Sindicato: sindicatoNombre,
        Id_ObraSocial: obraSocialNombre,
        id_convenio: convenioId ? String(convenioId) : "",
        Estado_Civil:
          validEstadoCivil.includes(user.Estado_Civil) && user.Estado_Civil
            ? user.Estado_Civil
            : "",
        Tipo_Documento:
          validTipoDocumento.includes(user.Tipo_Documento) &&
          user.Tipo_Documento
            ? user.Tipo_Documento
            : "",
        familiares: Array.isArray(user.familiares) ? user.familiares : [],
      });

      // Cargar categorías del convenio y luego establecer la categoría correcta
      if (convenioId) {
        try {
          const catResponse = await fetch(
            `http://localhost:4000/api/empleado/categorias/${convenioId}`
          );
          const catData = await catResponse.json();
          const categoriasDelConvenio = Array.isArray(catData) ? catData : [];
          setCategorias(categoriasDelConvenio);
          
          // Ahora buscar y establecer la categoría correcta
          const categoriaCorrecta = categoriasDelConvenio.find(
            (c: Categoria) => String(c.Id_Categoria) === String(user.Categoria)
          );
          
          if (categoriaCorrecta) {
            // Actualizar solo el campo Categoria
            reset({
              ...user,
              Categoria: String(categoriaCorrecta.Id_Categoria),
              Id_Sindicato: sindicatoNombre,
              Id_ObraSocial: obraSocialNombre,
              id_convenio: String(convenioId),
              Estado_Civil:
                validEstadoCivil.includes(user.Estado_Civil) && user.Estado_Civil
                  ? user.Estado_Civil
                  : "",
              Tipo_Documento:
                validTipoDocumento.includes(user.Tipo_Documento) &&
                user.Tipo_Documento
                  ? user.Tipo_Documento
                  : "",
              familiares: Array.isArray(user.familiares) ? user.familiares : [],
            });
          }
        } catch (err) {
          console.error("Error cargando categorías:", err);
        }
      }
      setUsuarioDni(user.Numero_Documento);
      setSuccess("Usuario cargado correctamente");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.message || "Error al cargar datos del usuario");
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar cambios de edición
  const onSubmit = async (data: FormData) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      // Mapear a IDs para el backend (buscar por id, no por nombre)
      const categoriaObj = categorias.find(
        (c) =>
          String(c.Id_Categoria) === String(data.Categoria) ||
          c.Nombre_Categoria === data.Categoria
      );
      const sindicatoObj = sindicatos.find(
        (s) =>
          String(s.id) === String(data.Id_Sindicato) ||
          s.nombre === data.Id_Sindicato
      );
      const obraSocialObj = obrasSociales.find(
        (o) =>
          String(o.id) === String(data.Id_ObraSocial) ||
          o.nombre === data.Id_ObraSocial
      );
      const convenioObj = convenios.find(
        (c) =>
          String(c.id) === String(data.id_convenio) ||
          c.nombre === data.id_convenio
      );

      // Validar que todos los IDs requeridos existen
      if (!categoriaObj || !sindicatoObj || !obraSocialObj || !convenioObj) {
        setSnackbarMessage(
          "Faltan datos obligatorios para guardar. Verifique que todos los selects tengan un valor válido."
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setIsLoading(false);
        return;
      }

      // Formatear fechas a 'YYYY-MM-DD' si vienen en formato ISO
      const formatDate = (fecha: string) => {
        if (!fecha) return "";
        if (fecha.includes("T")) return fecha.split("T")[0];
        return fecha;
      };

      const payload = {
        ...data,
        Categoria: categoriaObj.Id_Categoria,
        Id_Sindicato: sindicatoObj.id,
        Id_ObraSocial: obraSocialObj.id,
        id_convenio: convenioObj.id,
        Fecha_Desde: formatDate(data.Fecha_Desde),
        Fecha_Nacimiento: formatDate(data.Fecha_Nacimiento),
      };

      const response = await fetch(
        `http://localhost:4000/api/usuario/editar-usuario-dni/${payload.Numero_Documento}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        setSnackbarMessage(result.error || "Error al editar usuario");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
      setSnackbarMessage("Usuario editado exitosamente");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      reset({
        Nombre: "",
        Apellido: "",
        Categoria: "",
        Correo_Electronico: "",
        Domicilio: "",
        Estado_Civil: "",
        Fecha_Desde: "",
        Fecha_Nacimiento: "",
        Legajo: "",
        Telefono: "",
        Tipo_Documento: "",
        Numero_Documento: "",
        Id_Sindicato: "",
        Id_ObraSocial: "",
        id_convenio: "",
        familiares: [],
      });
      setUsuarioDni(null);
    } catch (err) {
      setSnackbarMessage("Error de conexión. Verifique el servidor.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const agregarFamiliar = () =>
    append({
      nombreFamiliar: "",
      parentesco: "",
      fechaNacimientoFamiliar: "",
      tipoDocumentoFamiliar: "",
      numeroDocumentoFamiliar: "",
    });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
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
        <BackButton to="/gestion-usuarios" />

        <Container 
          maxWidth="lg"
          sx={{
            mt: 8,
            mb: 8,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Título principal - solo si no se ha encontrado usuario */}
          {!usuarioDni && (
            <Typography
              component="h1"
              variant="h4"
              sx={{
                mb: 6,
                fontFamily: "Tektur, sans-serif",
                fontWeight: 700,
                color: "#333",
                textAlign: "center",
                letterSpacing: 1,
              }}
            >
              Edición de Usuario
            </Typography>
          )}

          <Box
            sx={{
              py: { xs: 3, md: 5 },
              px: { xs: 1, sm: 4, md: 6 },
              backgroundColor: "#fff",
              borderRadius: 4,
              boxShadow: 3,
              mb: 6,
            }}
          >
            {/* Formulario de búsqueda por DNI, nombre o apellido */}
            {!usuarioDni && (
              <form onSubmit={handleBuscar} style={{ marginBottom: 32 }}>
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
                  Buscar por DNI, Nombre o Apellido
                </Typography>
                
                {searchError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {searchError}
                  </Alert>
                )}
                
                <TextField
                  fullWidth
                  label="DNI, Nombre o Apellido"
                  placeholder="Ej: 12345678, Juan, Pérez"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={searchLoading}
                  sx={{ mb: 3 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={searchLoading}
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
                  {searchLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Buscar"
                  )}
                </Button>
              </form>
            )}

            {/* Formulario de edición solo si se encontró el usuario */}
            {usuarioDni && (
              <form onSubmit={handleSubmit(onSubmit)}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                  </Alert>
                )}

                <Typography
                  variant="h4"
                  textAlign="center"
                  fontWeight={600}
                  mb={3}
                >
                  Editar Usuario
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                  }}
                >
                  {/* Columna Izquierda */}
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Nombre"
                      {...register("Nombre")}
                      error={!!errors.Nombre}
                      helperText={errors.Nombre?.message}
                      disabled={isLoading}
                    />
                    <TextField
                      fullWidth
                      label="Apellido"
                      {...register("Apellido")}
                      error={!!errors.Apellido}
                      helperText={errors.Apellido?.message}
                      disabled={isLoading}
                    />
                    {/* Campo Área eliminado */}
                    <TextField
                      fullWidth
                      label="Domicilio"
                      {...register("Domicilio")}
                      error={!!errors.Domicilio}
                      helperText={errors.Domicilio?.message}
                      disabled={isLoading}
                    />
                    <TextField
                      fullWidth
                      label="Teléfono"
                      {...register("Telefono")}
                      error={!!errors.Telefono}
                      helperText={errors.Telefono?.message}
                      disabled={isLoading}
                    />
                    <Controller
                      name="Fecha_Nacimiento"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          label="Fecha de Nacimiento"
                          format="DD-MM-YYYY"
                          maxDate={dayjs().subtract(18, "year")}
                          minDate={dayjs().subtract(70, "year")}
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(date) =>
                            field.onChange(date?.format("YYYY-MM-DD") || "")
                          }
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.Fecha_Nacimiento,
                              helperText: errors.Fecha_Nacimiento?.message,
                              disabled: isLoading,
                            },
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="Tipo_Documento"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          fullWidth
                          label="Tipo de Documento"
                          select
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          error={!!errors.Tipo_Documento}
                          helperText={errors.Tipo_Documento?.message}
                          disabled={isLoading}
                        >
                          <MenuItem value="" disabled>
                            Seleccione tipo de documento...
                          </MenuItem>
                          <MenuItem value="DNI">DNI</MenuItem>
                          <MenuItem value="Pasaporte">Pasaporte</MenuItem>
                          <MenuItem value="LC">LC</MenuItem>
                          <MenuItem value="LE">LE</MenuItem>
                        </TextField>
                      )}
                    />
                    <TextField
                      fullWidth
                      label="Número de Documento"
                      {...register("Numero_Documento")}
                      error={!!errors.Numero_Documento}
                      helperText={errors.Numero_Documento?.message}
                      disabled={isLoading}
                    />
                    <TextField
                      fullWidth
                      label="Legajo"
                      {...register("Legajo")}
                      error={!!errors.Legajo}
                      helperText={errors.Legajo?.message}
                      disabled
                    />
                    <Controller
                      name="Estado_Civil"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          fullWidth
                          label="Estado Civil"
                          select
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          error={!!errors.Estado_Civil}
                          helperText={errors.Estado_Civil?.message}
                          disabled={isLoading}
                        >
                          <MenuItem value="" disabled>
                            Seleccione estado civil...
                          </MenuItem>
                          <MenuItem value="Soltero/a">Soltero/a</MenuItem>
                          <MenuItem value="Casado/a">Casado/a</MenuItem>
                          <MenuItem value="Divorciado/a">Divorciado/a</MenuItem>
                          <MenuItem value="Viudo/a">Viudo/a</MenuItem>
                          <MenuItem value="En unión convivencial">
                            En unión convivencial
                          </MenuItem>
                        </TextField>
                      )}
                    />
                  </Box>
                  {/* Columna Derecha */}
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <Controller
                      name="Categoria"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          select
                          fullWidth
                          label="Categoría"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          error={!!errors.Categoria}
                          helperText={errors.Categoria?.message}
                          disabled={isLoading || !convenioValue}
                        >
                          {loadingCategorias
                            ? [
                                <MenuItem disabled key="loading-categoria">
                                  <CircularProgress size={20} />
                                </MenuItem>,
                              ]
                            : [
                                <MenuItem
                                  value=""
                                  disabled
                                  key="empty-categoria"
                                >
                                  Seleccione categoría...
                                </MenuItem>,
                                ...categorias.map((c) => (
                                  <MenuItem
                                    key={c.Id_Categoria}
                                    value={String(c.Id_Categoria)}
                                  >
                                    {c.Nombre_Categoria}
                                  </MenuItem>
                                )),
                              ]}
                        </TextField>
                      )}
                    />

                    <Controller
                      name="Id_Sindicato"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          select
                          fullWidth
                          label="Sindicato"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          error={!!errors.Id_Sindicato}
                          helperText={errors.Id_Sindicato?.message}
                          disabled={isLoading}
                        >
                          <MenuItem value="" disabled>
                            Seleccione sindicato...
                          </MenuItem>
                          {sindicatos.map((s) => (
                            <MenuItem key={s.id} value={s.id}>
                              {s.nombre}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                    <Controller
                      name="Id_ObraSocial"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          select
                          fullWidth
                          label="Obra Social"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          error={!!errors.Id_ObraSocial}
                          helperText={errors.Id_ObraSocial?.message}
                          disabled={isLoading}
                        >
                          <MenuItem value="" disabled>
                            Seleccione obra social...
                          </MenuItem>
                          {obrasSociales.map((os) => (
                            <MenuItem key={os.id} value={os.id}>
                              {os.nombre}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                    <Controller
                      name="id_convenio"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          select
                          fullWidth
                          label="Convenio"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          error={!!errors.id_convenio}
                          helperText={errors.id_convenio?.message}
                          disabled={isLoading}
                        >
                          <MenuItem value="" disabled>
                            Seleccione un convenio...
                          </MenuItem>
                          {convenios.map((c) => (
                            <MenuItem key={c.id} value={String(c.id)}>
                              {c.nombre}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                    <Controller
                      name="Fecha_Desde"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          label="Fecha de Contrato"
                          format="DD-MM-YYYY"
                          maxDate={dayjs()}
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(date) =>
                            field.onChange(date?.format("YYYY-MM-DD") || "")
                          }
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.Fecha_Desde,
                              helperText: errors.Fecha_Desde?.message,
                              disabled: isLoading,
                            },
                          }}
                        />
                      )}
                    />
                  </Box>
                </Box>

                {/* Familiares */}
                <Box
                  mt={6}
                  sx={{
                    background: "rgba(245, 247, 250, 0.85)",
                    borderRadius: 3,
                    px: { xs: 2, sm: 4 },
                    py: { xs: 3, sm: 4 },
                  }}
                >
                  <Typography
                    variant="h5"
                    mb={3}
                    fontWeight={600}
                    color="#1565C0"
                    sx={{ letterSpacing: 1 }}
                  >
                    Grupo Familiar
                  </Typography>
                  {/* Formulario para agregar familiar */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
                    <TextField
                      label="Nombre Familiar"
                      value={nuevoFamiliar?.nombreFamiliar || ''}
                      onChange={e => setNuevoFamiliar(f => ({ ...f, nombreFamiliar: e.target.value }))}
                      fullWidth
                    />
                    <TextField
                      label="Parentesco"
                      select
                      value={nuevoFamiliar?.parentesco || ''}
                      onChange={e => setNuevoFamiliar(f => ({ ...f, parentesco: e.target.value }))}
                      fullWidth
                    >
                      <MenuItem value="" disabled>Seleccione...</MenuItem>
                      <MenuItem value="Padre">Padre</MenuItem>
                      <MenuItem value="Madre">Madre</MenuItem>
                      <MenuItem value="Conyuge">Cónyuge</MenuItem>
                      <MenuItem value="Hijo/a">Hijo/a</MenuItem>
                    </TextField>
                    <DatePicker
                      label="Fecha de Nacimiento"
                      format="DD-MM-YYYY"
                      maxDate={dayjs()}
                      value={nuevoFamiliar?.fechaNacimientoFamiliar ? dayjs(nuevoFamiliar.fechaNacimientoFamiliar) : null}
                      onChange={date => setNuevoFamiliar(f => ({ ...f, fechaNacimientoFamiliar: date?.format('YYYY-MM-DD') || '' }))}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: false,
                        },
                      }}
                    />
                    <TextField
                      label="Tipo Documento"
                      select
                      value={nuevoFamiliar?.tipoDocumentoFamiliar || ''}
                      onChange={e => setNuevoFamiliar(f => ({ ...f, tipoDocumentoFamiliar: e.target.value }))}
                      fullWidth
                    >
                      <MenuItem value="" disabled>Seleccione...</MenuItem>
                      <MenuItem value="DNI">DNI</MenuItem>
                      <MenuItem value="Pasaporte">Pasaporte</MenuItem>
                      <MenuItem value="LE">LE</MenuItem>
                      <MenuItem value="LC">LC</MenuItem>
                    </TextField>
                    <TextField
                      label="Número Documento"
                      value={nuevoFamiliar?.numeroDocumentoFamiliar || ''}
                      onChange={e => setNuevoFamiliar(f => ({ ...f, numeroDocumentoFamiliar: e.target.value }))}
                      fullWidth
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleAgregarFamiliar}
                        sx={{ minWidth: 160 }}
                      >
                        Confirmar Familiar
                      </Button>
                    </Box>
                  </Box>
                  {errorFamiliar && (
                    <Alert severity="error" sx={{ mb: 2 }}>{errorFamiliar}</Alert>
                  )}
                  {/* Listado de familiares agregados */}
                  {fields.map((item, index) => (
                    <Card key={item.id} variant="outlined" sx={{ mb: 3, p: 2 }}>
                      <CardContent sx={{ p: 0 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                          <TextField
                            label="Nombre Familiar"
                            value={item.nombreFamiliar}
                            InputProps={{ readOnly: true }}
                            fullWidth
                          />
                          <TextField
                            label="Parentesco"
                            value={item.parentesco}
                            InputProps={{ readOnly: true }}
                            fullWidth
                          />
                          <TextField
                            label="Fecha de Nacimiento"
                            value={item.fechaNacimientoFamiliar}
                            InputProps={{ readOnly: true }}
                            fullWidth
                          />
                          <TextField
                            label="Tipo Documento"
                            value={item.tipoDocumentoFamiliar}
                            InputProps={{ readOnly: true }}
                            fullWidth
                          />
                          <TextField
                            label="Número Documento"
                            value={item.numeroDocumentoFamiliar}
                            InputProps={{ readOnly: true }}
                            fullWidth
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IconButton color="error" onClick={() => remove(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ mt: 4 }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Guardar Cambios"
                  )}
                </Button>
              </form>
            )}
          </Box>
        </Container>

        {/* Snackbar para notificaciones */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbarSeverity} 
            sx={{ 
              width: '100%',
              minWidth: '400px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              boxShadow: 6,
              '& .MuiAlert-message': {
                fontSize: '1.1rem'
              }
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

        <Footer />
      </Box>
    </LocalizationProvider>
  );
};

export default EditarUsuario;
