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

const isBadFieldError = (err: unknown): boolean => {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "ER_BAD_FIELD_ERROR"
  );
};

// Publicar una novedad
router.post(
  "/tablon",
  upload.fields([
    { name: "imagen", maxCount: 1 },
    { name: "archivo", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    const { idEmpleado, descripcion, fijada } = req.body;

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
      let result: any;
      try {
        const [insertResult]: any = await pool.query(
          "INSERT INTO Novedad (Id_Empleado, Descripcion, Fecha, Imagen, Fijada) VALUES (?, ?, NOW(), ?, ?)",
          [idEmpleado, descripcion, imagen, Number(fijada) ? 1 : 0]
        );
        result = insertResult;
      } catch (insertErr) {
        if (!isBadFieldError(insertErr)) {
          throw insertErr;
        }

        // Fallback para bases que todavia no tienen la columna Fijada.
        const [insertResult]: any = await pool.query(
          "INSERT INTO Novedad (Id_Empleado, Descripcion, Fecha, Imagen) VALUES (?, ?, NOW(), ?)",
          [idEmpleado, descripcion, imagen]
        );
        result = insertResult;
      }

      const [rows]: any = await pool.query(
        "SELECT Fecha FROM Novedad WHERE Id_Novedad = ?",
        [result.insertId]
      );

      const fecha = Array.isArray(rows) && rows[0]?.Fecha ? rows[0].Fecha : null;
      res.status(201).json({
        idNovedad: result.insertId,
        idEmpleado,
        descripcion,
        fecha,
        imagen,
        fijada: Number(fijada) ? 1 : 0,
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
    let novedades: any;
    try {
      const [rows] = await pool.query(
        `SELECT 
          n.Id_Novedad, 
          n.Id_Empleado, 
          n.Descripcion, 
          n.Fecha, 
          n.Imagen,
          n.Fijada,
          e.Nombre AS Nombre_Empleado,
          e.Apellido AS Apellido_Empleado
        FROM Novedad n
        JOIN Empleado e ON n.Id_Empleado = e.Id_Empleado
        ORDER BY n.Fijada DESC, n.Fecha DESC`
      );
      novedades = rows;
    } catch (listErr) {
      if (!isBadFieldError(listErr)) {
        throw listErr;
      }

      const [rows] = await pool.query(
        `SELECT 
          n.Id_Novedad, 
          n.Id_Empleado, 
          n.Descripcion, 
          n.Fecha, 
          n.Imagen,
          0 AS Fijada,
          e.Nombre AS Nombre_Empleado,
          e.Apellido AS Apellido_Empleado
        FROM Novedad n
        JOIN Empleado e ON n.Id_Empleado = e.Id_Empleado
        ORDER BY n.Fecha DESC`
      );
      novedades = rows;
    }
    
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

// Fijar o desfijar una novedad por id
router.put("/tablon/:id/fijada", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { fijada } = req.body;

  if (typeof fijada === "undefined") {
    return res.status(400).json({ error: "Falta el valor de fijada" });
  }

  try {
    await pool.query("UPDATE Novedad SET Fijada = ? WHERE Id_Novedad = ?", [
      Number(fijada) ? 1 : 0,
      id,
    ]);
    res.status(200).json({ message: "Estado de fijada actualizado correctamente" });
  } catch (err) {
    if (isBadFieldError(err)) {
      return res.status(400).json({
        error: "La base de datos no tiene la columna Fijada. Ejecuta la migracion add_fijada_novedad.sql",
      });
    }
    console.error("Error al actualizar estado fijada:", err);
    res.status(500).json({ error: "Error al actualizar estado fijada" });
  }
});

export default router;
