import dotenv from "dotenv";
dotenv.config();

console.log("🔧 Environment loaded:");
console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "LOADED" : "MISSING");
console.log("- JWT_SECRET value:", process.env.JWT_SECRET);
console.log("- DB_HOST:", process.env.DB_HOST);
console.log("- PORT:", process.env.PORT);

import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { pool } from "./models/db.js";

import authRoutes from "./routes/auth.js";
import conveniosRouter from "./routes/convenios.js";
import adminRoutes from "./routes/admin.js";
import cie10Routes from "./routes/cie10.js";
import novedadRouter from "./routes/novedad.js";
import usuarioRouter from "./routes/usuario.js";
import licenciasRoutes from "./routes/licencias.js";
import familiaresRouter from "./routes/familiares.js";
import categoriasRouter from "./routes/categorias.js";
import conceptosRoutes from "./routes/conceptos.js";

import obrasSocialesRoutes from "./routes/obrasSociales.js";
import sindicatosRoutes from "./routes/sindicatos.js";
import liquidacionRoutes from "./routes/liquidacion.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Configurar CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Rutas de la app
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/api/cie10", cie10Routes);
app.use("/api/novedad", novedadRouter);
app.use("/api/usuario", usuarioRouter);
app.use("/api/licencias", licenciasRoutes);
app.use("/api/familiares", familiaresRouter);
app.use("/api/convenios", conveniosRouter);
app.use("/api/conceptos", conceptosRoutes);

// Registrar obras sociales, sindicatos y cargos
app.use("/api/obras-sociales", obrasSocialesRoutes);
app.use("/api/sindicatos", sindicatosRoutes);
app.use("/api/liquidacion", liquidacionRoutes);

// Registrar categorías bajo /api/empleado/categorias
app.use("/api/empleado/categorias", categoriasRouter);
app.use("/api/categorias", categoriasRouter);

// 🔹 Ruta raíz
app.get("/", async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT 'Hola desde MySQL!' as msg");
    res.json(rows);
  } catch (err) {
    console.error("Error en la consulta a la base de datos:", err);
    res.status(500).json({ error: "Error de conexión a la DB" });
  }
});

// 🔹 Buscar empresa por nombre usando query param
app.get("/api/empresa/buscar", async (req: Request, res: Response) => {
  const nombre = req.query.nombre;
  if (!nombre || typeof nombre !== "string") {
    return res.status(400).json({ error: "Falta el parámetro 'nombre'" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM Empresa WHERE Nombre_Empresa LIKE ? LIMIT 10",
      [`%${nombre}%`]
    );
    if (Array.isArray(rows) && rows.length === 0) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }
    res.json(rows);
  } catch (err) {
    console.error("Error buscando empresa por nombre:", err);
    res.status(500).json({ error: "Error buscando empresa" });
  }
});

// Endpoint para buscar empresa por nombre (por parámetro en la URL, para Liquidacion.tsx)
app.get("/api/empresa/buscar/:nombre", async (req: Request, res: Response) => {
  const nombre = req.params.nombre;
  if (!nombre) {
    return res.status(400).json({ error: "Falta el parámetro 'nombre'" });
  }
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Empresa WHERE Nombre_Empresa LIKE ? LIMIT 1",
      [`%${nombre}%`]
    );
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error buscando empresa por nombre:", err);
    res.status(500).json({ error: "Error buscando empresa" });
  }
});

// Conexión a DB y arrancar servidor
pool
  .getConnection()
  .then((connection) => {
    console.log("Conexión a la base de datos establecida");
    connection.release();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error al conectar a la base de datos:", err);
    process.exit(1);
  });
