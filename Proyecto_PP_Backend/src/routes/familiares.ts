
import { Router } from "express";
import { pool } from "../models/db.js";
const router = Router();

// DELETE familiar por Id_Familiar
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result]: any = await pool.query(
      "DELETE FROM Familiares WHERE Id_Familiar = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Familiar no encontrado" });
    }
    res.json({ message: "Familiar eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar familiar:", error);
    res.status(500).json({ message: "Error al eliminar familiar" });
  }
});

// GET familiares by empleado DNI
router.get("/empleado-dni/:dni", async (req, res) => {
  const { dni } = req.params;
  try {
    // Get Id_Empleado from Empleado table
    const [empleadoRows]: any = await pool.query(
      "SELECT Id_Empleado FROM Empleado WHERE Numero_Documento = ?",
      [dni]
    );
    if (!empleadoRows.length) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }
    const idEmpleado = empleadoRows[0].Id_Empleado;
    // Get familiares for this empleado
    const [familiares]: any = await pool.query(
      "SELECT * FROM Familiares WHERE Id_Empleado = ?",
      [idEmpleado]
    );
    res.json(familiares);
  } catch (error) {
    console.error("Error al obtener familiares:", error);
    res.status(500).json({ message: "Error al obtener familiares" });
  }
});

// POST crear familiar
router.post("/crear", async (req, res) => {
  const { dni, nombre, parentesco, fecha_nacimiento, tipo_documento, numero_documento } = req.body;
  try {
    // Get Id_Empleado from Empleado table
    const [empleadoRows]: any = await pool.query(
      "SELECT Id_Empleado FROM Empleado WHERE Numero_Documento = ?",
      [dni]
    );
    if (!empleadoRows.length) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }
    const idEmpleado = empleadoRows[0].Id_Empleado;
    // Insert familiar
    await pool.query(
      `INSERT INTO Familiares (Id_Empleado, Nombre, Parentesco, Fecha_Nacimiento, Tipo_Documento, Numero_Documento)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [idEmpleado, nombre, parentesco, fecha_nacimiento, tipo_documento, numero_documento]
    );
    res.status(201).json({ message: "Familiar creado exitosamente" });
  } catch (error) {
    console.error("Error al crear familiar:", error);
    res.status(500).json({ message: "Error al crear familiar" });
  }
});

export default router;
