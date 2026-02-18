import express, { Request, Response } from "express";
import { pool as db } from "../models/db.js";
import bcrypt from "bcrypt";

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

// ✅ INTERFACE PARA EL ERROR DE MYSQL
interface MySQLError extends Error {
  code?: string;
  errno?: number;
  sqlState?: string;
  sqlMessage?: string;
}

//Alta Empleado
router.post("/auth/register", async (req, res) => {
  console.log("📝 Datos recibidos:", JSON.stringify(req.body, null, 2));

  // Permitir tanto 'rolId' como 'roleId' (compatibilidad frontend)
  const {
    username,
    email,
    domicilio,
    estadoCivil,
    fechaContrato,
    fechaNacimiento,
    telefono,
    tipoDocumento,
    numeroDocumento,
    password,
    familiares = [],
  } = req.body;
  // Soporte para ambos nombres
  let rolId = req.body.rolId ?? req.body.roleId;
  
  console.log("📝 rolId extraído:", rolId, "tipo:", typeof rolId);

  // ✅ SEPARAR NOMBRE Y APELLIDO CORRECTAMENTE
  const nombreCompleto = username || "";
  const partesNombre = nombreCompleto.trim().split(" ");
  const nombre = partesNombre[0] || ""; // Primer palabra = NOMBRE
  const apellido = partesNombre.slice(1).join(" ") || ""; // Resto = APELLIDO

  console.log("📝 Separación correcta:");
  console.log("  - Nombre completo:", nombreCompleto);
  console.log("  - Nombre:", nombre);
  console.log("  - Apellido:", apellido);

  // ✅ FUNCIÓN PARA GENERAR LEGAJO AUTOMÁTICO
  const generateLegajo = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  // ✅ VALIDACIONES MEJORADAS
  const missing = [];
  if (!username) missing.push("username");
  if (!email) missing.push("email");
  if (!password) missing.push("password");
  if (!numeroDocumento) missing.push("numeroDocumento");
  if (!rolId || rolId === "") missing.push("rolId");
  if (missing.length > 0) {
    console.log("❌ Faltan campos obligatorios:", missing);
    return res.status(400).json({
      error: "Faltan campos obligatorios",
      missing,
      received: req.body,
    });
  }

  // ✅ GENERAR LEGAJO AUTOMÁTICAMENTE
  const legajo = generateLegajo();
  console.log("🔢 Legajo generado automáticamente:", legajo);

  // ✅ SQL CORRECTO - RESPETA EL ORDEN DE LA TABLA (SIN AREA)
  const sqlEmpleado = `
    INSERT INTO Empleado (
      Nombre, Apellido, Correo_Electronico, Domicilio, Estado_Civil,
      Fecha_Desde, Fecha_Nacimiento, Legajo, Telefono, Tipo_Documento, Numero_Documento
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const sqlUsuario = `
    INSERT INTO Usuarios (
      Nombre_Usuario, Correo_Electronico, Contrasenia, Id_Rol, Numero_Documento
    ) VALUES (?, ?, ?, ?, ?)
  `;

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    console.log("🔄 Insertando en Empleado...");
    const empleadoData = [
      nombre,
      apellido,
      email,
      domicilio,
      estadoCivil,
      fechaContrato,
      fechaNacimiento,
      legajo,
      telefono,
      tipoDocumento,
      numeroDocumento,
    ];
    await connection.query(sqlEmpleado, empleadoData);
    console.log("✅ Empleado insertado exitosamente");

    // Obtener el Id_Empleado recién insertado
    const [empleadoRows]: any = await connection.query(
      "SELECT Id_Empleado FROM Empleado WHERE Numero_Documento = ? ORDER BY Id_Empleado DESC LIMIT 1",
      [numeroDocumento]
    );
    const idEmpleado =
      empleadoRows && empleadoRows[0] ? empleadoRows[0].Id_Empleado : null;
    if (!idEmpleado)
      throw new Error("No se pudo obtener el Id_Empleado insertado");

    // Insertar familiares si existen
    if (Array.isArray(familiares) && familiares.length > 0) {
      const sqlFamiliar = `INSERT INTO Familiares (Id_Empleado, Nombre, Parentesco, Fecha_Nacimiento, Tipo_Documento, Numero_Documento) VALUES (?, ?, ?, ?, ?, ?)`;
      for (const fam of familiares) {
        await connection.query(sqlFamiliar, [
          idEmpleado,
          fam.nombreFamiliar,
          fam.parentesco,
          fam.fechaNacimientoFamiliar,
          fam.tipoDocumentoFamiliar,
          fam.numeroDocumentoFamiliar,
        ]);
      }
      console.log(`✅ Familiares insertados: ${familiares.length}`);
    }

    // Insertar en Usuarios
    const hashedPassword = await bcrypt.hash(password, 10);
    const usuarioData = [
      username,
      email,
      hashedPassword,
      rolId,
      numeroDocumento,
    ];
    await connection.query(sqlUsuario, usuarioData);
    console.log("✅ Usuario insertado exitosamente");

    await connection.commit();
    console.log("✅ Usuario y familiares creados exitosamente");
    res
      .status(201)
      .json({ message: "Usuario y familiares creados correctamente" });
  } catch (err: unknown) {
    if (connection) {
      await connection.rollback();
    }
    const error = err as MySQLError;
    console.error("❌ Error detallado:", error);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error code:", error.code);
    console.error("❌ SQL State:", error.sqlState);
    console.error("❌ SQL Message:", error.sqlMessage);
    
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "El número de documento o email ya existe en el sistema",
      });
    }
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ error: "El rol seleccionado no existe" });
    }
    if (error.code === "ER_BAD_NULL_ERROR") {
      return res.status(400).json({
        error: "Faltan campos obligatorios en la base de datos",
        sqlMessage: error.sqlMessage,
      });
    }
    res.status(500).json({
      error: "Error interno del servidor",
      details: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// ✅ CORREGIR BÚSQUEDA POR DNI
router.get("/usuario-dni/:dni", async (req, res) => {
  const { dni } = req.params;
  try {
    console.log("[usuario-dni] DNI recibido:", dni);
    const sql = `SELECT e.*, c.Id_Categoria, c.Nombre_Categoria AS Nombre_Categoria
       FROM ProyectoPP.Empleado e
      LEFT JOIN ProyectoPP.Categoria c ON e.Categoria = c.Id_Categoria
       WHERE e.Numero_Documento = ?`;
    console.log("[usuario-dni] SQL:", sql);
    const [rows]: any = await db.query(sql, [dni]);
    console.log("[usuario-dni] Resultado SQL:", rows);
    if (!rows || rows.length === 0) {
      console.log("[usuario-dni] Usuario no encontrado para DNI:", dni);
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    const user = rows[0];
    user.Id_Categoria = user.Id_Categoria || null;
    user.Nombre_Categoria = user.Nombre_Categoria || null;
    console.log("[usuario-dni] Usuario encontrado:", user);
    res.json(user);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[usuario-dni] Error al buscar usuario:", error);
    res.status(500).json({ error: "Error al buscar usuario", details: error.message });
  }
});

// ✅ CORREGIR ELIMINACIÓN POR DNI CON LOGS DETALLADOS
router.delete(
  "/eliminar-usuario-dni/:dni",
  async (req: Request, res: Response) => {
    const { dni } = req.params;

    console.log("🗑️ INICIO - Eliminación de usuario");
    console.log("📝 DNI recibido:", dni);
    console.log("📝 Tipo de DNI:", typeof dni);

    // ✅ VALIDACIÓN BÁSICA
    if (!dni || dni.trim() === "") {
      console.log("❌ DNI inválido o vacío");
      return res.status(400).json({ error: "DNI requerido" });
    }

    let connection;
    try {
      console.log("🔌 Obteniendo conexión a la base de datos...");
      connection = await db.getConnection();
      await connection.beginTransaction();
      console.log("✅ Transacción iniciada");

      // ✅ VERIFICAR SI EL USUARIO EXISTE PRIMERO
      console.log("🔍 Verificando si el usuario existe...");
      const [checkEmpleado]: any = await connection.query(
        "SELECT Id_Empleado, Nombre, Apellido FROM Empleado WHERE Numero_Documento = ?",
        [dni]
      );

      console.log("📊 Resultado búsqueda empleado:", checkEmpleado);

      if (checkEmpleado.length === 0) {
        await connection.rollback();
        console.log("❌ Empleado no encontrado");
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      console.log("✅ Usuario encontrado:", {
        id: checkEmpleado[0].Id_Empleado,
        nombre: checkEmpleado[0].Nombre,
        apellido: checkEmpleado[0].Apellido,
      });

      // ✅ BORRADO LÓGICO DE USUARIOS
      console.log("🗑️ Borrado lógico en tabla Usuarios...");
      const [resultUsuarios]: any = await connection.query(
        "UPDATE Usuarios SET Activo = 0 WHERE Numero_Documento = ?",
        [dni]
      );
      console.log(
        "📊 Filas actualizadas en Usuarios:",
        resultUsuarios.affectedRows
      );

      // ✅ BORRADO LÓGICO DE EMPLEADO
      console.log("🗑️ Borrado lógico en tabla Empleado...");
      const [resultEmpleado]: any = await connection.query(
        "UPDATE Empleado SET Activo = 0 WHERE Numero_Documento = ?",
        [dni]
      );
      console.log(
        "📊 Filas actualizadas en Empleado:",
        resultEmpleado.affectedRows
      );

      // ✅ VERIFICAR QUE AL MENOS SE ACTUALIZÓ EMPLEADO
      if (resultEmpleado.affectedRows === 0) {
        await connection.rollback();
        console.log("❌ No se pudo dar de baja el empleado");
        return res
          .status(404)
          .json({ error: "No se pudo dar de baja el usuario" });
      }

      await connection.commit();
      console.log("✅ Usuario dado de baja lógicamente");
      console.log("📊 Resumen:");
      console.log("  - Usuarios actualizados:", resultUsuarios.affectedRows);
      console.log("  - Empleados actualizados:", resultEmpleado.affectedRows);

      res.status(204).send();
    } catch (err: unknown) {
      console.log("❌ ERROR en eliminación:");
      console.log("❌ Error completo:", err);

      if (connection) {
        try {
          await connection.rollback();
          console.log("✅ Rollback completado");
        } catch (rollbackErr) {
          console.log("❌ Error en rollback:", rollbackErr);
        }
      }

      const error = err as MySQLError;
      console.error("❌ Error detallado:");
      console.error("  - message:", error.message);
      console.error("  - code:", error.code);
      console.error("  - errno:", error.errno);

      // ✅ MANEJO DE ERRORES ESPECÍFICOS
      if (error.code === "ER_ROW_IS_REFERENCED_2") {
        return res.status(409).json({
          error: "No se puede eliminar: el usuario tiene registros asociados",
        });
      }

      if (error.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({
          error: "Error de referencia en la base de datos",
        });
      }

      res.status(500).json({
        error: "Error interno del servidor",
        details: error.message,
        code: error.code,
      });
    } finally {
      if (connection) {
        console.log("🔄 Liberando conexión...");
        connection.release();
        console.log("✅ Conexión liberada");
      }
    }
  }
);

// ✅ CORREGIR EDICIÓN POR DNI
router.put("/editar-usuario-dni/:dni", async (req: Request, res: Response) => {
  const { dni } = req.params;
  const {
    Nombre,
    Apellido,
    Categoria,
    Correo_Electronico,
    Domicilio,
    Estado_Civil,
    Fecha_Desde,
    Fecha_Nacimiento,
    Legajo,
    Telefono,
    Tipo_Documento,
    Numero_Documento,
    Id_Sindicato,
    Id_ObraSocial,
    id_convenio,
  } = req.body;

  // Si Categoria es un string (nombre), buscar el ID
  let categoriaId = Categoria;
  if (typeof Categoria === "string" && isNaN(Number(Categoria))) {
    const [catRows]: any = await db.query(
      "SELECT Id_Categoria FROM Categoria WHERE Nombre_Categoria = ? LIMIT 1",
      [Categoria]
    );
    categoriaId = catRows.length > 0 ? catRows[0].Id_Categoria : null;
  }

  try {
    // Buscar el Id_Empleado por el DNI
    const [rows]: any = await db.query(
      "SELECT Id_Empleado FROM Empleado WHERE Numero_Documento = ?",
      [dni]
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }
    const idEmpleado = rows[0].Id_Empleado;

    // Actualizar usando Id_Empleado y el ID de la categoría, sindicato, obra social y convenio
    await db.query(
      `UPDATE Empleado SET
        Nombre = ?,
        Apellido = ?,
        Categoria = ?,
        Correo_Electronico = ?,
        Domicilio = ?,
        Estado_Civil = ?,
        Fecha_Desde = ?,
        Fecha_Nacimiento = ?,
        Legajo = ?,
        Telefono = ?,
        Tipo_Documento = ?,
        Numero_Documento = ?,
        Id_Sindicato = ?,
        Id_ObraSocial = ?,
        id_convenio = ?
      WHERE Id_Empleado = ?`,
      [
        Nombre,
        Apellido,
        categoriaId,
        Correo_Electronico,
        Domicilio,
        Estado_Civil,
        Fecha_Desde,
        Fecha_Nacimiento,
        Legajo,
        Telefono,
        Tipo_Documento,
        Numero_Documento,
        Id_Sindicato,
        Id_ObraSocial,
        id_convenio,
        idEmpleado,
      ]
    );

    // Actualizar en Usuarios solo el registro vinculado al Id_Empleado
    // Buscar el Id_Usuario correspondiente
    const [usuarioRows]: any = await db.query(
      `SELECT u.Id_Usuario
         FROM Usuarios u
         JOIN Empleado e ON u.Numero_Documento = e.Numero_Documento
        WHERE e.Id_Empleado = ? LIMIT 1`,
      [idEmpleado]
    );
    if (usuarioRows.length > 0) {
      const idUsuario = usuarioRows[0].Id_Usuario;
      await db.query(
        `UPDATE Usuarios SET
          Nombre_Usuario = ?,
          Correo_Electronico = ?,
          Numero_Documento = ?
        WHERE Id_Usuario = ?`,
        [`${Nombre} ${Apellido}`, Correo_Electronico, Numero_Documento, idUsuario]
      );
    }

    res.json({ message: "Usuario actualizado correctamente" });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

// Cambiar contraseña (requiere: username, oldPassword, newPassword)
router.post("/auth/cambiar-password", async (req: Request, res: Response) => {
  const { username, oldPassword, newPassword } = req.body;

  if (!username || !oldPassword || !newPassword) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    // Buscar usuario
    const [rows]: any = await db.query(
      "SELECT Contrasenia FROM Usuarios WHERE Nombre_Usuario = ?",
      [username]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const hashActual = rows[0].Contrasenia;

    // Verificar contraseña actual
    const esValida = await bcrypt.compare(oldPassword, hashActual);
    if (!esValida && oldPassword !== hashActual) {
      return res.status(401).json({ error: "Contraseña actual incorrecta" });
    }

    // Hashear nueva contraseña
    const hashNueva = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await db.query(
      "UPDATE Usuarios SET Contrasenia = ? WHERE Nombre_Usuario = ?",
      [hashNueva, username]
    );

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error("Error al cambiar contraseña:", err);
    res.status(500).json({ error: "Error al cambiar la contraseña" });
  }
});

// ✅ BUSCAR EMPLEADO POR DNI, NOMBRE O APELLIDO PARA LIQUIDACIÓN
router.get("/empleado-buscar/:searchTerm", async (req: Request, res: Response) => {
  const { searchTerm } = req.params;

  console.log("🔍 Buscando empleado para liquidación - Término:", searchTerm);

  try {
    // Determinar si es un DNI (solo números) o un nombre/apellido (contiene letras)
    const isNumeric = /^\d+$/.test(searchTerm);
    
    let query = `
      SELECT 
        e.Id_Empleado as id,
        e.Nombre as nombre,
        e.Apellido as apellido,
        e.Numero_Documento as dni,
        e.Legajo as legajo,
        r.Nombre_Rol as rol,
        e.Fecha_Desde as fechaIngreso,
        c.Nombre_Categoria AS categoria
      FROM Empleado e
      LEFT JOIN Rol r ON e.Id_Rol = r.Id_Rol
      LEFT JOIN Categoria c ON e.Categoria = c.Id_Categoria
      WHERE `;
    
    let queryParams: any[] = [];
    
    if (isNumeric) {
      // Búsqueda por DNI
      query += `e.Numero_Documento = ?`;
      queryParams = [searchTerm];
    } else {
      // Búsqueda por nombre o apellido (búsqueda parcial con LIKE)
      query += `(e.Nombre LIKE ? OR e.Apellido LIKE ? OR CONCAT(e.Nombre, ' ', e.Apellido) LIKE ?)`;
      const searchPattern = `%${searchTerm}%`;
      queryParams = [searchPattern, searchPattern, searchPattern];
    }

    const [rows]: any = await db.query(query, queryParams);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    // Para cada empleado, calcular vacaciones
    const empleadosConVacaciones = await Promise.all(rows.map(async (empleado: any) => {
      let antiguedad = 0;
      let diasVacaciones = 14;
      let diasTomados = 0;
      let diasDisponibles = 14;
      if (empleado.fechaIngreso) {
        const fechaDesde = new Date(empleado.fechaIngreso);
        const hoy = new Date();
        antiguedad = hoy.getFullYear() - fechaDesde.getFullYear();
        if (
          hoy.getMonth() < fechaDesde.getMonth() ||
          (hoy.getMonth() === fechaDesde.getMonth() && hoy.getDate() < fechaDesde.getDate())
        ) {
          antiguedad--;
        }
        if (antiguedad > 5 && antiguedad <= 10) diasVacaciones = 21;
        else if (antiguedad > 10 && antiguedad <= 20) diasVacaciones = 28;
        else if (antiguedad > 20) diasVacaciones = 35;
      }
      // Consultar licencias consumidas del año actual
      const licenciasVacResult: any = await db.query(
        `SELECT FechaInicio, FechaFin
         FROM Licencia
         WHERE Id_Empleado = ?
           AND Motivo IN ('Vacaciones', 'Personal')
           AND Estado IN ('Pendiente', 'Aprobada')
           AND (YEAR(FechaInicio) = YEAR(CURDATE()) OR YEAR(FechaFin) = YEAR(CURDATE()))`,
        [empleado.id]
      );
      const licenciasVac = licenciasVacResult[0] || [];
      licenciasVac.forEach((lic: any) => {
        const diasLicencia = diffDaysInclusive(lic.FechaInicio, lic.FechaFin);
        if (diasLicencia) {
          diasTomados += diasLicencia;
        }
      });
      diasDisponibles = Math.max(diasVacaciones - diasTomados, 0);
      return {
        id: empleado.id,
        dni: empleado.dni,
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        cuil: empleado.dni, // Si no tienes CUIL, usar DNI
        rol: empleado.rol || "No especificado",
        fechaIngreso: empleado.fechaIngreso
          ? empleado.fechaIngreso.toISOString?.().split("T")[0] : empleado.fechaIngreso || "",
        legajo: empleado.legajo || "",
        categoria: empleado.categoria || null,
        vacaciones: {
          antiguedad,
          diasVacaciones,
          diasTomados,
          diasDisponibles
        }
      };
    }));
    // Si solo hay uno, devolver objeto, si hay varios, array
    if (empleadosConVacaciones.length === 1) {
      res.json(empleadosConVacaciones[0]);
    } else {
      res.json(empleadosConVacaciones);
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error("❌ Error al buscar empleado:", error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

export default router;