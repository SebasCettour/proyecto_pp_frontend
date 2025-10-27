import React, { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/es";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

type ObraSocial = { id: string; nombre: string };
type Sindicato = { id: string; nombre: string };

const schema = z.object({
  username: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras y espacios"),
  email: z.string().email("Email inválido").max(100),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(100),
  roleId: z.string().min(1, "Debe seleccionar un rol"),
  area: z.string().min(2, "El área debe tener al menos 2 caracteres").max(50),
  cargo: z.string().min(2, "El cargo debe tener al menos 2 caracteres").max(50),
  domicilio: z.string().min(10, "El domicilio debe ser más específico").max(150),
  estadoCivil: z.string().min(1, "Debe seleccionar un estado civil"),
  obraSocialId: z.string().min(1, "Debe seleccionar una obra social"),
  fechaContrato: z
    .string()
    .min(1, "La fecha de contrato es requerida")
    .refine((date) => new Date(date) <= new Date(), "La fecha de contrato no puede ser futura"),
  fechaNacimiento: z.string().refine((date) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!match) return false;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const birthDate = new Date(`${year}-${month}-${day}`);
    const today = new Date();
    const age = today.getFullYear() - year - (today < new Date(today.getFullYear(), month - 1, day) ? 1 : 0);
    return birthDate <= today && age >= 18 && age <= 70;
  }, "La fecha debe tener formato yyyy-mm-dd y la edad debe ser entre 18 y 70 años"),
  telefono: z.string().min(8, "El teléfono debe tener al menos 8 dígitos").max(20, "El teléfono no puede exceder 20 caracteres").regex(/^[0-9+\-\s()]+$/, "Formato de teléfono inválido"),
  tipoDocumento: z.string().min(1, "Debe seleccionar un tipo de documento"),
  numeroDocumento: z.string().min(7).max(50).regex(/^[0-9]+$/, "Solo se permiten números"),
  sindicatoId: z.string().min(1, "Debe seleccionar un sindicato"),
  familiares: z.array(
    z.object({
      nombreFamiliar: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre no puede exceder 100 caracteres").regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras y espacios"),
      parentesco: z.string().min(1, "Debe seleccionar un parentesco"),
      fechaNacimientoFamiliar: z.string().min(1, "La fecha de nacimiento es requerida").refine((value) => {
        const date = new Date(value);
        return !isNaN(date.getTime()) && date <= new Date();
      }, "La fecha no puede ser futura"),
      tipoDocumentoFamiliar: z.string().min(1, "Debe seleccionar un tipo de documento"),
      numeroDocumentoFamiliar: z.string().min(7, "Debe tener al menos 7 dígitos").max(50).regex(/^[0-9]+$/, "Solo se permiten números"),
    })
  ).optional(),
});

type FormData = z.infer<typeof schema>;

const AltaNuevo: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([]);
  const [loadingObras, setLoadingObras] = useState(false);
  const [sindicatos, setSindicatos] = useState<Sindicato[]>([]);
  const [loadingSindicatos, setLoadingSindicatos] = useState(false);

  useEffect(() => {
    dayjs.locale("es");
    const fetchObrasSociales = async () => {
      setLoadingObras(true);
      try {
        const res = await fetch("http://localhost:4000/api/obras-sociales");
        if (!res.ok) throw new Error("Error al obtener obras sociales");
        const data = await res.json();
        setObrasSociales(data.map((os: any) => ({ id: String(os.ID_ObraSocial || os.id), nombre: os.Nombre || os.nombre })));
      } catch {
        setObrasSociales([{ id: "1", nombre: "OSECAC" }]);
      } finally {
        setLoadingObras(false);
      }
    };
    const fetchSindicatos = async () => {
      setLoadingSindicatos(true);
      try {
        const res = await fetch("http://localhost:4000/api/sindicatos");
        if (!res.ok) throw new Error("Error al obtener sindicatos");
        const data = await res.json();
        setSindicatos(data.map((s: any) => ({ id: String(s.ID_Sindicato || s.id), nombre: s.Nombre || s.nombre })));
      } catch {
        setSindicatos([{ id: "1", nombre: "Sindicato Empleados de Comercio" }]);
      } finally {
        setLoadingSindicatos(false);
      }
    };
    fetchObrasSociales();
    fetchSindicatos();
  }, []);

  const { register, handleSubmit, formState: { errors }, reset, control, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      roleId: "",
      area: "",
      cargo: "",
      domicilio: "",
      estadoCivil: "",
      obraSocialId: "",
      fechaContrato: "",
      fechaNacimiento: "",
      telefono: "",
      tipoDocumento: "",
      numeroDocumento: "",
      sindicatoId: "",
      familiares: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "familiares" });
  const tipoDocumentoValue = watch("tipoDocumento");
  const numeroMaxLength = tipoDocumentoValue === "Pasaporte" ? 10 : 9;

  const agregarFamiliar = () => append({ nombreFamiliar: "", parentesco: "", fechaNacimientoFamiliar: "", tipoDocumentoFamiliar: "", numeroDocumentoFamiliar: "" });

  const onSubmit = async (data: FormData) => {
    setError(null); setSuccess(null); setIsLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/usuario/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Error al crear usuario");
      setSuccess("Usuario creado exitosamente");
      reset();
      setTimeout(() => navigate("/superadmin"), 2000);
    } catch (err) {
      console.error(err);
      setError("Error de conexión. Verifique que el servidor esté funcionando.");
    } finally { setIsLoading(false); }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <Box sx={{ minHeight: "100vh", backgroundImage: "url('/fondo.jpg')", backgroundSize: "cover", backgroundPosition: "center", display: "flex", flexDirection: "column", overflowX: "hidden" }}>
        <Header />
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, px: 4 }}>
          <Button component={RouterLink} to="/superadmin" variant="outlined" sx={{ backgroundColor: "#1565C0", color: "#ffffff", width: 180, letterSpacing: 3, fontSize: 20, borderRadius: 3, mr: 5, fontFamily: "Tektur, sans-serif", fontWeight: 500, textTransform: "none" }}>Volver</Button>
        </Box>
        <Container maxWidth="lg">
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{
            py: { xs: 3, md: 5 },
            px: { xs: 1, sm: 4, md: 6 },
            backgroundColor: '#fff',
            borderRadius: 4,
            boxShadow: 3,
            mb: 6,
          }}>
            <Typography variant="h4" textAlign="center" fontWeight={600} mb={3}>Alta de Nuevo Empleado</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {/* Columnas principales */}
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
              {/* Primera columna */}
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, backgroundColor: '#fff', p: 2 }}>
                <TextField fullWidth label="Nombre y Apellido" {...register("username")} error={!!errors.username} helperText={errors.username?.message} disabled={isLoading} />
                <Controller name="fechaNacimiento" control={control} render={({ field }) => (
                  <DatePicker label="Fecha de Nacimiento" format="DD-MM-YYYY" maxDate={dayjs().subtract(1, "day")} minDate={dayjs().subtract(70, "years")} value={field.value ? dayjs(field.value) : null} onChange={(date) => field.onChange(date?.format("YYYY-MM-DD") || "")} slotProps={{ textField: { fullWidth: true, error: !!errors.fechaNacimiento, helperText: errors.fechaNacimiento?.message, disabled: isLoading } }} />
                )} />
                <Controller name="tipoDocumento" control={control} render={({ field }) => (
                  <TextField select fullWidth label="Tipo de Documento" {...field} error={!!errors.tipoDocumento} helperText={errors.tipoDocumento?.message} disabled={isLoading}>
                    <MenuItem value="" disabled>Seleccione tipo de documento...</MenuItem>
                    <MenuItem value="DNI">DNI</MenuItem>
                    <MenuItem value="Pasaporte">Pasaporte</MenuItem>
                    <MenuItem value="LC">LC</MenuItem>
                    <MenuItem value="LE">LE</MenuItem>
                  </TextField>
                )} />
                <TextField fullWidth label="Número de Documento" {...register("numeroDocumento")} error={!!errors.numeroDocumento} helperText={errors.numeroDocumento?.message} disabled={isLoading} inputProps={{ maxLength: numeroMaxLength }} />
                <TextField fullWidth label="Email" {...register("email")} error={!!errors.email} helperText={errors.email?.message} disabled={isLoading} />
                <TextField fullWidth label="Teléfono" {...register("telefono")} error={!!errors.telefono} helperText={errors.telefono?.message} disabled={isLoading} inputProps={{ maxLength: 20 }} />
                <TextField fullWidth label="Domicilio" {...register("domicilio")} error={!!errors.domicilio} helperText={errors.domicilio?.message} disabled={isLoading} />
                <Controller name="estadoCivil" control={control} render={({ field }) => (
                  <TextField select fullWidth label="Estado Civil" {...field} error={!!errors.estadoCivil} helperText={errors.estadoCivil?.message} disabled={isLoading}>
                    <MenuItem value="" disabled>Seleccione estado civil...</MenuItem>
                    <MenuItem value="Soltero/a">Soltero/a</MenuItem>
                    <MenuItem value="Casado/a">Casado/a</MenuItem>
                    <MenuItem value="Divorciado/a">Divorciado/a</MenuItem>
                    <MenuItem value="Viudo/a">Viudo/a</MenuItem>
                    <MenuItem value="En unión convivencial">En unión convivencial</MenuItem>
                  </TextField>
                )} />
              </Box>

              {/* Segunda columna */}
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, backgroundColor: '#fff', p: 2 }}>
                <TextField fullWidth label="Contraseña" type="password" {...register("password")} error={!!errors.password} helperText={errors.password?.message} disabled={isLoading} />
                <Controller name="roleId" control={control} render={({ field }) => (
                  <TextField select fullWidth label="Rol" {...field} error={!!errors.roleId} helperText={errors.roleId?.message} disabled={isLoading}>
                    <MenuItem value="" disabled>Seleccione un rol...</MenuItem>
                    <MenuItem value="1">Superadmin</MenuItem>
                    <MenuItem value="2">RRHH</MenuItem>
                    <MenuItem value="3">Contador</MenuItem>
                    <MenuItem value="4">Empleado</MenuItem>
                  </TextField>
                )} />
                <TextField fullWidth label="Área" {...register("area")} error={!!errors.area} helperText={errors.area?.message} disabled={isLoading} />
                <TextField fullWidth label="Cargo" {...register("cargo")} error={!!errors.cargo} helperText={errors.cargo?.message} disabled={isLoading} />
                <Controller name="fechaContrato" control={control} render={({ field }) => (
                  <DatePicker label="Fecha de Contrato" format="DD-MM-YYYY" maxDate={dayjs()} value={field.value ? dayjs(field.value) : null} onChange={(date) => field.onChange(date?.format("YYYY-MM-DD") || "")} slotProps={{ textField: { fullWidth: true, error: !!errors.fechaContrato, helperText: errors.fechaContrato?.message, disabled: isLoading } }} />
                )} />
                <Controller name="obraSocialId" control={control} render={({ field }) => (
                  <TextField select fullWidth label="Obra Social" {...field} error={!!errors.obraSocialId} helperText={errors.obraSocialId?.message} disabled={isLoading}>
                    {loadingObras ? <MenuItem disabled><CircularProgress size={20} /></MenuItem> : obrasSociales.map((os) => <MenuItem key={os.id} value={os.id}>{os.nombre}</MenuItem>)}
                  </TextField>
                )} />
                <Controller name="sindicatoId" control={control} render={({ field }) => (
                  <TextField select fullWidth label="Sindicato" {...field} error={!!errors.sindicatoId} helperText={errors.sindicatoId?.message} disabled={isLoading}>
                    {loadingSindicatos ? <MenuItem disabled><CircularProgress size={20} /></MenuItem> : <>
                      <MenuItem value="" disabled>Seleccione sindicato...</MenuItem>
                      {sindicatos.map((s) => <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>)}
                    </>}
                  </TextField>
                )} />
              </Box>
            </Box>

            {/* Familiares */}
            <Box mt={6} sx={{
              background: 'rgba(245, 247, 250, 0.85)',
              borderRadius: 3,
              px: { xs: 2, sm: 4 },
              py: { xs: 3, sm: 4 },
              boxShadow: 0,
            }}>
              <Typography variant="h5" mb={3} fontWeight={600} color="#1565C0" sx={{ letterSpacing: 1 }}>
                Grupo Familiar
              </Typography>
              {fields.map((item, index) => (
                <Card key={item.id} variant="outlined" sx={{ mb: 3, backgroundColor: '#fff', borderRadius: 2, boxShadow: 1, p: 2 }}>
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      <TextField label="Nombre Familiar" {...register(`familiares.${index}.nombreFamiliar`)} error={!!errors.familiares?.[index]?.nombreFamiliar} helperText={errors.familiares?.[index]?.nombreFamiliar?.message} />
                      <TextField label="Parentesco" {...register(`familiares.${index}.parentesco`)} error={!!errors.familiares?.[index]?.parentesco} helperText={errors.familiares?.[index]?.parentesco?.message} />
                      <Controller name={`familiares.${index}.fechaNacimientoFamiliar`} control={control} render={({ field }) => (
                        <DatePicker label="Fecha de Nacimiento" format="DD-MM-YYYY" maxDate={dayjs()} value={field.value ? dayjs(field.value) : null} onChange={(date) => field.onChange(date?.format("YYYY-MM-DD") || "")} slotProps={{ textField: { error: !!errors.familiares?.[index]?.fechaNacimientoFamiliar, helperText: errors.familiares?.[index]?.fechaNacimientoFamiliar?.message } }} />
                      )} />
                      <TextField label="Tipo Documento" {...register(`familiares.${index}.tipoDocumentoFamiliar`)} error={!!errors.familiares?.[index]?.tipoDocumentoFamiliar} helperText={errors.familiares?.[index]?.tipoDocumentoFamiliar?.message} />
                      <TextField label="Número Documento" {...register(`familiares.${index}.numeroDocumentoFamiliar`)} error={!!errors.familiares?.[index]?.numeroDocumentoFamiliar} helperText={errors.familiares?.[index]?.numeroDocumentoFamiliar?.message} />
                      <IconButton color="error" onClick={() => remove(index)}><DeleteIcon /></IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outlined" startIcon={<AddIcon />} onClick={agregarFamiliar}>Agregar Familiar</Button>
            </Box>

            <Button type="submit" variant="contained" fullWidth sx={{ mt: 4 }} disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} color="inherit" /> : "Registrar Empleado"}
            </Button>
          </Box>
        </Container>
        <Footer />
      </Box>
    </LocalizationProvider>
  );
};

export default AltaNuevo;
