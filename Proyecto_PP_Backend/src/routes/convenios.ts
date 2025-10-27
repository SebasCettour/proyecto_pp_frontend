import { Router, Request, Response } from "express";
import { pool } from "../models/db.js";

const router = Router();

// Obtener todos los convenios colectivos
router.get("/", async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      "SELECT id_convenio AS id, descripcion AS nombre FROM ConvenioColectivo"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener convenios colectivos:", err);
    res.status(500).json({ error: "Error al obtener convenios colectivos" });
  }
});

export default router;
