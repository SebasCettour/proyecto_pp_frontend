import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";
import { API_BASE_URL } from "../../config/api";

interface CategoriaOption {
  Id_Categoria: number;
  Nombre_Categoria: string;
}

interface HistoricoBasico {
  Id_Historico: number;
  Id_Categoria: number;
  Nombre_Categoria: string;
  Sueldo_Anterior: number;
  Sueldo_Nuevo: number;
  Tipo_Actualizacion: "general" | "individual" | "reinicio";
  Porcentaje_Aplicado?: number | null;
  Fecha_Efectiva: string;
  Fecha_Registro: string;
  Id_Usuario?: number | null;
  Nombre_Usuario?: string | null;
  Observacion?: string | null;
}

const HistorialSalarios: React.FC = () => {
  const [categorias, setCategorias] = useState<CategoriaOption[]>([]);
  const [categoriaId, setCategoriaId] = useState<string>("");
  const [desde, setDesde] = useState<string>("");
  const [hasta, setHasta] = useState<string>("");
  const [historial, setHistorial] = useState<HistoricoBasico[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [error, setError] = useState("");

  const formatFecha = (value?: string) => {
    if (!value) return "-";

    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      return new Date(year, month - 1, day).toLocaleDateString("es-AR");
    }

    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString("es-AR");
  };

  useEffect(() => {
    const fetchCategorias = async () => {
      setLoadingCategorias(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/categorias`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error("No se pudieron cargar las categorías");
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setCategorias(data);
        } else {
          setCategorias([]);
        }
      } catch (err) {
        setError("Error al cargar categorías");
      } finally {
        setLoadingCategorias(false);
      }
    };

    fetchCategorias();
  }, []);

  const handleConsultar = async () => {
    setError("");
    setLoadingHistorial(true);
    setHistorial([]);

    if (desde && hasta && desde > hasta) {
      setError("La fecha desde no puede ser mayor a la fecha hasta");
      setLoadingHistorial(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (categoriaId) params.append("categoriaId", categoriaId);
      if (desde) params.append("desde", desde);
      if (hasta) params.append("hasta", hasta);

      const response = await fetch(
        `${API_BASE_URL}/api/categorias/basicos-historicos?${params.toString()}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo obtener el historial");
      }

      const data = await response.json();
      setHistorial(Array.isArray(data) ? data : []);
      if (!Array.isArray(data) || data.length === 0) {
        setError("No se encontraron movimientos para los filtros seleccionados");
      }
    } catch (err: any) {
      setError(err?.message || "Error al consultar historial");
    } finally {
      setLoadingHistorial(false);
    }
  };

  const escapeCsv = (value: string | number | null | undefined) => {
    const stringValue = value === null || value === undefined ? "" : String(value);
    const escaped = stringValue.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const handleExportarCsv = () => {
    if (!historial.length) return;

    const headers = [
      "Categoria",
      "Sueldo_Anterior",
      "Sueldo_Nuevo",
      "Tipo_Actualizacion",
      "Porcentaje_Aplicado",
      "Fecha_Efectiva",
      "Usuario",
    ];

    const rows = historial.map((item) => [
      item.Nombre_Categoria || "",
      Number(item.Sueldo_Anterior || 0).toFixed(2),
      Number(item.Sueldo_Nuevo || 0).toFixed(2),
      item.Tipo_Actualizacion || "",
      item.Porcentaje_Aplicado !== null && item.Porcentaje_Aplicado !== undefined
        ? Number(item.Porcentaje_Aplicado).toFixed(2)
        : "",
      formatFecha(item.Fecha_Efectiva),
      item.Nombre_Usuario || "",
    ]);

    const csvBody = [headers, ...rows]
      .map((row) => row.map((cell) => escapeCsv(cell)).join(";"))
      .join("\r\n");

    const csv = `sep=;\r\n${csvBody}`;

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const fechaArchivo = new Date().toISOString().slice(0, 10);
    const link = document.createElement("a");
    link.href = url;
    link.download = `historial_salarios_${fechaArchivo}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      }}
    >
      <Header />
      <BackButton to="/historiales" />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 6, flexGrow: 1 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography
            variant="h4"
            sx={{
              mb: 4,
              fontWeight: 700,
              color: "#1565C0",
              textAlign: "center",
            }}
          >
            Historial de Salarios
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr auto auto" },
              gap: 2,
              alignItems: "center",
              mb: 3,
            }}
          >
            <FormControl fullWidth disabled={loadingCategorias}>
              <InputLabel id="categoria-salario-label">Categoría</InputLabel>
              <Select
                labelId="categoria-salario-label"
                value={categoriaId}
                label="Categoría"
                onChange={(e) => setCategoriaId(e.target.value)}
              >
                <MenuItem value="">Todas las categorías</MenuItem>
                {categorias.map((cat) => (
                  <MenuItem key={cat.Id_Categoria} value={String(cat.Id_Categoria)}>
                    {cat.Nombre_Categoria}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Fecha desde"
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Fecha hasta"
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleConsultar}
              disabled={loadingHistorial || loadingCategorias}
              sx={{ height: 56, minWidth: 140 }}
            >
              {loadingHistorial ? <CircularProgress size={22} color="inherit" /> : "Consultar"}
            </Button>

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportarCsv}
              disabled={loadingHistorial || historial.length === 0}
              sx={{ height: 56, minWidth: 150 }}
            >
              Exportar CSV
            </Button>
          </Box>

          {error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {historial.length > 0 && (
            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
              <Table>
                <TableHead sx={{ backgroundColor: "#1565C0" }}>
                  <TableRow>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Categoría</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }} align="right">Sueldo Anterior</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }} align="right">Sueldo Nuevo</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Tipo</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }} align="right">% Aplicado</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Fecha Efectiva</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Usuario</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historial.map((item) => (
                    <TableRow key={item.Id_Historico} hover>
                      <TableCell>{item.Nombre_Categoria}</TableCell>
                      <TableCell align="right">
                        {`$ ${Number(item.Sueldo_Anterior || 0).toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`}
                      </TableCell>
                      <TableCell align="right">
                        {`$ ${Number(item.Sueldo_Nuevo || 0).toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`}
                      </TableCell>
                      <TableCell>{item.Tipo_Actualizacion}</TableCell>
                      <TableCell align="right">
                        {item.Porcentaje_Aplicado !== null && item.Porcentaje_Aplicado !== undefined
                          ? `${Number(item.Porcentaje_Aplicado).toLocaleString("es-AR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}%`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {formatFecha(item.Fecha_Efectiva)}
                      </TableCell>
                      <TableCell>{item.Nombre_Usuario || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
};

export default HistorialSalarios;