import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { pool } from "../models/db.js";
import { authenticateToken } from "../middleware/auth.js";
const router = express.Router();

const pad2 = (value: number) => String(value).padStart(2, "0");

const toDateOnlyString = (value: any): string | null => {
  if (!value) return null;

  if (typeof value === "string") {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }

  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return null;

  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(
    date.getUTCDate()
  )}`;
};

const parseDateOnly = (value: any): Date | null => {
  const dateOnly = toDateOnlyString(value);
  if (!dateOnly) return null;
  const [year, month, day] = dateOnly.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (isNaN(date.getTime())) return null;
  return date;
};

const diffDaysInclusive = (start: any, end: any): number | null => {
  const startDate = parseDateOnly(start);
  const endDate = parseDateOnly(end);
  if (!startDate || !endDate) return null;

  const diff =
    Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

  return diff > 0 ? diff : null;
};

const normalizeLicenciaDateFields = (lic: any) => ({
  ...lic,
  FechaSolicitud: toDateOnlyString(lic?.FechaSolicitud) || lic?.FechaSolicitud,
  FechaRespuesta: toDateOnlyString(lic?.FechaRespuesta) || lic?.FechaRespuesta,
  FechaInicio: toDateOnlyString(lic?.FechaInicio) || lic?.FechaInicio,
  FechaFin: toDateOnlyString(lic?.FechaFin) || lic?.FechaFin,
  FechaReincorporacion:
    toDateOnlyString(lic?.FechaReincorporacion) || lic?.FechaReincorporacion,
});

// Crear carpeta si no existe
const createUploadDir = () => {
  if (!fs.existsSync("uploads/certificados")) {
    fs.mkdirSync("uploads/certificados", { recursive: true });
  }
};

createUploadDir();

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/certificados/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos PDF"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Crear solicitud de licencia
router.post(
  "/solicitar",
  authenticateToken,
  upload.single("certificadoMedico"),
  async (req: Request, res: Response) => {
    try {
      console.log("=== DEBUG SOLICITUD LICENCIA ===");
      console.log("req.body:", req.body);
      console.log("req.file:", req.file);
      console.log("req.user:", req.user);
      console.log("================================");

      const {
        nombre,
        apellido,
        documento,
        motivo,
        observaciones,
        diagnosticoCIE10_codigo,
        diagnosticoCIE10_descripcion,
        fechaInicio,
        fechaFin,
        fechaReincorporacion,
      } = req.body;

      const certificadoMedico = req.file ? req.file.filename : null;

      // Validaciones básicas
      if (
        !nombre ||
        !apellido ||
        !documento ||
        !motivo ||
        !fechaInicio ||
        !fechaFin ||
        !fechaReincorporacion
      ) {
        console.log("Error: Faltan campos obligatorios");
        return res.status(400).json({ message: "Faltan campos obligatorios" });
      }

      // Validación específica para enfermedad
      if (
        motivo === "Enfermedad" &&
        (!certificadoMedico || !diagnosticoCIE10_codigo)
      ) {
        return res.status(400).json({
          message:
            "Para licencias por enfermedad se requiere certificado médico y diagnóstico CIE-10",
        });
      }

      const user = req.user as
        | {
            id?: number;
            username: string;
            role: string;
            iat: number;
            exp: number;
          }
        | undefined;

      // Validar que el usuario esté autenticado
      if (!user || !user.username) {
        console.log("Error: Usuario no autenticado");
        return res.status(401).json({ message: "Usuario no autenticado" });
      }

      console.log("Usuario autenticado:", user);

      let userId = user.id;
      if (!userId) {
        console.log("Obteniendo ID del usuario desde la base de datos...");
        try {
          console.log(
            "Ejecutando query para obtener ID del usuario:",
            user.username
          );

          const [userRows] = await pool.execute(
            "SELECT Id_Usuario FROM Usuarios WHERE Nombre_Usuario = ?",
            [user.username]
          );

          console.log("Resultado de la query userRows:", userRows);

          if (Array.isArray(userRows) && userRows.length > 0) {
            userId = (userRows[0] as any).Id_Usuario;
            console.log("ID del usuario obtenido:", userId);
          } else {
            console.log("Usuario no encontrado en la base de datos");
            return res.status(401).json({ message: "Usuario no encontrado" });
          }
        } catch (dbError) {
          console.error("Error obteniendo ID del usuario:", dbError);
          return res
            .status(500)
            .json({ message: "Error interno del servidor" });
        }
      }

      console.log("ID final del usuario:", userId);

      // Buscar el Id_Empleado real usando el documento
      const [empleadoRows] = await pool.execute(
        "SELECT Id_Empleado, Fecha_Desde FROM Empleado WHERE Numero_Documento = ?",
        [documento]
      );

      if (!Array.isArray(empleadoRows) || empleadoRows.length === 0) {
        return res.status(400).json({ message: "Empleado no encontrado" });
      }

      const empleado = empleadoRows[0] as any;
      const idEmpleado = empleado.Id_Empleado;

      const diasPedidosCalculados = diffDaysInclusive(fechaInicio, fechaFin);

      if (!diasPedidosCalculados) {
        return res.status(400).json({
          message: "Rango de fechas inválido para calcular días solicitados",
        });
      }

      let diasPedidos: number | null = null;
      let diasRestantes: number | null = null;

      const controlaDias = motivo === "Vacaciones" || motivo === "Personal";

      if (controlaDias) {
        let antiguedad = 0;
        let diasVacaciones = 14;
        let diasTomados = 0;

        if (empleado.Fecha_Desde) {
          const fechaDesde = new Date(empleado.Fecha_Desde);
          const hoy = new Date();
          antiguedad = hoy.getFullYear() - fechaDesde.getFullYear();
          if (
            hoy.getMonth() < fechaDesde.getMonth() ||
            (hoy.getMonth() === fechaDesde.getMonth() &&
              hoy.getDate() < fechaDesde.getDate())
          ) {
            antiguedad--;
          }

          if (antiguedad > 5 && antiguedad <= 10) diasVacaciones = 21;
          else if (antiguedad > 10 && antiguedad <= 20) diasVacaciones = 28;
          else if (antiguedad > 20) diasVacaciones = 35;
        }

        const [licenciasAprobadas] = await pool.execute(
          `SELECT FechaInicio, FechaFin
           FROM Licencia
           WHERE Id_Empleado = ?
             AND Motivo IN ('Vacaciones', 'Personal')
             AND Estado = 'Aprobada'`,
          [idEmpleado]
        );

        (licenciasAprobadas as any[]).forEach((lic) => {
          const diasLicencia = diffDaysInclusive(lic.FechaInicio, lic.FechaFin);
          if (diasLicencia) {
            diasTomados += diasLicencia;
          }
        });

        const diasDisponibles = Math.max(diasVacaciones - diasTomados, 0);

        if (diasPedidosCalculados > diasDisponibles) {
          return res.status(400).json({
            message: `No puedes solicitar más de ${diasDisponibles} días disponibles.`,
          });
        }

        diasPedidos = diasPedidosCalculados;
        diasRestantes = Math.max(diasDisponibles - diasPedidosCalculados, 0);
      }

      let result: any;
      try {
        [result] = await pool.execute(
          `INSERT INTO Licencia (
            Id_Empleado, FechaInicio, FechaFin, FechaReincorporacion, Motivo,
            Observaciones, CertificadoMedico, DiagnosticoCIE10_Codigo,
            DiagnosticoCIE10_Descripcion, Estado, diasPedidos, diasRestantes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            idEmpleado,
            fechaInicio,
            fechaFin,
            fechaReincorporacion,
            motivo,
            observaciones || null,
            certificadoMedico,
            diagnosticoCIE10_codigo || null,
            diagnosticoCIE10_descripcion || null,
            "Pendiente",
            diasPedidos,
            diasRestantes,
          ]
        );
      } catch (insertError: any) {
        if (insertError?.code !== "ER_BAD_FIELD_ERROR") {
          throw insertError;
        }

        [result] = await pool.execute(
          `INSERT INTO Licencia (
            Id_Empleado, FechaInicio, FechaFin, FechaReincorporacion, Motivo,
            Observaciones, CertificadoMedico, DiagnosticoCIE10_Codigo,
            DiagnosticoCIE10_Descripcion, Estado
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            idEmpleado,
            fechaInicio,
            fechaFin,
            fechaReincorporacion,
            motivo,
            observaciones || null,
            certificadoMedico,
            diagnosticoCIE10_codigo || null,
            diagnosticoCIE10_descripcion || null,
            "Pendiente",
          ]
        );
      }

      console.log("Licencia creada con ID:", (result as any).insertId);

      res.status(201).json({
        message: "Solicitud de licencia creada exitosamente",
        licenciaId: (result as any).insertId,
      });
    } catch (error) {
      console.error("Error creando solicitud de licencia:", error);
      console.error("Stack trace:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
);

// Obtener licencias pendientes
router.get(
  "/pendientes",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const [licencias] = await pool.execute(
        `SELECT 
          l.*, 
          e.Nombre, 
          e.Apellido, 
          e.Numero_Documento as Documento,
          c.Nombre_Categoria AS Categoria
        FROM Licencia l
        INNER JOIN Empleado e ON l.Id_Empleado = e.Id_Empleado
        LEFT JOIN Categoria c ON e.Categoria = c.Id_Categoria
        WHERE l.Estado = 'Pendiente' 
        ORDER BY l.FechaSolicitud DESC`
      );
      res.json((licencias as any[]).map(normalizeLicenciaDateFields));
    } catch (error) {
      console.error("Error obteniendo licencias:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
);

// Responder solicitud
router.put(
  "/responder/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { estado, motivoRechazo } = req.body;

      await pool.execute(
        "UPDATE Licencia SET Estado = ?, FechaRespuesta = NOW(), MotivoRechazo = ? WHERE Id_Licencia = ?",
        [estado, motivoRechazo || null, id]
      );

      res.json({ message: "Respuesta enviada exitosamente" });
    } catch (error) {
      console.error("Error respondiendo licencia:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
);

// Obtener licencias de un empleado por documento
router.get(
  "/mis-licencias/:documento",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { documento } = req.params;
      const [licencias] = await pool.execute(
        `SELECT 
          l.*, 
          e.Nombre, 
          e.Apellido, 
          e.Numero_Documento as Documento,
          c.Nombre_Categoria AS Categoria
        FROM Licencia l
        INNER JOIN Empleado e ON l.Id_Empleado = e.Id_Empleado
        LEFT JOIN Categoria c ON e.Categoria = c.Id_Categoria
        WHERE e.Numero_Documento = ? 
        ORDER BY l.FechaSolicitud DESC`,
        [documento]
      );
      // Calcular diasPedidos para cada licencia
      const licenciasConDias = (licencias as any[]).map((lic) => {
        const diasPedidos = diffDaysInclusive(lic.FechaInicio, lic.FechaFin);
        return { ...normalizeLicenciaDateFields(lic), diasPedidos };
      });
      res.json(licenciasConDias);
    } catch (error) {
      console.error("Error obteniendo licencias del empleado:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
);

// Editar una licencia existente
router.put(
  "/editar/:id",
  authenticateToken,
  upload.single("certificadoMedico"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        motivo,
        observaciones,
        diagnosticoCIE10_codigo,
        diagnosticoCIE10_descripcion,
        fechaInicio,
        fechaFin,
      } = req.body;

      // Si se sube un nuevo archivo, usarlo; si no, mantener el anterior
      let certificadoMedico = null;
      if (req.file) {
        certificadoMedico = req.file.filename;
      }

      // Construir la consulta dinámica según si hay archivo nuevo o no
      let query = `
        UPDATE Licencia SET
          Motivo = ?,
          Observaciones = ?,
          DiagnosticoCIE10_Codigo = ?,
          DiagnosticoCIE10_Descripcion = ?,
          FechaInicio = ?,
          FechaFin = ?
      `;
      const params: any[] = [
        motivo,
        observaciones || null,
        diagnosticoCIE10_codigo || null,
        diagnosticoCIE10_descripcion || null,
        fechaInicio,
        fechaFin,
      ];

      if (certificadoMedico) {
        query += `, CertificadoMedico = ?`;
        params.push(certificadoMedico);
      }

      query += ` WHERE Id_Licencia = ?`;
      params.push(id);

      console.log("EDIT LICENCIA PARAMS:", {
        motivo,
        observaciones,
        diagnosticoCIE10_codigo,
        diagnosticoCIE10_descripcion,
        fechaInicio,
        fechaFin,
        certificadoMedico,
        id,
      });
      console.log("QUERY:", query);
      console.log("PARAMS:", params);

      await pool.execute(query, params);

      res.json({ message: "Licencia actualizada correctamente" });
    } catch (error) {
      console.error("Error actualizando licencia:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
);

// Obtener historial de licencias (por DNI)
router.get(
  "/historial/:dni",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { dni } = req.params;

      // Obtener licencias del empleado por su DNI (documento)
      const [rows] = await pool.execute(
        `SELECT l.*, e.Nombre AS NombreEmpleado, e.Apellido AS ApellidoEmpleado, e.Numero_Documento AS Documento
         FROM Licencia l
         JOIN Empleado e ON l.Id_Empleado = e.Id_Empleado
         WHERE e.Numero_Documento = ?
         ORDER BY l.FechaSolicitud DESC`,
        [dni]
      );

      // Añadir URL pública para el certificado si existe
      const licencias = (rows as any[]).map((l) => ({
        ...normalizeLicenciaDateFields(l),
        CertificadoMedicoUrl: l.CertificadoMedico
          ? `${req.protocol}://${req.get("host")}/uploads/certificados/${l.CertificadoMedico}`
          : null,
      }));

      res.json(licencias);
    } catch (error) {
      console.error("Error obteniendo historial de licencias:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
);

export default router;
