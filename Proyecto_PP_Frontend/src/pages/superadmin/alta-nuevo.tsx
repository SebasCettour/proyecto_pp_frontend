import React, { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link as RouterLink } from "react-router-dom";
import { z } from "zod";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  CircularProgress,
  MenuItem,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/es";

// ✅ VALIDACIONES
const schema = z.object({
  username: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras y espacios"),

  email: z
    .string()
    .email("Email inválido")
    .max(100, "El email no puede exceder 100 caracteres"),

  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "La contraseña no puede exceder 100 caracteres"),

  roleId: z.string().min(1, "Debe seleccionar un rol"),

  area: z
    .string()
    .min(2, "El área debe tener al menos 2 caracteres")
    .max(50, "El área no puede exceder 50 caracteres"),

  cargo: z
    .string()
    .min(2, "El cargo debe tener al menos 2 caracteres")
    .max(50, "El cargo no puede exceder 50 caracteres"),

  domicilio: z
    .string()
    .min(10, "El domicilio debe ser más específico")
    .max(150, "El domicilio no puede exceder 150 caracteres"),

  estadoCivil: z.string().min(1, "Debe seleccionar un estado civil"),

  fechaContrato: z
    .string()
    .min(1, "La fecha de contrato es requerida")
    .refine((date) => {
      const today = new Date();
      const contractDate = new Date(date);
      return contractDate <= today;
    }, "La fecha de contrato no puede ser futura"),

  fechaNacimiento: z
    .string()
    .min(10, "La fecha debe tener formato yyyy-mm-dd")
    .max(10, "La fecha debe tener formato yyyy-mm-dd")
    .refine((date) => {
      // Solo acepta exactamente 4 dígitos para el año al inicio
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
      if (!match) return false;
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      if (year < 1900 || year > 2099) return false;
      // Validar fecha real
      const birthDate = new Date(
        `${year}-${month.toString().padStart(2, "0")}-${day
          .toString()
          .padStart(2, "0")}`
      );
      const today = new Date();
      if (birthDate > today) return false;
      let age = today.getFullYear() - year;
      const m = today.getMonth() + 1 - month;
      if (m < 0 || (m === 0 && today.getDate() < day)) {
        age--;
      }
      return age >= 18 && age <= 70;
    }, "La fecha debe tener formato yyyy-mm-dd, año de 4 dígitos, no ser futura y la edad entre 18 y 70 años"),

  telefono: z
    .string()
    .min(8, "El teléfono debe tener al menos 8 dígitos")
    .max(20, "El teléfono no puede exceder 20 caracteres")
    .regex(/^[0-9+\-\s()]+$/, "Formato de teléfono inválido"),

  tipoDocumento: z.string().min(1, "Debe seleccionar un tipo de documento"),

  numeroDocumento: z
    .string()
    .min(7, "El número de documento debe tener al menos 7 dígitos")
    .max(50, "El número de documento no puede exceder 50 caracteres")
    .regex(/^[0-9]+$/, "Solo se permiten números"),

  sindicatoId: z.string().min(1, "Debe seleccionar un sindicato"),

  // Campos del grupo familiar
  familiares: z
    .array(
      z.object({
        nombreFamiliar: z
          .string()
          .min(2, "El nombre debe tener al menos 2 caracteres")
          .max(100, "El nombre no puede exceder 100 caracteres")
          .regex(
            /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
            "Solo se permiten letras y espacios"
          ),

        parentesco: z.string().min(1, "Debe seleccionar un parentesco"),

        fechaNacimientoFamiliar: z
          .string()
          .min(1, "La fecha de nacimiento es requerida")
          .refine((value) => {
            // Validar formato de fecha
            const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
            if (!match) return false;
            const year = Number(match[1]);
            const month = Number(match[2]);
            const day = Number(match[3]);
            if (year < 1900 || year > 2099) return false;
            // Validar que no sea fecha futura
            const birthDate = new Date(
              `${year}-${month.toString().padStart(2, "0")}-${day
                .toString()
                .padStart(2, "0")}`
            );
            const today = new Date();
            return birthDate <= today;
          }, "La fecha debe tener formato yyyy-mm-dd, año de 4 dígitos y no ser futura"),

        tipoDocumentoFamiliar: z
          .string()
          .min(1, "Debe seleccionar un tipo de documento"),

        numeroDocumentoFamiliar: z
          .string()
          .min(7, "El número de documento debe tener al menos 7 dígitos")
          .max(50, "El número de documento no puede exceder 50 caracteres")
          .regex(/^[0-9]+$/, "Solo se permiten números"),
      })
    )
    .optional(),
});

type FormData = z.infer<typeof schema>;

const AltaNuevo: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Configurar dayjs en español
  dayjs.locale("es");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    // ✅ VALORES INICIALES VACÍOS
    defaultValues: {
      username: "",
      email: "",
      password: "",
      roleId: "",
      area: "",
      cargo: "",
      domicilio: "",
      estadoCivil: "",
      fechaContrato: "",
      fechaNacimiento: "",
      telefono: "",
      tipoDocumento: "",
      numeroDocumento: "",
      sindicatoId: "",
      // Campos del grupo familiar
      familiares: [],
    },
  });

  // Hook para manejar el array de familiares
  const { fields, append, remove } = useFieldArray({
    control,
    name: "familiares",
  });

  // Función para agregar un nuevo familiar
  const agregarFamiliar = () => {
    append({
      nombreFamiliar: "",
      parentesco: "",
      fechaNacimientoFamiliar: "",
      tipoDocumentoFamiliar: "",
      numeroDocumentoFamiliar: "",
    });
  };

  // obtener el tipo de documento seleccionado y calcular máximo permitido
  const tipoDocumentoValue = watch("tipoDocumento");
  const numeroMaxLength = tipoDocumentoValue === "Pasaporte" ? 10 : 9;

  const onSubmit = async (data: FormData) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const empleadoData = {
        username: data.username,
        email: data.email,
        password: data.password,
        rolId: Number(data.roleId),
        area: data.area,
        cargo: data.cargo,
        domicilio: data.domicilio,
        estadoCivil: data.estadoCivil,
        fechaContrato: data.fechaContrato,
        fechaNacimiento: data.fechaNacimiento,
        telefono: data.telefono,
        tipoDocumento: data.tipoDocumento,
        numeroDocumento: data.numeroDocumento,
        sindicatoId: data.sindicatoId,
        // ✅ AGREGAR FAMILIARES AL PAYLOAD
        familiares: data.familiares || [],
      };

      console.log("Datos del empleado a enviar:", empleadoData);

      // ✅ REMOVER EL TODO - YA ESTÁ IMPLEMENTADO
      if (data.familiares && data.familiares.length > 0) {
        console.log("Familiares a procesar:", data.familiares);
      }

      const response = await fetch(
        "http://localhost:4000/api/usuario/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(empleadoData),
        }
      );

      // ✅ VERIFICAR SI LA RESPUESTA ES JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.log("Respuesta del servidor:", text);
        throw new Error("El servidor no devolvió JSON válido");
      }

      const result = await response.json();

      if (!response.ok) {
        // MANEJO DE ERRORES ESPECÍFICOS
        if (response.status === 409) {
          if (result.error.includes("documento")) {
            setError("El número de documento ya está registrado");
          } else if (result.error.includes("email")) {
            setError("El email ya está registrado");
          } else if (result.error.includes("username")) {
            setError("El nombre de usuario ya está registrado");
          } else {
            setError("Los datos ingresados ya existen en el sistema");
          }
        } else if (response.status === 400 && result.errors) {
          setError(result.errors.join(", "));
        } else {
          setError(result.error || "Error al crear usuario");
        }
      } else {
        setSuccess("Usuario creado exitosamente");
        reset();
        setTimeout(() => {
          navigate("/superadmin");
        }, 2000);
      }
    } catch (err) {
      console.error("Error completo:", err);
      setError(
        "Error de conexión. Verifique que el servidor esté funcionando."
      );
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* BOTÓN VOLVER */}
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
              fontFamily: "Tektur, sans-serif",
              fontWeight: 500,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#0d47a1",
              },
            }}
          >
            Volver
          </Button>
        </Box>

        {/* Contenido principal */}
        <Container
          maxWidth="md"
          sx={{
            mt: 4,
            mb: 8,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              backgroundColor: "white",
              borderRadius: 2,
              p: 4,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              width: "100%",
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
                textAlign: "center",
              }}
            >
              Alta Nuevo Usuario
            </Typography>

            {/* ✅ ALERTAS */}
            {error && (
              <Alert severity="error" sx={{ width: "100%", mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ width: "100%", mb: 3 }}>
                {success}
              </Alert>
            )}

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 3,
                width: "100%",
              }}
            >
              {/* Columna 1 */}
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
                  label="Nombre y Apellido"
                  placeholder="Ej: Juan Carlos Pérez"
                  {...register("username")}
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  disabled={isLoading}
                />

                <Controller
                  name="fechaNacimiento"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Fecha de Nacimiento"
                      format="DD-MM-YYYY"
                      maxDate={dayjs().subtract(1, "day")} // No puede ser fecha futura (hasta ayer)
                      minDate={dayjs().subtract(70, "years")} // Máximo 70 años
                      value={
                        field.value
                          ? dayjs(field.value, ["YYYY-MM-DD", "DD-MM-YYYY"])
                          : null
                      }
                      onChange={(date) => {
                        // Solo permitir fechas pasadas
                        if (date && date.isAfter(dayjs().subtract(1, "day"))) {
                          return; // No hacer nada si es fecha futura
                        }
                        field.onChange(
                          date && date.isValid()
                            ? date.format("YYYY-MM-DD")
                            : ""
                        );
                      }}
                      shouldDisableDate={(date) => {
                        // Deshabilitar fechas futuras (incluyendo hoy) y fechas que resulten en edad menor a 18 o mayor a 70
                        const today = dayjs();
                        const yesterday = dayjs().subtract(1, "day");
                        const age = today.diff(date, "years");
                        return date.isAfter(yesterday) || age < 18 || age > 70;
                      }}
                      views={["year", "month", "day"]}
                      openTo="year"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.fechaNacimiento,
                          helperText: errors.fechaNacimiento?.message,
                          disabled: isLoading,
                        },
                        calendarHeader: {
                          format: "MMMM YYYY",
                        },
                        day: {
                          sx: {
                            "&.Mui-disabled": {
                              backgroundColor: "#f5f5f5 !important",
                              color: "#bdbdbd !important",
                              pointerEvents: "none",
                            },
                          },
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="tipoDocumento"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      label="Tipo de Documento"
                      {...field}
                      value={field.value || ""}
                      error={!!errors.tipoDocumento}
                      helperText={errors.tipoDocumento?.message}
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
                  placeholder="Ej: 12345678"
                  {...register("numeroDocumento")}
                  error={!!errors.numeroDocumento}
                  helperText={errors.numeroDocumento?.message}
                  disabled={isLoading}
                  inputProps={{ maxLength: numeroMaxLength }}
                />

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  {...register("email")}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={isLoading}
                />

                <TextField
                  fullWidth
                  label="Teléfono"
                  placeholder="Ej: +54 9 11 1234-5678"
                  {...register("telefono")}
                  error={!!errors.telefono}
                  helperText={errors.telefono?.message}
                  disabled={isLoading}
                  inputProps={{ maxLength: 20 }}
                />

                <TextField
                  fullWidth
                  label="Domicilio"
                  placeholder="Calle, número, ciudad, provincia"
                  {...register("domicilio")}
                  error={!!errors.domicilio}
                  helperText={errors.domicilio?.message}
                  disabled={isLoading}
                />

                <Controller
                  name="estadoCivil"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      label="Estado Civil"
                      {...field}
                      value={field.value || ""}
                      error={!!errors.estadoCivil}
                      helperText={errors.estadoCivil?.message}
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

              {/* Columna 2 */}
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
                  label="Contraseña"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  {...register("password")}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={isLoading}
                />

                <Controller
                  name="roleId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      label="Rol"
                      {...field}
                      value={field.value || ""}
                      error={!!errors.roleId}
                      helperText={errors.roleId?.message}
                      disabled={isLoading}
                    >
                      <MenuItem value="" disabled>
                        Seleccione un rol...
                      </MenuItem>
                      <MenuItem value="1">Superadmin</MenuItem>
                      <MenuItem value="2">RRHH</MenuItem>
                      <MenuItem value="3">Contador</MenuItem>
                      <MenuItem value="4">Empleado</MenuItem>
                    </TextField>
                  )}
                />

                <TextField
                  fullWidth
                  label="Área"
                  placeholder="Ej: Administración, Ventas, IT"
                  {...register("area")}
                  error={!!errors.area}
                  helperText={errors.area?.message}
                  disabled={isLoading}
                />

                <TextField
                  fullWidth
                  label="Cargo"
                  placeholder="Ej: Gerente, Analista, Asistente"
                  {...register("cargo")}
                  error={!!errors.cargo}
                  helperText={errors.cargo?.message}
                  disabled={isLoading}
                />

                <Controller
                  name="fechaContrato"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Fecha de Contrato"
                      format="DD-MM-YYYY"
                      maxDate={dayjs()} // Hasta hoy
                      value={
                        field.value
                          ? dayjs(field.value, ["YYYY-MM-DD", "DD-MM-YYYY"])
                          : null
                      }
                      onChange={(date) => {
                        // Solo permitir fechas hasta hoy
                        if (date && date.isAfter(dayjs())) {
                          return; // No hacer nada si es fecha futura
                        }
                        field.onChange(
                          date && date.isValid()
                            ? date.format("YYYY-MM-DD")
                            : ""
                        );
                      }}
                      shouldDisableDate={(date) => {
                        // Deshabilitar fechas futuras (después de hoy)
                        return date.isAfter(dayjs());
                      }}
                      views={["year", "month", "day"]}
                      openTo="year"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.fechaContrato,
                          helperText: errors.fechaContrato?.message,
                          disabled: isLoading,
                        },
                        calendarHeader: {
                          format: "MMMM YYYY",
                        },
                        day: {
                          sx: {
                            "&.Mui-disabled": {
                              backgroundColor: "#f5f5f5 !important",
                              color: "#bdbdbd !important",
                              pointerEvents: "none",
                            },
                          },
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="sindicatoId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      label="Sindicato"
                      {...field}
                      value={field.value || ""}
                      error={!!errors.sindicatoId}
                      helperText={errors.sindicatoId?.message}
                      disabled={isLoading}
                    >
                      <MenuItem value="" disabled>
                        Seleccione un sindicato...
                      </MenuItem>
                      <MenuItem value="1">
                        Sindicato Empleados de Comercio
                      </MenuItem>
                    </TextField>
                  )}
                />
              </Box>
            </Box>

            {/* Sección del Grupo Familiar */}
            <Typography
              variant="h5"
              sx={{
                mt: 4,
                mb: 2,
                fontFamily: "Tektur, sans-serif",
                fontWeight: 500,
                color: "#333",
                textAlign: "center",
              }}
            >
              Grupo Familiar
            </Typography>

            {/* Botón para agregar familiar */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              <Button
                onClick={agregarFamiliar}
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{
                  borderColor: "#1565C0",
                  color: "#1565C0",
                  "&:hover": {
                    backgroundColor: "#1565C0",
                    color: "white",
                  },
                }}
              >
                Agregar Familiar
              </Button>
            </Box>

            {/* Lista de familiares */}
            {fields.map((field, index) => (
              <Card key={field.id} sx={{ mb: 3, p: 2 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontFamily: "Tektur, sans-serif" }}
                    >
                      Familiar {index + 1}
                    </Typography>
                    <IconButton
                      onClick={() => remove(index)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      gap: 3,
                      width: "100%",
                    }}
                  >
                    {/* Columna 1 - Datos del Familiar */}
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
                        label="Nombre y Apellido del Familiar"
                        placeholder="Ej: María González"
                        {...register(`familiares.${index}.nombreFamiliar`)}
                        error={!!errors.familiares?.[index]?.nombreFamiliar}
                        helperText={
                          errors.familiares?.[index]?.nombreFamiliar?.message
                        }
                        disabled={isLoading}
                      />

                      <Controller
                        name={`familiares.${index}.parentesco`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            select
                            fullWidth
                            label="Parentesco"
                            {...field}
                            value={field.value || ""}
                            error={!!errors.familiares?.[index]?.parentesco}
                            helperText={
                              errors.familiares?.[index]?.parentesco?.message
                            }
                            disabled={isLoading}
                          >
                            <MenuItem value="" disabled>
                              Seleccione parentesco...
                            </MenuItem>
                            <MenuItem value="Padre">Padre</MenuItem>
                            <MenuItem value="Madre">Madre</MenuItem>
                            <MenuItem value="Cónyuge">Cónyuge</MenuItem>
                            <MenuItem value="Hijo">Hijo</MenuItem>
                          </TextField>
                        )}
                      />

                      <Controller
                        name={`familiares.${index}.fechaNacimientoFamiliar`}
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            label="Fecha de Nacimiento del Familiar"
                            format="DD-MM-YYYY"
                            maxDate={dayjs()} // No puede ser fecha futura
                            value={
                              field.value
                                ? dayjs(field.value, [
                                    "YYYY-MM-DD",
                                    "DD-MM-YYYY",
                                  ])
                                : null
                            }
                            onChange={(date) => {
                              // Solo permitir fechas pasadas
                              if (date && date.isAfter(dayjs())) {
                                return; // No hacer nada si es fecha futura
                              }
                              field.onChange(
                                date && date.isValid()
                                  ? date.format("YYYY-MM-DD")
                                  : ""
                              );
                            }}
                            shouldDisableDate={(date) => {
                              // Deshabilitar fechas futuras
                              return date.isAfter(dayjs());
                            }}
                            views={["year", "month", "day"]}
                            openTo="year"
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error:
                                  !!errors.familiares?.[index]
                                    ?.fechaNacimientoFamiliar,
                                helperText:
                                  errors.familiares?.[index]
                                    ?.fechaNacimientoFamiliar?.message,
                                disabled: isLoading,
                              },
                              calendarHeader: {
                                format: "MMMM YYYY",
                              },
                              day: {
                                sx: {
                                  "&.Mui-disabled": {
                                    backgroundColor: "#f5f5f5 !important",
                                    color: "#bdbdbd !important",
                                    pointerEvents: "none",
                                  },
                                },
                              },
                            }}
                          />
                        )}
                      />
                    </Box>

                    {/* Columna 2 - Documentación del Familiar */}
                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <Controller
                        name={`familiares.${index}.tipoDocumentoFamiliar`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            select
                            fullWidth
                            label="Tipo de Documento del Familiar"
                            {...field}
                            value={field.value || ""}
                            error={
                              !!errors.familiares?.[index]
                                ?.tipoDocumentoFamiliar
                            }
                            helperText={
                              errors.familiares?.[index]?.tipoDocumentoFamiliar
                                ?.message
                            }
                            disabled={isLoading}
                          >
                            <MenuItem value="" disabled>
                              Seleccione tipo de documento...
                            </MenuItem>
                            <MenuItem value="DNI">DNI</MenuItem>
                            <MenuItem value="Pasaporte">Pasaporte</MenuItem>
                            <MenuItem value="LC">LC</MenuItem>
                            <MenuItem value="LE">LE</MenuItem>
                            <MenuItem value="Certificado de Nacimiento">
                              Certificado de Nacimiento
                            </MenuItem>
                          </TextField>
                        )}
                      />

                      <TextField
                        fullWidth
                        label="Número de Documento del Familiar"
                        placeholder="Ej: 12345678"
                        {...register(
                          `familiares.${index}.numeroDocumentoFamiliar`
                        )}
                        error={
                          !!errors.familiares?.[index]?.numeroDocumentoFamiliar
                        }
                        helperText={
                          errors.familiares?.[index]?.numeroDocumentoFamiliar
                            ?.message
                        }
                        disabled={isLoading}
                        inputProps={{ maxLength: 50 }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}

            {/* Mostrar mensaje si no hay familiares */}
            {fields.length === 0 && (
              <Box sx={{ textAlign: "center", py: 3, color: "#666" }}>
                <Typography variant="body1">
                  No hay familiares agregados. Haga clic en "Agregar Familiar"
                  para comenzar.
                </Typography>
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{
                mt: 4,
                py: 1.5,
                fontFamily: "Tektur, sans-serif",
                fontWeight: 600,
                fontSize: "1.1rem",
                borderRadius: 1,
                textTransform: "none",
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Crear Usuario"
              )}
            </Button>
          </Box>
        </Container>

        <Footer />
      </Box>
    </LocalizationProvider>
  );
};

export default AltaNuevo;
