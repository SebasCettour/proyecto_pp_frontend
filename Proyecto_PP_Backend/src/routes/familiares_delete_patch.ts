import { Router } from "express";
import { pool } from "../models/db.js";

const router = Router();

// ...existing code...

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

export default router;
