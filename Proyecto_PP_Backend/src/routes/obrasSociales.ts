import { Router, Request, Response } from "express";
import { pool } from "../models/db.js";

const router = Router();

// GET /api/obras-sociales
router.get("/", async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT ID_ObraSocial as id, Nombre as nombre FROM ObraSocial");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener obras sociales" });
  }
});

export default router;
