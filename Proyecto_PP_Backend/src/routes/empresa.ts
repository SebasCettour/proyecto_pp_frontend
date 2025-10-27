import { Router } from "express";
import { pool } from "../models/db.js";

const router = Router();

// 📌 Obtener todas las empresas
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Empresa");
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    res.status(500).json({ message: "Error al obtener empresas" });
  }
});

// 📌 Buscar una empresa por nombre
router.get("/buscar/:nombre", async (req, res) => {
  try {
    const { nombre } = req.params;
    const [rows]: any = await pool.query(
      "SELECT * FROM Empresa WHERE Nombre_Empresa = ?",
      [nombre]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Empresa no encontrada" });

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al buscar empresa:", error);
    res.status(500).json({ message: "Error al buscar empresa" });
  }
});

export default router;
