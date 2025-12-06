import express, { Request, Response } from "express";
import { pool as db } from "../models/db.js";
import bcrypt from "bcrypt";

const router = express.Router();

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
    const [rows]: any = await db.query(
      `SELECT e.*, c.Nombre AS Categoria
       FROM ProyectoPP.Empleado e
       LEFT JOIN ProyectoPP.Categorias c ON e.Id_Categoria = c.Id_Categoria
       WHERE e.Numero_Documento = ?`,
      [dni]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(rows[0]);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error al buscar usuario:", error);
    res.status(500).json({ error: "Error al buscar usuario" });
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
    Correo_Electronico,
    Domicilio,
    Estado_Civil,
    Fecha_Desde,
    Fecha_Nacimiento,
    Legajo,
    Telefono,
    Tipo_Documento,
    Numero_Documento,
  } = req.body;

  try {
    // ✅ ACTUALIZAR CON NOMBRES CORRECTOS
    const [result]: any = await db.query(
      `UPDATE Empleado SET
        Nombre = ?,
        Apellido = ?,
        Correo_Electronico = ?,
        Domicilio = ?,
        Estado_Civil = ?,
        Fecha_Desde = ?,
        Fecha_Nacimiento = ?,
        Legajo = ?,
        Telefono = ?,
        Tipo_Documento = ?,
        Numero_Documento = ?
      WHERE Numero_Documento = ?`,
      [
        Nombre,
        Apellido,
        Correo_Electronico,
        Domicilio,
        Estado_Civil,
        Fecha_Desde,
        Fecha_Nacimiento,
        Legajo,
        Telefono,
        Tipo_Documento,
        Numero_Documento,
        dni,
      ]
    );

    // Actualizar en Usuarios (si existe)
    await db.query(
      `UPDATE Usuarios SET
        Nombre_Usuario = ?,
        Correo_Electronico = ?,
        Numero_Documento = ?
      WHERE Numero_Documento = ?`,
      [`${Nombre} ${Apellido}`, Correo_Electronico, Numero_Documento, dni]
    );

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
        c.Nombre AS categoria
      FROM Empleado e
      LEFT JOIN Rol r ON e.Id_Rol = r.Id_Rol
      LEFT JOIN Categorias c ON e.Id_Categoria = c.Id_Categoria
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

    // Si hay múltiples resultados, devolver array; si hay uno solo, devolver objeto
    if (rows.length === 1) {
      const empleado = rows[0];
      const response = {
        id: empleado.id,
        dni: empleado.dni,
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        cuil: empleado.dni, // Si no tienes CUIL, usar DNI
        rol: empleado.rol || "No especificado",
        fechaIngreso: empleado.fechaIngreso
          ? empleado.fechaIngreso.toISOString?.().split("T")[0] : empleado.fechaIngreso || "",
        legajo: empleado.legajo || "",
        categoria: empleado.categoria || null
      };
      res.json(response);
    } else {
      // Múltiples resultados - devolver array
      const response = rows.map((empleado: any) => ({
        id: empleado.id,
        dni: empleado.dni,
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        cuil: empleado.dni,
        rol: empleado.rol || "No especificado",
        fechaIngreso: empleado.fechaIngreso
          ? empleado.fechaIngreso.toISOString?.().split("T")[0] : empleado.fechaIngreso || "",
        legajo: empleado.legajo || "",
        categoria: empleado.categoria || null
      }));
      res.json(response);
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
