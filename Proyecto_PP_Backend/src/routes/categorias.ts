
import { Router, Request, Response } from "express";
import { pool } from "../models/db.js";

const router = Router();

// PUT /api/categorias/:idCategoria/actualizar-sueldo
router.put("/:idCategoria/actualizar-sueldo", async (req: Request, res: Response) => {
  const { idCategoria } = req.params;
  const { nuevoSueldo } = req.body;
  if (nuevoSueldo === undefined || nuevoSueldo === null || isNaN(Number(nuevoSueldo))) {
    return res.status(400).json({ error: "Falta el nuevo sueldo o es inválido" });
  }
  try {
    // Actualizar historial y fecha
    await pool.query(
      `UPDATE Categoria SET Ultimo_Sueldo_Basico = Sueldo_Basico, Sueldo_Basico = ?, Fecha_Actualizacion = NOW() WHERE Id_Categoria = ?`,
      [nuevoSueldo, idCategoria]
    );
    res.json({ success: true, message: "Sueldo actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar sueldo individual:", err);
    res.status(500).json({ error: "Error al actualizar sueldo" });
  }
});

// PUT /api/categorias/actualizar-general
router.put("/actualizar-general", async (req: Request, res: Response) => {
  const { idConvenio, porcentaje } = req.body;
  if (!idConvenio || typeof porcentaje !== "number") {
    return res.status(400).json({ error: "Faltan datos requeridos (idConvenio, porcentaje)" });
  }
  try {
    // Para cada categoría, el sueldo actual pasa a ser el último, y el nuevo sueldo es el actual aumentado
    await pool.query(
      `UPDATE Categoria SET Ultimo_Sueldo_Basico = Sueldo_Basico WHERE Id_Convenio = ?`,
      [idConvenio]
    );
    await pool.query(
      `UPDATE Categoria SET Sueldo_Basico = ROUND(Sueldo_Basico * (1 + ? / 100), 2), Fecha_Actualizacion = NOW() WHERE Id_Convenio = ?`,
      [porcentaje, idConvenio]
    );
    res.json({ success: true, message: "Actualización general realizada correctamente" });
  } catch (err) {
    console.error("Error en actualización general de sueldos:", err);
    res.status(500).json({ error: "Error al actualizar sueldos" });
  }
});

// GET /api/categorias

// GET /api/categorias?convenio=ID
router.get("/", async (req: Request, res: Response) => {
  const { convenio } = req.query;
  let query = `SELECT c.Id_Categoria, c.Nombre_Categoria, c.Id_Convenio, c.Sueldo_Basico, c.Ultimo_Sueldo_Basico, c.Fecha_Actualizacion FROM Categoria c`;
  let params: any[] = [];
  if (convenio) {
    query += " WHERE c.Id_Convenio = ?";
    params.push(convenio);
  }
  try {
    const [rows]: any = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener categorías:", err);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});

// GET /api/categorias/:idConvenio
router.get("/:idConvenio", async (req: Request, res: Response) => {
  const { idConvenio } = req.params;
  try {
    const [rows]: any = await pool.query(
      `SELECT Id_Categoria, Nombre_Categoria, Sueldo_Basico 
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