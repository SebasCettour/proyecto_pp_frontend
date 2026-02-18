import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
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
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { API_BASE_URL } from "../../config/api";
import { Categoria, Convenio } from "../../types";

const ActualizarSalario: React.FC = () => {
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [convenioSeleccionado, setConvenioSeleccionado] = useState<number | "">(
    "",
  );
  const [porcentaje, setPorcentaje] = useState<string>("");
  const [sumaFija, setSumaFija] = useState<string>("");
  const [sumaFijaError, setSumaFijaError] = useState<string>("");
  const [fecha, setFecha] = useState<string>("");
  const [porcentajeError, setPorcentajeError] = useState<string>("");
  const [fechaError, setFechaError] = useState<string>("");
  const today = new Date().toISOString().split("T")[0];
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [inputs, setInputs] = useState<{ [key: number]: string }>({});
  const [sumaFijaInputs, setSumaFijaInputs] = useState<{
    [key: number]: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [openReset, setOpenReset] = useState(false);
  const [resetId, setResetId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/convenios`)
      .then((res) => res.json())
      .then((data) => setConvenios(data));
  }, []);

  useEffect(() => {
    if (convenioSeleccionado) {
      fetch(`${API_BASE_URL}/api/categorias?convenio=${convenioSeleccionado}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setCategorias(data);
            const initialInputs: { [key: number]: string } = {};
            const initialSumaFija: { [key: number]: string } = {};
            data.forEach((cat: Categoria) => {
              initialInputs[cat.Id_Categoria] = "";
              initialSumaFija[cat.Id_Categoria] =
                cat.Suma_Fija_No_Remunerativa !== null &&
                cat.Suma_Fija_No_Remunerativa !== undefined
                  ? String(cat.Suma_Fija_No_Remunerativa)
                  : "";
            });
            setInputs(initialInputs);
            setSumaFijaInputs(initialSumaFija);
          } else {
            setCategorias([]);
            setInputs({});
            setSumaFijaInputs({});
          }
        });
    } else {
      setCategorias([]);
      setInputs({});
      setSumaFijaInputs({});
    }
  }, [convenioSeleccionado]);

  const handleInputChange = (id: number, value: string) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleActualizarGeneral = async () => {
    const token = localStorage.getItem("token");
    const porcentajeNumber = porcentaje !== "" ? Number(porcentaje) : null;
    const sumaFijaNumber = sumaFija !== "" ? Number(sumaFija) : null;

    const porcentajeValido =
      porcentajeNumber !== null && !isNaN(porcentajeNumber);
    const sumaFijaValida =
      sumaFijaNumber !== null && !isNaN(sumaFijaNumber);

    if (!convenioSeleccionado || (!porcentajeValido && !sumaFijaValida)) return;

    setLoading(true);

    const body: {
      idConvenio: number;
      porcentaje?: number;
      sumaFija?: number;
      fecha?: string;
    } = {
      idConvenio: convenioSeleccionado,
    };
    if (porcentajeValido) body.porcentaje = porcentajeNumber as number;
    if (sumaFijaValida) body.sumaFija = sumaFijaNumber as number;
    if (fecha) body.fecha = fecha;

    await fetch(`${API_BASE_URL}/api/categorias/actualizar-general`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    setPorcentaje("");
    setSumaFija("");
    setLoading(false);

    fetch(`${API_BASE_URL}/api/categorias?convenio=${convenioSeleccionado}`)
      .then((res) => res.json())
      .then((data) => setCategorias(data));
  };

  const handleOpenReset = (id: number) => {
    setResetId(id);
    setOpenReset(true);
  };

  const handleCloseReset = () => {
    setOpenReset(false);
    setResetId(null);
  };

  const handleConfirmReset = async () => {
    if (resetId == null) return;
    const token = localStorage.getItem("token");
    setOpenReset(false);
    setLoading(true);
    await fetch(`${API_BASE_URL}/api/categorias/${resetId}/actualizar-sueldo`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ nuevoSueldo: 0, fecha: fecha || today }),
    });
    setLoading(false);
    if (convenioSeleccionado) {
      fetch(`${API_BASE_URL}/api/categorias?convenio=${convenioSeleccionado}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setCategorias(data);
        });
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
      <Container
        maxWidth={false}
        sx={{
          mt: 8,
          mb: 8,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100vw",
          maxWidth: "1700px",
          px: 4,
        }}
      >
        {/* Botón Volver */}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            mt: 2,
            mb: 1,
            pr: 0.5,
          }}
        >
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
              boxShadow: "0 2px 8px rgba(21,101,192,0.08)",
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
            p: 4,
            width: "100%",
            maxWidth: "900px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
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
            Actualizaciones
          </Typography>
          <Box
            sx={{
              width: "100%",
              maxWidth: 760,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(260px, 1fr))",
              },
              gap: 2,
              mb: 2,
            }}
          >
            <FormControl fullWidth sx={{ width: "100%" }}>
              <InputLabel id="convenio-label">Convenio</InputLabel>
              <Select
                labelId="convenio-label"
                value={convenioSeleccionado}
                label="Convenio"
                onChange={(e) =>
                  setConvenioSeleccionado(e.target.value as number)
                }
                fullWidth
                sx={{ fontSize: 18 }}
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
            <TextField
              label="Aumento Salario Básico (%)"
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
              sx={{ width: "100%" }}
            />
            <TextField
              label="Suma Fija no Remunerativa"
              type="number"
              value={sumaFija}
              onChange={(e) => {
                const value = e.target.value;
                setSumaFija(value);
                if (parseFloat(value) < 0) {
                  setSumaFijaError("El monto no puede ser negativo");
                } else {
                  setSumaFijaError("");
                }
              }}
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
              error={!!sumaFijaError}
              helperText={sumaFijaError}
              sx={{ width: "100%" }}
            />
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
              sx={{ width: "100%" }}
            />
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: 760,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              sx={{
                width: "100%",
                maxWidth: 320,
                height: 56,
                fontSize: 18,
                fontWeight: 600,
              }}
              onClick={handleActualizarGeneral}
              disabled={
                !convenioSeleccionado ||
                loading ||
                !!porcentajeError ||
                !!sumaFijaError ||
                !!fechaError ||
                !fecha ||
                ((porcentaje ?? "") === "" && (sumaFija ?? "") === "")
              }
            >
              Actualización general
            </Button>
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
            maxWidth: "1600px",
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
          <TableContainer
            component={Paper}
            sx={{ width: "100%", maxWidth: "1550px", overflowX: "auto" }}
          >
            <Table sx={{ minWidth: 1500 }}>
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
                  <TableCell align="center">
                    <b>Suma Fija no Remunerativa</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Acción</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(categorias) &&
                  categorias.map((cat) => (
                    <TableRow key={cat.Id_Categoria}>
                      <TableCell>{cat.Nombre_Categoria}</TableCell>
                      <TableCell align="center">
                        {cat.Ultimo_Sueldo_Basico !== null &&
                        cat.Ultimo_Sueldo_Basico !== undefined
                          ? `$${Number(cat.Ultimo_Sueldo_Basico).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
                          : "-"}
                      </TableCell>
                      <TableCell align="center">
                        {cat.Sueldo_Basico !== null &&
                        cat.Sueldo_Basico !== undefined
                          ? `$${Number(cat.Sueldo_Basico).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
                          : "-"}
                      </TableCell>
                      <TableCell align="center">
                        {cat.Fecha_Actualizacion
                          ? new Date(
                              cat.Fecha_Actualizacion,
                            ).toLocaleDateString("es-AR")
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
                        <TextField
                          size="small"
                          type="number"
                          value={sumaFijaInputs[cat.Id_Categoria] ?? ""}
                          onChange={(e) =>
                            setSumaFijaInputs((prev) => ({
                              ...prev,
                              [cat.Id_Categoria]: e.target.value,
                            }))
                          }
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "center",
                          }}
                        >
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            sx={{
                              minWidth: 110,
                              fontWeight: 600,
                              fontSize: 15,
                            }}
                            disabled={
                              loading ||
                              ((inputs[cat.Id_Categoria] ?? "") === "" &&
                                (sumaFijaInputs[cat.Id_Categoria] ?? "") ===
                                  "") ||
                              ((inputs[cat.Id_Categoria] ?? "") !== "" &&
                                isNaN(Number(inputs[cat.Id_Categoria]))) ||
                              ((sumaFijaInputs[cat.Id_Categoria] ?? "") !==
                                "" &&
                                isNaN(Number(sumaFijaInputs[cat.Id_Categoria])))
                            }
                            onClick={async () => {
                              const token = localStorage.getItem("token");
                              const sueldoRaw = inputs[cat.Id_Categoria] ?? "";
                              const sumaRaw =
                                sumaFijaInputs[cat.Id_Categoria] ?? "";

                              const tieneSueldo = sueldoRaw !== "";
                              const tieneSuma = sumaRaw !== "";

                              if (!tieneSueldo && !tieneSuma) return;

                              const sueldoParsed = tieneSueldo
                                ? Number(sueldoRaw)
                                : null;
                              const sumaParsed = tieneSuma
                                ? Number(sumaRaw)
                                : null;

                              if (
                                tieneSueldo &&
                                (sueldoParsed === null || isNaN(sueldoParsed))
                              )
                                return;
                              if (
                                tieneSuma &&
                                (sumaParsed === null || isNaN(sumaParsed))
                              )
                                return;

                              setLoading(true);

                              if (tieneSueldo) {
                                await fetch(
                                  `${API_BASE_URL}/api/categorias/${cat.Id_Categoria}/actualizar-sueldo`,
                                  {
                                    method: "PUT",
                                    headers: {
                                      "Content-Type": "application/json",
                                      ...(token
                                        ? { Authorization: `Bearer ${token}` }
                                        : {}),
                                    },
                                    body: JSON.stringify({
                                      nuevoSueldo: sueldoParsed,
                                      fecha: fecha || today,
                                    }),
                                  },
                                );
                              }

                              if (tieneSuma) {
                                await fetch(
                                  `${API_BASE_URL}/api/categorias/${cat.Id_Categoria}/actualizar-suma-fija`,
                                  {
                                    method: "PUT",
                                    headers: {
                                      "Content-Type": "application/json",
                                      ...(token
                                        ? { Authorization: `Bearer ${token}` }
                                        : {}),
                                    },
                                    body: JSON.stringify({
                                      sumaFija: sumaParsed,
                                      fecha: fecha || today,
                                    }),
                                  },
                                );
                              }

                              setLoading(false);
                              setInputs((prev) => ({
                                ...prev,
                                [cat.Id_Categoria]: "",
                              }));

                              if (convenioSeleccionado) {
                                fetch(
                                  `${API_BASE_URL}/api/categorias?convenio=${convenioSeleccionado}`,
                                )
                                  .then((res) => res.json())
                                  .then((data) => {
                                    if (Array.isArray(data))
                                      setCategorias(data);
                                  });
                              }
                            }}
                          >
                            Actualizar
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            sx={{
                              minWidth: 110,
                              fontWeight: 600,
                              fontSize: 15,
                            }}
                            disabled={loading}
                            onClick={() => handleOpenReset(cat.Id_Categoria)}
                          >
                            Reiniciar
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                {/* Diálogo de confirmación para reiniciar sueldo */}
                <Dialog open={openReset} onClose={handleCloseReset}>
                  <DialogTitle>Reiniciar sueldo</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      ¿Estás seguro que deseas reiniciar el sueldo de esta
                      categoría a $0,00? Esta acción no se puede deshacer.
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseReset} color="primary">
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleConfirmReset}
                      color="error"
                      variant="contained"
                    >
                      Reiniciar
                    </Button>
                  </DialogActions>
                </Dialog>
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
