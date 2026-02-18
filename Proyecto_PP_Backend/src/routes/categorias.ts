import { Router, Request, Response } from "express";
import { pool } from "../models/db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

type UsuarioAuth = {
  id?: number;
  username?: string;
};

const parseFechaEfectiva = (fecha?: string): string => {
  if (!fecha) return new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return new Date().toISOString().slice(0, 10);
  }
  return fecha;
};

const resolveUsuarioAuditoria = async (req: Request) => {
  const user = (req.user || {}) as UsuarioAuth;
  let idUsuario: number | null =
    typeof user.id === "number" && user.id > 0 ? user.id : null;
  const nombreUsuario = user.username || null;

  if (idUsuario) {
    const [rowsById]: any = await pool.query(
      "SELECT Id_Usuario FROM Usuarios WHERE Id_Usuario = ? LIMIT 1",
      [idUsuario]
    );
    if (!Array.isArray(rowsById) || rowsById.length === 0) {
      idUsuario = null;
    }
  }

  if (!idUsuario && nombreUsuario) {
    const [rows]: any = await pool.query(
      "SELECT Id_Usuario FROM Usuarios WHERE Nombre_Usuario = ? LIMIT 1",
      [nombreUsuario]
    );
    if (Array.isArray(rows) && rows.length > 0) {
      idUsuario = Number(rows[0].Id_Usuario) || null;
    }
  }

  return { idUsuario, nombreUsuario };
};

const insertHistoricoBasico = async (
  conn: any,
  params: {
    idCategoria: number;
    sueldoAnterior: number;
    sueldoNuevo: number;
    tipoActualizacion: "general" | "individual" | "reinicio";
    porcentajeAplicado?: number | null;
    fechaEfectiva: string;
    idUsuario: number | null;
    nombreUsuario: string | null;
    observacion?: string | null;
  }
) => {
  await conn.query(
    `INSERT INTO basicos_historicos (
      Id_Categoria,
      Sueldo_Anterior,
      Sueldo_Nuevo,
      Tipo_Actualizacion,
      Porcentaje_Aplicado,
      Fecha_Efectiva,
      Id_Usuario,
      Nombre_Usuario,
      Observacion
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      params.idCategoria,
      params.sueldoAnterior,
      params.sueldoNuevo,
      params.tipoActualizacion,
      params.porcentajeAplicado ?? null,
      params.fechaEfectiva,
      params.idUsuario,
      params.nombreUsuario,
      params.observacion ?? null,
    ]
  );
};

// PUT /api/categorias/:idCategoria/actualizar-sueldo
router.put("/:idCategoria/actualizar-sueldo", authenticateToken, async (req: Request, res: Response) => {
  const { idCategoria } = req.params;
  const { nuevoSueldo, fecha } = req.body;
  if (nuevoSueldo === undefined || nuevoSueldo === null || isNaN(Number(nuevoSueldo))) {
    return res.status(400).json({ error: "Falta el nuevo sueldo o es inválido" });
  }

  const idCategoriaNum = Number(idCategoria);
  const nuevoSueldoNum = Number(nuevoSueldo);
  const fechaEfectiva = parseFechaEfectiva(fecha);

  if (!idCategoriaNum || isNaN(idCategoriaNum)) {
    return res.status(400).json({ error: "idCategoria inválido" });
  }

  try {
    const { idUsuario, nombreUsuario } = await resolveUsuarioAuditoria(req);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [rows]: any = await conn.query(
        `SELECT Id_Categoria, Sueldo_Basico FROM Categoria WHERE Id_Categoria = ? LIMIT 1`,
        [idCategoriaNum]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        await conn.rollback();
        return res.status(404).json({ error: "Categoría no encontrada" });
      }

      const sueldoAnterior = Number(rows[0].Sueldo_Basico);

      await conn.query(
        `UPDATE Categoria SET Ultimo_Sueldo_Basico = Sueldo_Basico, Sueldo_Basico = ?, Fecha_Actualizacion = NOW() WHERE Id_Categoria = ?`,
        [nuevoSueldoNum, idCategoriaNum]
      );

      await insertHistoricoBasico(conn, {
        idCategoria: idCategoriaNum,
        sueldoAnterior,
        sueldoNuevo: nuevoSueldoNum,
        tipoActualizacion: nuevoSueldoNum === 0 ? "reinicio" : "individual",
        porcentajeAplicado: null,
        fechaEfectiva,
        idUsuario,
        nombreUsuario,
        observacion: nuevoSueldoNum === 0 ? "Reinicio de sueldo básico a 0" : "Actualización individual de sueldo básico",
      });

      await conn.commit();
    } catch (errorTx) {
      await conn.rollback();
      throw errorTx;
    } finally {
      conn.release();
    }

    res.json({ success: true, message: "Sueldo actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar sueldo individual:", err);
    res.status(500).json({ error: "Error al actualizar sueldo" });
  }
});

// PUT /api/categorias/actualizar-general
router.put("/actualizar-general", authenticateToken, async (req: Request, res: Response) => {
  const { idConvenio, porcentaje, sumaFija, fecha } = req.body;

  const porcentajeValido =
    typeof porcentaje === "number" && !isNaN(porcentaje);
  const sumaFijaValida = typeof sumaFija === "number" && !isNaN(sumaFija);
  const fechaEfectiva = parseFechaEfectiva(fecha);

  const idConvenioNum = Number(idConvenio);

  if (!idConvenioNum || (!porcentajeValido && !sumaFijaValida)) {
    return res.status(400).json({
      error: "Faltan datos requeridos (idConvenio y porcentaje o sumaFija)",
    });
  }

  try {
    const { idUsuario, nombreUsuario } = await resolveUsuarioAuditoria(req);
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      if (porcentajeValido) {
        const [rows]: any = await conn.query(
          `SELECT Id_Categoria, Sueldo_Basico FROM Categoria WHERE Id_Convenio = ?`,
          [idConvenioNum]
        );

        for (const row of rows as any[]) {
          const sueldoAnterior = Number(row.Sueldo_Basico);
          const sueldoNuevo = Number(
            (sueldoAnterior * (1 + Number(porcentaje) / 100)).toFixed(2)
          );

          await insertHistoricoBasico(conn, {
            idCategoria: Number(row.Id_Categoria),
            sueldoAnterior,
            sueldoNuevo,
            tipoActualizacion: "general",
            porcentajeAplicado: Number(porcentaje),
            fechaEfectiva,
            idUsuario,
            nombreUsuario,
            observacion: "Actualización general por convenio",
          });
        }

        await conn.query(
          `UPDATE Categoria SET Ultimo_Sueldo_Basico = Sueldo_Basico WHERE Id_Convenio = ?`,
          [idConvenioNum]
        );
        await conn.query(
          `UPDATE Categoria SET Sueldo_Basico = ROUND(Sueldo_Basico * (1 + ? / 100), 2), Fecha_Actualizacion = NOW() WHERE Id_Convenio = ?`,
          [porcentaje, idConvenioNum]
        );
      }

      if (sumaFijaValida) {
        await conn.query(
          `UPDATE Categoria SET Suma_Fija_No_Remunerativa = ?, Fecha_Actualizacion = NOW() WHERE Id_Convenio = ?`,
          [sumaFija, idConvenioNum]
        );
      }

      await conn.commit();
    } catch (errorTx) {
      await conn.rollback();
      throw errorTx;
    } finally {
      conn.release();
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
router.put("/:idCategoria/actualizar-suma-fija", authenticateToken, async (req: Request, res: Response) => {
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

// GET /api/categorias/basicos-historicos?categoriaId=1&desde=2026-01-01&hasta=2026-01-31
router.get("/basicos-historicos", authenticateToken, async (req: Request, res: Response) => {
  const categoriaId = req.query.categoriaId || req.query.idCategoria;
  const desde = (req.query.desde || req.query.fechaDesde) as string | undefined;
  const hasta = (req.query.hasta || req.query.fechaHasta) as string | undefined;

  const condiciones: string[] = [];
  const params: any[] = [];

  if (categoriaId !== undefined && categoriaId !== null && String(categoriaId).trim() !== "") {
    const categoriaNum = Number(categoriaId);
    if (isNaN(categoriaNum) || categoriaNum <= 0) {
      return res.status(400).json({ error: "categoriaId inválido" });
    }
    condiciones.push("bh.Id_Categoria = ?");
    params.push(categoriaNum);
  }

  if (desde) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(desde)) {
      return res.status(400).json({ error: "fecha desde inválida (usar YYYY-MM-DD)" });
    }
    condiciones.push("bh.Fecha_Efectiva >= ?");
    params.push(desde);
  }

  if (hasta) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(hasta)) {
      return res.status(400).json({ error: "fecha hasta inválida (usar YYYY-MM-DD)" });
    }
    condiciones.push("bh.Fecha_Efectiva <= ?");
    params.push(hasta);
  }

  if (desde && hasta && desde > hasta) {
    return res.status(400).json({ error: "El rango de fechas es inválido (desde > hasta)" });
  }

  let query = `
    SELECT
      bh.Id_Historico,
      bh.Id_Categoria,
      c.Nombre_Categoria,
      bh.Sueldo_Anterior,
      bh.Sueldo_Nuevo,
      bh.Tipo_Actualizacion,
      bh.Porcentaje_Aplicado,
      bh.Fecha_Efectiva,
      bh.Fecha_Registro,
      bh.Id_Usuario,
      bh.Nombre_Usuario,
      bh.Observacion
    FROM basicos_historicos bh
    INNER JOIN Categoria c ON c.Id_Categoria = bh.Id_Categoria
  `;

  if (condiciones.length > 0) {
    query += ` WHERE ${condiciones.join(" AND ")}`;
  }

  query += " ORDER BY bh.Fecha_Efectiva DESC, bh.Fecha_Registro DESC, bh.Id_Historico DESC";

  try {
    const [rows]: any = await pool.query(query, params);
    return res.json(rows);
  } catch (err) {
    console.error("Error al obtener historial de básicos:", err);
    return res.status(500).json({ error: "Error al obtener historial de básicos" });
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