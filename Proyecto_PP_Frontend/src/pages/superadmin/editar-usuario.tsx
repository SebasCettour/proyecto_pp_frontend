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
import { Link as RouterLink } from "react-router-dom";

type ObraSocial = { id: string; nombre: string };
type Sindicato = { id: string; nombre: string };
type Convenio = { id: number; nombre: string };
type Categoria = { Id_Categoria: number; Nombre_Categoria: string };

const schema = z.object({
	Nombre: z.string().min(2).max(100),
	Apellido: z.string().min(2).max(100),
	Area: z.string().min(2).max(50),
	Categoria: z.string().min(1),
	Correo_Electronico: z.string().email().max(100),
	Domicilio: z.string().min(10).max(150),
	Estado_Civil: z.string().min(1),
	Fecha_Desde: z.string().min(1),
	Fecha_Nacimiento: z.string().min(1),
	Legajo: z.string().max(20),
	Telefono: z.string().min(8).max(20).regex(/^[0-9+\-\s()]+$/),
	Tipo_Documento: z.string().min(1),
	Numero_Documento: z.string().min(7).max(20).regex(/^[0-9]+$/),
	Id_Departamento: z.string().min(1),
	Id_Cargo: z.string().min(1),
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

const EditarUsuario: React.FC = () => {
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([]);
	const [sindicatos, setSindicatos] = useState<Sindicato[]>([]);
	const [convenios, setConvenios] = useState<Convenio[]>([]);
	const [categorias, setCategorias] = useState<Categoria[]>([]);
	const [loadingObras, setLoadingObras] = useState(false);
	const [loadingSindicatos, setLoadingSindicatos] = useState(false);
	const [loadingCategorias, setLoadingCategorias] = useState(false);
	const [usuarioDni, setUsuarioDni] = useState<string | null>(null);

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
			Area: "",
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
			Id_Departamento: "",
			Id_Cargo: "",
			Id_Sindicato: "",
			Id_ObraSocial: "",
			id_convenio: "",
			familiares: [],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "familiares",
	});

	const tipoDocumentoValue = watch("tipoDocumento");
	const convenioValue = watch("convenioId");
	const numeroMaxLength = tipoDocumentoValue === "Pasaporte" ? 10 : 9;

	useEffect(() => {
		setLoadingObras(true);
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
			.catch(() => setObrasSociales([{ id: "1", nombre: "OSECAC" }]))
			.finally(() => setLoadingObras(false));
	}, []);

	useEffect(() => {
		setLoadingSindicatos(true);
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
			)
			.finally(() => setLoadingSindicatos(false));
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

	// Buscar usuario por DNI (puedes adaptar esta función a tu backend)
	const handleBuscar = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccess(null);
		setIsLoading(true);
		setUsuarioDni(null);
		try {
			const dni = watch("Numero_Documento");
			const response = await fetch(`http://localhost:4000/api/usuario/usuario-dni/${dni}`);
			if (!response.ok) throw new Error("Usuario no encontrado");
			const user = await response.json();
			setUsuarioDni(dni);
			reset({
				Nombre: user.Nombre || "",
				Apellido: user.Apellido || "",
				Area: user.Area || "",
				Categoria: String(user.Categoria || ""),
				Correo_Electronico: user.Correo_Electronico || "",
				Domicilio: user.Domicilio || "",
				Estado_Civil: user.Estado_Civil || "",
				Fecha_Desde: user.Fecha_Desde || "",
				Fecha_Nacimiento: user.Fecha_Nacimiento || "",
				Legajo: user.Legajo || "",
				Telefono: user.Telefono || "",
				Tipo_Documento: user.Tipo_Documento || "",
				Numero_Documento: user.Numero_Documento || "",
				Id_Departamento: String(user.Id_Departamento || ""),
				Id_Cargo: String(user.Id_Cargo || ""),
				Id_Sindicato: String(user.Id_Sindicato || ""),
				Id_ObraSocial: String(user.Id_ObraSocial || ""),
				id_convenio: String(user.id_convenio || ""),
				familiares: Array.isArray(user.familiares)
					? user.familiares.map((f: any) => ({
						nombreFamiliar: f.nombreFamiliar || f.Nombre || "",
						parentesco: f.parentesco || f.Parentesco || "",
						fechaNacimientoFamiliar: f.fechaNacimientoFamiliar || f.Fecha_Nacimiento || "",
						tipoDocumentoFamiliar: f.tipoDocumentoFamiliar || f.Tipo_Documento || "",
						numeroDocumentoFamiliar: f.numeroDocumentoFamiliar || f.Numero_Documento || "",
					}))
					: [],
			});
			setSuccess("Usuario cargado correctamente");
		} catch (err: any) {
			setError(err.message || "Error al buscar usuario");
		} finally {
			setIsLoading(false);
		}
	};

	const onSubmit = async (data: FormData) => {
		setError(null);
		setSuccess(null);
		setIsLoading(true);
		try {
			// Convertir los campos numéricos
			const payload = {
				...data,
				Categoria: Number(data.Categoria),
				Id_Departamento: Number(data.Id_Departamento),
				Id_Cargo: Number(data.Id_Cargo),
				Id_Sindicato: Number(data.Id_Sindicato),
				Id_ObraSocial: Number(data.Id_ObraSocial),
				id_convenio: Number(data.id_convenio),
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
				setError(result.error || "Error al editar usuario");
				return;
			}
			setSuccess("Usuario editado exitosamente");
		} catch (err) {
			setError("Error de conexión. Verifique el servidor.");
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
				<Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, px: 4 }}>
					<Button
						component={RouterLink}
						to="/superadmin"
						variant="outlined"
						sx={{
							backgroundColor: "#1565C0",
							color: "#fff",
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

				<Container maxWidth="lg">
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
						{/* Formulario de búsqueda por DNI */}
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
								Buscar por DNI
							</Typography>
							<TextField
								fullWidth
								label="DNI"
								{...register("numeroDocumento")}
								error={!!errors.numeroDocumento}
								helperText={errors.numeroDocumento?.message}
								disabled={isLoading}
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
						</form>

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

								<Typography variant="h4" textAlign="center" fontWeight={600} mb={3}>
									Editar Usuario
								</Typography>

								<Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
									{/* Columna Izquierda */}
									<Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
										<TextField
											fullWidth
											label="Nombre y Apellido"
											{...register("username")}
											error={!!errors.username}
											helperText={errors.username?.message}
											disabled={isLoading}
											autoComplete="off"
										/>
										<TextField
											fullWidth
											label="Email"
											{...register("email")}
											error={!!errors.email}
											helperText={errors.email?.message}
											disabled={isLoading}
										/>
										<TextField
											fullWidth
											label="Domicilio"
											{...register("domicilio")}
											error={!!errors.domicilio}
											helperText={errors.domicilio?.message}
											disabled={isLoading}
										/>
										<TextField
											fullWidth
											label="Teléfono"
											{...register("telefono")}
											error={!!errors.telefono}
											helperText={errors.telefono?.message}
											disabled={isLoading}
										/>
										<Controller
											name="fechaNacimiento"
											control={control}
											render={({ field }) => (
												<DatePicker
													label="Fecha de Nacimiento"
													format="DD-MM-YYYY"
													maxDate={dayjs().subtract(18, "year")}
													minDate={dayjs().subtract(70, "year")}
													value={field.value ? dayjs(field.value) : null}
													onChange={(date) => field.onChange(date?.format("YYYY-MM-DD") || "")}
													slotProps={{
														textField: {
															fullWidth: true,
															error: !!errors.fechaNacimiento,
															helperText: errors.fechaNacimiento?.message,
															disabled: isLoading,
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
												<TextField
													fullWidth
													label="Legajo"
													{...register("Legajo")}
													error={!!errors.Legajo}
													helperText={errors.Legajo?.message}
													disabled
												/>
											helperText={errors.numeroDocumento?.message}
											inputProps={{ maxLength: numeroMaxLength }}
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
													<MenuItem value="En unión convivencial">En unión convivencial</MenuItem>
												</TextField>
											)}
										/>
									</Box>
									{/* Columna Derecha */}
									<Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
										<Controller
											name="roleId"
											control={control}
											render={({ field }) => (
												<TextField
													select
													fullWidth
													label="Rol"
													{...field}
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
										<Controller
											name="convenioId"
											control={control}
											render={({ field }) => (
												<TextField
													select
													fullWidth
													label="Convenio"
													value={field.value || ""}
													onChange={(e) => field.onChange(String(e.target.value))}
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
											name="categoriaId"
											control={control}
											render={({ field }) => (
												<TextField
													select
													fullWidth
													label="Categoría"
													{...field}
													disabled={isLoading || !convenioValue}
												>
													{loadingCategorias
														? [
																<MenuItem disabled key="loading-categoria">
																	<CircularProgress size={20} />
																</MenuItem>,
															]
														: [
																<MenuItem value="" disabled key="empty-categoria">
																	Seleccione categoría...
																</MenuItem>,
																...categorias.map((c) => (
																	<MenuItem key={c.Id_Categoria} value={String(c.Id_Categoria)}>
																		{c.Nombre_Categoria}
																	</MenuItem>
																)),
															]}
												</TextField>
											)}
										/>
										<Controller
											name="fechaContrato"
											control={control}
											render={({ field }) => (
												<DatePicker
													label="Fecha de Contrato"
													format="DD-MM-YYYY"
													maxDate={dayjs()}
													value={field.value ? dayjs(field.value) : null}
													onChange={(date) => field.onChange(date?.format("YYYY-MM-DD") || "")}
													slotProps={{
														textField: {
															fullWidth: true,
															error: !!errors.fechaContrato,
															helperText: errors.fechaContrato?.message,
															disabled: isLoading,
														},
													}}
												/>
											)}
										/>
										<Controller
											name="obraSocialId"
											control={control}
											render={({ field }) => (
												<TextField
													select
													fullWidth
													label="Obra Social"
													{...field}
													error={!!errors.obraSocialId}
													helperText={errors.obraSocialId?.message}
													disabled={isLoading}
												>
													{loadingObras ? (
														<MenuItem disabled>
															<CircularProgress size={20} />
														</MenuItem>
													) : (
														obrasSociales.map((os) => (
															<MenuItem key={os.id} value={os.id}>
																{os.nombre}
															</MenuItem>
														))
													)}
												</TextField>
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
													error={!!errors.sindicatoId}
													helperText={errors.sindicatoId?.message}
													disabled={isLoading}
												>
													{loadingSindicatos
														? [
																<MenuItem disabled key="loading-sindicato">
																	<CircularProgress size={20} />
																</MenuItem>,
															]
														: [
																<MenuItem value="" disabled key="empty-sindicato">
																	Seleccione sindicato...
																</MenuItem>,
																...sindicatos.map((s) => (
																	<MenuItem key={s.id} value={s.id}>
																		{s.nombre}
																	</MenuItem>
																)),
															]}
												</TextField>
											)}
										/>
									</Box>
								</Box>

								{/* Familiares */}
								<Box mt={6} sx={{ background: "rgba(245, 247, 250, 0.85)", borderRadius: 3, px: { xs: 2, sm: 4 }, py: { xs: 3, sm: 4 } }}>
									<Typography variant="h5" mb={3} fontWeight={600} color="#1565C0" sx={{ letterSpacing: 1 }}>
										Grupo Familiar
									</Typography>
									{fields.map((item, index) => (
										<Card key={item.id} variant="outlined" sx={{ mb: 3, p: 2 }}>
											<CardContent sx={{ p: 0 }}>
												<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
													<TextField
														label="Nombre Familiar"
														{...register(`familiares.${index}.nombreFamiliar`)}
														error={!!errors.familiares?.[index]?.nombreFamiliar}
														helperText={errors.familiares?.[index]?.nombreFamiliar?.message}
													/>
													<TextField
														label="Parentesco"
														{...register(`familiares.${index}.parentesco`)}
														error={!!errors.familiares?.[index]?.parentesco}
														helperText={errors.familiares?.[index]?.parentesco?.message}
													/>
													<Controller
														name={`familiares.${index}.fechaNacimientoFamiliar`}
														control={control}
														render={({ field }) => (
															<DatePicker
																label="Fecha de Nacimiento"
																format="DD-MM-YYYY"
																maxDate={dayjs()}
																value={field.value ? dayjs(field.value) : null}
																onChange={(date) => field.onChange(date?.format("YYYY-MM-DD") || "")}
																slotProps={{
																	textField: {
																		error: !!errors.familiares?.[index]?.fechaNacimientoFamiliar,
																		helperText: errors.familiares?.[index]?.fechaNacimientoFamiliar?.message,
																	},
																}}
															/>
														)}
													/>
													<TextField
														label="Tipo Documento"
														{...register(`familiares.${index}.tipoDocumentoFamiliar`)}
														error={!!errors.familiares?.[index]?.tipoDocumentoFamiliar}
														helperText={errors.familiares?.[index]?.tipoDocumentoFamiliar?.message}
													/>
													<TextField
														label="Número Documento"
														{...register(`familiares.${index}.numeroDocumentoFamiliar`)}
														error={!!errors.familiares?.[index]?.numeroDocumentoFamiliar}
														helperText={errors.familiares?.[index]?.numeroDocumentoFamiliar?.message}
													/>
													<IconButton color="error" onClick={() => remove(index)}>
														<DeleteIcon />
													</IconButton>
												</Box>
											</CardContent>
										</Card>
									))}
									<Button variant="outlined" startIcon={<AddIcon />} onClick={agregarFamiliar}>
										Agregar Familiar
									</Button>
								</Box>

								<Button
									type="submit"
									variant="contained"
									fullWidth
									sx={{ mt: 4 }}
									disabled={isLoading}
								>
									{isLoading ? <CircularProgress size={24} color="inherit" /> : "Guardar Cambios"}
								</Button>
							</form>
						)}
					</Box>
				</Container>
				<Footer />
			</Box>
		</LocalizationProvider>
	);
};

export default EditarUsuario;
