import { Router, Request, Response } from 'express';
import db from '../models/db.js';

const router = Router();

// GET /api/conceptos/:convenio
router.get('/:convenio', async (req: Request, res: Response) => {
  const { convenio } = req.params;
  let tabla = '';

  // Mapear el convenio al nombre de la tabla
  switch (convenio) {
    case 'cct130_75':
      tabla = 'Conceptos_CCT130_75';
      break;
    // Puedes agregar más convenios aquí
    // case 'cctxxxx':
    //   tabla = 'Conceptos_CCTxxxx';
    //   break;
    default:
      return res.status(400).json({ error: 'Convenio no soportado' });
  }

  try {
    const [rows] = await db.query(`SELECT * FROM ${tabla} ORDER BY orden ASC`);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener conceptos:', err);
    res.status(500).json({ error: 'Error al obtener conceptos' });
  }
});

export default router;
