import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { Grid } from "@mui/material";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { API_BASE_URL } from "../../config/api";
import { Categoria, Convenio } from "../../types";

const ActualizarSalario = () => {
  // No se usa useNavigate, se usará Link
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [convenioSeleccionado, setConvenioSeleccionado] = useState<number | "">(
    ""
  );
  const [porcentaje, setPorcentaje] = useState<string>("");
  const [fecha, setFecha] = useState<string>("");
  const [porcentajeError, setPorcentajeError] = useState<string>("");
  const [fechaError, setFechaError] = useState<string>("");

  // Obtener la fecha actual en formato yyyy-mm-dd
  const today = new Date().toISOString().split('T')[0];
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [inputs, setInputs] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/convenios`)
      .then((res) => res.json())
      .then((data) => setConvenios(data));
  }, []);

  useEffect(() => {
    if (convenioSeleccionado) {
      fetch(
        `${API_BASE_URL}/api/categorias?convenio=${convenioSeleccionado}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setCategorias(data);
            // Limpiar todos los inputs de nuevo sueldo al recargar categorías
            const initialInputs: { [key: number]: string } = {};
            data.forEach((cat: Categoria) => {
              initialInputs[cat.Id_Categoria] = "";
            });
            setInputs(initialInputs);
          } else {
            setCategorias([]);
            setInputs({});
          }
        });
    } else {
      setCategorias([]);
      setInputs({});
    }
  }, [convenioSeleccionado]);

  const handleInputChange = (id: number, value: string) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleActualizarGeneral = async () => {
    if (!convenioSeleccionado || !porcentaje) return;
    setLoading(true);
    await fetch(`${API_BASE_URL}/api/categorias/actualizar-general`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idConvenio: convenioSeleccionado,
        porcentaje: parseFloat(porcentaje),
      }),
    });
    setPorcentaje("");
    setLoading(false);
    // Refrescar categorías
    fetch(
      `${API_BASE_URL}/api/categorias?convenio=${convenioSeleccionado}`
    )
      .then((res) => res.json())
      .then((data) => setCategorias(data));
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
      <Container
        maxWidth="md"
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
        {/* Botón Volver */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2, mb: 1, pr: 0.5 }}>
          <Button
            component={Link}
            to="/contadores"
            variant="outlined"
            sx={{
              backgroundColor: "#1565C0",
              color: "#ffffff",
              width: 180,
              letterSpacing: 3,
              fontSize: 20,
              borderRadius: 3,
              mr: 0,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 500,
              textTransform: "none",
              boxShadow: '0 2px 8px rgba(21,101,192,0.08)'
            }}
          >
            Volver
          </Button>
        </Box>
        <Box
          sx={{
            backgroundColor: "#fff",
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
            p: 5,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 3,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 700,
              color: "#1565C0",
              textAlign: "center",
              letterSpacing: 1,
              textShadow: "0 2px 8px rgba(21,101,192,0.08)",
            }}
          >
            Actualización salarial
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2} width="100%" justifyContent="center" alignItems="center">
            <Box flex="1 1 250px" minWidth={200}>
              <FormControl fullWidth>
                <InputLabel id="convenio-label">Convenio</InputLabel>
                <Select
                  labelId="convenio-label"
                  value={convenioSeleccionado}
                  label="Convenio"
                  onChange={(e) => setConvenioSeleccionado(e.target.value as number)}
                  fullWidth
                  sx={{ minWidth: 260, fontSize: 18 }}
                >
                  <MenuItem value="" disabled>
                    <em>Seleccionar Convenio</em>
                  </MenuItem>
                  {convenios.map((c) => (
                    <MenuItem key={c.id} value={c.id} sx={{ fontSize: 18 }}>
                      {c.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box flex="1 1 180px" minWidth={150}>
              <TextField
                label="Ingrese porcentaje de aumento"
                type="number"
                value={porcentaje}
                onChange={(e) => {
                  const value = e.target.value;
                  setPorcentaje(value);
                  if (parseFloat(value) > 100) {
                    setPorcentajeError("El porcentaje no puede ser mayor a 100");
                  } else {
                    setPorcentajeError("");
                  }
                }}
                fullWidth
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                error={!!porcentajeError}
                helperText={porcentajeError}
              />
            </Box>
            <Box flex="1 1 180px" minWidth={150}>
              <TextField
                label="Fecha"
                type="date"
                value={fecha}
                onChange={(e) => {
                  const value = e.target.value;
                  setFecha(value);
                  if (value > today) {
                    setFechaError("La fecha no puede ser posterior a hoy");
                  } else {
                    setFechaError("");
                  }
                }}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: today }}
                error={!!fechaError}
                helperText={fechaError}
              />
            </Box>
            <Box flex="1 1 150px" minWidth={120} display="flex" alignItems="center">
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleActualizarGeneral}
                disabled={!convenioSeleccionado || !porcentaje || loading || !!porcentajeError || !!fechaError || !fecha}
              >
                Actualización general
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Tabla de actualización individual */}
        <Box
          sx={{
            backgroundColor: "#fff",
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
            p: 5,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            mt: 5,
          }}
        >
          <Typography
            component="h2"
            variant="h5"
            sx={{
              mb: 3,
              fontFamily: "Tektur, sans-serif",
              fontWeight: 700,
              color: "#1565C0",
              textAlign: "center",
            }}
          >
            Actualización individual de sueldos
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>Categoría</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Último Sueldo Básico</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Actual Sueldo Básico</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Fecha Actualización</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Nuevo Sueldo</b>
                  </TableCell>
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(categorias) && categorias.map((cat) => (
                  <TableRow key={cat.Id_Categoria}>
                    <TableCell>{cat.Nombre_Categoria}</TableCell>
                    <TableCell align="center">
                      {cat.Ultimo_Sueldo_Basico !== null && cat.Ultimo_Sueldo_Basico !== undefined
                        ? `$${Number(cat.Ultimo_Sueldo_Basico).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
                        : "-"}
                    </TableCell>
                    <TableCell align="center">
                      {cat.Sueldo_Basico !== null && cat.Sueldo_Basico !== undefined
                        ? `$${Number(cat.Sueldo_Basico).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
                        : "-"}
                    </TableCell>
                    <TableCell align="center">
                      {cat.Fecha_Actualizacion
                        ? new Date(cat.Fecha_Actualizacion).toLocaleDateString("es-AR")
                        : "-"}
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        size="small"
                        type="number"
                        value={inputs[cat.Id_Categoria] || ""}
                        onChange={(e) =>
                          handleInputChange(cat.Id_Categoria, e.target.value)
                        }
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={loading || !inputs[cat.Id_Categoria] || isNaN(Number(inputs[cat.Id_Categoria]))}
                        onClick={async () => {
                          setLoading(true);
                          // Limpiar el input de nuevo sueldo inmediatamente
                          setInputs((prev) => ({ ...prev, [cat.Id_Categoria]: "" }));
                          await fetch(`${API_BASE_URL}/api/categorias/${cat.Id_Categoria}/actualizar-sueldo`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ nuevoSueldo: parseFloat(inputs[cat.Id_Categoria]) })
                          });
                          setLoading(false);
                          // Refrescar categorías
                          if (convenioSeleccionado) {
                            fetch(`${API_BASE_URL}/api/categorias?convenio=${convenioSeleccionado}`)
                              .then((res) => res.json())
                              .then((data) => {
                                if (Array.isArray(data)) setCategorias(data);
                              });
                          }
                        }}
                      >
                        Actualizar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
};

export default ActualizarSalario;
