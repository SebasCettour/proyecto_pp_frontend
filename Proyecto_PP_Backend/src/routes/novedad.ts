import { Router, Request, Response } from "express";
import { pool } from "../models/db.js";
import multer from "multer";
import fs from "fs";

const router = Router();

// Crear carpetas si no existen
const createUploadDirs = () => {
  const dirs = ["uploads/tablon_imgs"];
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Solo imágenes
    cb(null, "uploads/tablon_imgs/");
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Publicar una novedad
router.post(
  "/tablon",
  upload.fields([
    { name: "imagen", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    const { idEmpleado, descripcion } = req.body;

    let imagen = null;
    if (
      req.files &&
      (req.files as any).imagen &&
      (req.files as any).imagen[0]
    ) {
      imagen = (req.files as any).imagen[0].filename;
    }

    if (idEmpleado === undefined || descripcion === undefined) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    try {
      const fecha = new Date();
      const [result]: any = await pool.query(
        "INSERT INTO Novedad (Id_Empleado, Descripcion, Fecha, Imagen) VALUES (?, ?, ?, ?)",
        [idEmpleado, descripcion, fecha, imagen]
      );
      res.status(201).json({
        idNovedad: result.insertId,
        idEmpleado,
        descripcion,
        fecha,
        imagen,
      });
    } catch (err) {
      console.error("Error al publicar la novedad:", err);
      res.status(500).json({ error: "Error al publicar la novedad" });
    }
  }
);

// Obtener todas las novedades con nombre y apellido del empleado
router.get("/tablon", async (_req: Request, res: Response) => {
  try {
    const [novedades] = await pool.query(
      `SELECT 
        n.Id_Novedad, 
        n.Id_Empleado, 
        n.Descripcion, 
        n.Fecha, 
        n.Imagen,
        e.Nombre AS Nombre_Empleado,
        e.Apellido AS Apellido_Empleado
      FROM Novedad n
      JOIN Empleado e ON n.Id_Empleado = e.Id_Empleado
      ORDER BY n.Fecha DESC`
    );
    
    // Ensure we always return an array
    if (!Array.isArray(novedades)) {
      console.error("❌ Query result is not an array:", novedades);
      return res.json([]);
    }
    
    res.json(novedades);
  } catch (err) {
    console.error("❌ Error al obtener novedades:", err);
    res.status(500).json({ error: "Error al obtener novedades", details: err instanceof Error ? err.message : String(err) });
  }
});

// Eliminar una novedad por id
router.delete("/tablon/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM Novedad WHERE Id_Novedad = ?", [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar la novedad" });
  }
});

// Actualizar una novedad por id
router.put("/tablon/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { descripcion } = req.body;

  try {
    await pool.query(
      "UPDATE Novedad SET Descripcion = ? WHERE Id_Novedad = ?",
      [descripcion, id]
    );
    res.status(200).json({ message: "Novedad actualizada correctamente" });
  } catch (err) {
    console.error("Error al actualizar novedad:", err);
    res.status(500).json({ error: "Error al actualizar la novedad" });
  }
});

export default router;
