import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Grid,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";

const schema = z.object({
  username: z.string().min(3, "El usuario es requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  roleId: z.string().min(1, "El rol es requerido"),
  area: z.string().min(1, "El área es requerida"),
  cargo: z.string().min(1, "El cargo es requerido"),
  domicilio: z.string().min(1, "El domicilio es requerido"),
  estadoCivil: z.string().min(1, "El estado civil es requerido"),
  fechaContrato: z.string().min(1, "La fecha de contrato es requerida"),
  fechaNacimiento: z.string().min(1, "La fecha de nacimiento es requerida"),
  legajo: z.string().min(1, "El legajo es requerido"),
  telefono: z.string().min(1, "El teléfono es requerido"),
  tipoDocumento: z.string().min(1, "El tipo de documento es requerido"),
  numeroDocumento: z.string().min(1, "El número de documento es requerido"),
});

type FormData = z.infer<typeof schema>;

const AltaNuevo: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipoDocumento: "",
      estadoCivil: "",
      roleId: "",

    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:4000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          roleId: Number(data.roleId),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Error al crear usuario");
      } else {
        reset();
        navigate("/superadmin");
      }
    } catch (err) {
      setError("Error de red o servidor");
    } finally {
      setIsLoading(false);
    }
  };

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
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, px: 4 }}>
        <Button
          component={Link}
          to="/superadmin"
          variant="outlined"
          sx={{
            backgroundColor: "#1976d2",
            color: "#fff",
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontFamily: "Tektur, sans-serif",
            fontWeight: 600,
            letterSpacing: 2,
            fontSize: 18,
            textTransform: "none",
            "&:hover": { backgroundColor: "#115293" },
          }}
        >
          Volver
        </Button>
      </Box>

      {/* Contenido principal */}
      <Container
        maxWidth="md"
        sx={{
          mt: 8,
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

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 3 }}>
              {error}
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
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Nombre y Apellido"
                id="username"
                {...register("username")}
                error={!!errors.username}
                helperText={errors.username?.message}
                disabled={isLoading}
              />
              <TextField
                fullWidth
                label="Fecha de Nacimiento"
                id="fechaNacimiento"
                type="date"
                {...register("fechaNacimiento")}
                error={!!errors.fechaNacimiento}
                helperText={errors.fechaNacimiento?.message}
                disabled={isLoading}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                select
                fullWidth
                label="Tipo de Documento"
                id="tipoDocumento"
                {...register("tipoDocumento")}
                error={!!errors.tipoDocumento}
                helperText={errors.tipoDocumento?.message}
                disabled={isLoading}
              >
                <MenuItem value="">Seleccione...</MenuItem>
                <MenuItem value="DNI">DNI</MenuItem>
                <MenuItem value="Pasaporte">Pasaporte</MenuItem>
                <MenuItem value="LC">LC</MenuItem>
                <MenuItem value="LE">LE</MenuItem>
                <MenuItem value="Otro">Otro</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="Número de Documento"
                id="numeroDocumento"
                {...register("numeroDocumento")}
                error={!!errors.numeroDocumento}
                helperText={errors.numeroDocumento?.message}
                disabled={isLoading}
              />
              <TextField
                fullWidth
                label="Email"
                id="email"
                type="email"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isLoading}
              />
              <TextField
                fullWidth
                label="Teléfono"
                id="telefono"
                {...register("telefono")}
                error={!!errors.telefono}
                helperText={errors.telefono?.message}
                disabled={isLoading}
              />
              <TextField
                fullWidth
                label="Domicilio"
                id="domicilio"
                {...register("domicilio")}
                error={!!errors.domicilio}
                helperText={errors.domicilio?.message}
                disabled={isLoading}
              />
              <TextField
                select
                fullWidth
                label="Estado Civil"
                id="estadoCivil"
                {...register("estadoCivil")}
                error={!!errors.estadoCivil}
                helperText={errors.estadoCivil?.message}
                disabled={isLoading}
              >
                <MenuItem value="">Seleccione...</MenuItem>
                <MenuItem value="Soltero/a">Soltero/a</MenuItem>
                <MenuItem value="Casado/a">Casado/a</MenuItem>
                <MenuItem value="Divorciado/a">Divorciado/a</MenuItem>
                <MenuItem value="Viudo/a">Viudo/a</MenuItem>
                <MenuItem value="Otro">Otro</MenuItem>
              </TextField>
            </Box>
            {/* Columna 2 */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Contraseña"
                id="password"
                type="password"
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isLoading}
              />
              <TextField
                select
                fullWidth
                label="Rol"
                id="roleId"
                {...register("roleId")}
                error={!!errors.roleId}
                helperText={errors.roleId?.message}
                disabled={isLoading}
              >
                <MenuItem value="1">Superadmin</MenuItem>
                <MenuItem value="2">RRHH</MenuItem>
                <MenuItem value="3">Contador</MenuItem>
                <MenuItem value="4">Empleado</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="Área"
                id="area"
                {...register("area")}
                error={!!errors.area}
                helperText={errors.area?.message}
                disabled={isLoading}
              />
              <TextField
                fullWidth
                label="Cargo"
                id="cargo"
                {...register("cargo")}
                error={!!errors.cargo}
                helperText={errors.cargo?.message}
                disabled={isLoading}
              />
              <TextField
                fullWidth
                label="Fecha de Contrato"
                id="fechaContrato"
                type="date"
                {...register("fechaContrato")}
                error={!!errors.fechaContrato}
                helperText={errors.fechaContrato?.message}
                disabled={isLoading}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Legajo"
                id="legajo"
                {...register("legajo")}
                error={!!errors.legajo}
                helperText={errors.legajo?.message}
                disabled={isLoading}
              />
            </Box>
          </Box>

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

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default AltaNuevo;
