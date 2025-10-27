import express, { Request, Response } from "express";
import { pool as db } from "../models/db.js";

const router = express.Router();

// GET /api/cargos - Devuelve todos los cargos disponibles
router.get("/", async (_req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query("SELECT Id_Cargo, Nombre_Cargo FROM Cargo");
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener cargos:", err);
    res.status(500).json({ error: "Error al obtener cargos" });
  }
});

export default router;
