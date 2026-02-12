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
  const { idConvenio, porcentaje, sumaFija } = req.body;

  const porcentajeValido =
    typeof porcentaje === "number" && !isNaN(porcentaje);
  const sumaFijaValida = typeof sumaFija === "number" && !isNaN(sumaFija);

  if (!idConvenio || (!porcentajeValido && !sumaFijaValida)) {
    return res.status(400).json({
      error: "Faltan datos requeridos (idConvenio y porcentaje o sumaFija)",
    });
  }

  try {
    if (porcentajeValido) {
      await pool.query(
        `UPDATE Categoria SET Ultimo_Sueldo_Basico = Sueldo_Basico WHERE Id_Convenio = ?`,
        [idConvenio]
      );
      await pool.query(
        `UPDATE Categoria SET Sueldo_Basico = ROUND(Sueldo_Basico * (1 + ? / 100), 2), Fecha_Actualizacion = NOW() WHERE Id_Convenio = ?`,
        [porcentaje, idConvenio]
      );
    }

    if (sumaFijaValida) {
      await pool.query(
        `UPDATE Categoria SET Suma_Fija_No_Remunerativa = ?, Fecha_Actualizacion = NOW() WHERE Id_Convenio = ?`,
        [sumaFija, idConvenio]
      );
    }

    res.json({
      success: true,
      message: "Actualización general realizada correctamente",
    });
  } catch (err) {
    console.error("Error en actualización general de sueldos:", err);
    res.status(500).json({ error: "Error al actualizar sueldos" });
  }
});

// PUT /api/categorias/:idCategoria/actualizar-suma-fija
router.put("/:idCategoria/actualizar-suma-fija", async (req: Request, res: Response) => {
  const { idCategoria } = req.params;
  const { sumaFija } = req.body;
  if (sumaFija === undefined || sumaFija === null || isNaN(Number(sumaFija))) {
    return res.status(400).json({ error: "Falta la suma fija o es inválida" });
  }
  try {
    await pool.query(
      `UPDATE Categoria SET Suma_Fija_No_Remunerativa = ? WHERE Id_Categoria = ?`,
      [sumaFija, idCategoria]
    );
    res.json({ success: true, message: "Suma fija actualizada correctamente" });
  } catch (err) {
    console.error("Error al actualizar suma fija:", err);
    res.status(500).json({ error: "Error al actualizar suma fija" });
  }
});

// GET /api/categorias

// GET /api/categorias?convenio=ID
router.get("/", async (req: Request, res: Response) => {
  const { convenio } = req.query;
  let query = `SELECT c.Id_Categoria, c.Nombre_Categoria, c.Id_Convenio, c.Sueldo_Basico, c.Ultimo_Sueldo_Basico, c.Fecha_Actualizacion, c.Suma_Fija_No_Remunerativa FROM Categoria c`;
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