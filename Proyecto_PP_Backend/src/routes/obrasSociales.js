import { Router } from "express";
import db from "../models/db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT ID_ObraSocial as id, Nombre as nombre FROM ObraSocial");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener obras sociales" });
  }
});

export default router;
