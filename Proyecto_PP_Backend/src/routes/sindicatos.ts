import { Router, Request, Response } from "express";
import { pool } from "../models/db.js";
const router = Router();

// GET /api/sindicatos
router.get("/", async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT ID_Sindicato as id, Nombre_Sindicato as nombre FROM Sindicato");
    res.json(rows);
  } catch (err) {
    console.error("Error en /api/sindicatos:", err);
    res.status(500).json({ error: "Error al obtener sindicatos" });
  }
});

export default router;
