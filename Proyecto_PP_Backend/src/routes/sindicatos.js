import { Router } from "express";
import db from "../models/db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT ID_Sindicato as id, Nombre as nombre FROM Sindicato");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener sindicatos" });
  }
});

export default router;
