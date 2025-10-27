import { Router, Request, Response } from "express";
import { pool } from "../models/db.js";

const router = Router();

// GET /api/categorias/:idConvenio
router.get("/:idConvenio", async (req: Request, res: Response) => {
  const { idConvenio } = req.params;
  try {
    const [rows]: any = await pool.query(
      `SELECT Id_Categoria, Nombre_Categoria 
       FROM Categoria 
       WHERE Id_Convenio = ?`,
      [idConvenio]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener categorías:", err);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});

export default router;