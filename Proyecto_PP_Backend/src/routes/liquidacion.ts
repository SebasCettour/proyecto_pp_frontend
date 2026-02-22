import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import { pool } from "../models/db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Crear carpeta si no existe
const createUploadDir = () => {
  if (!fs.existsSync("uploads/liquidaciones")) {
    fs.mkdirSync("uploads/liquidaciones", { recursive: true });
  }
};

createUploadDir();

// Configuración de multer para subir archivos PDF de liquidaciones
const storage = multer.diskStorage({
  destination: (
    req: express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, "uploads/liquidaciones/");
  },
  filename: (
    req: express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueName = `liquidacion_${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (
    req: express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos PDF"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Subir liquidación de sueldo
router.post(
  "/subir",
  authenticateToken,
  upload.single("liquidacionPdf"),
  async (req: Request, res: Response) => {
    try {
      const { empleadoId, fechaLiquidacion, total } = req.body;

      console.log("📝 Datos recibidos para liquidación:", req.body);

      if (!empleadoId || !fechaLiquidacion || !total) {
        return res.status(400).json({
          message:
            "Faltan campos obligatorios: empleadoId, fechaLiquidacion, total",
        });
      }

      const [result] = await pool.execute(
        `INSERT INTO Liquidacion (
          Id_Empleado, FechaLiquidacion, Total
        ) VALUES (?, ?, ?)`,
        [empleadoId, fechaLiquidacion, total]
      );

      res.status(201).json({
        message: "Liquidación creada exitosamente",
        liquidacionId: (result as any).insertId,
      });
    } catch (error) {
      console.error("Error creando liquidación:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
);

// Obtener todas las liquidaciones (para contadores)
router.get("/todas", authenticateToken, async (req: Request, res: Response) => {
  try {

    const [liquidaciones] = await pool.execute(
      `SELECT 
          l.Id_Liquidacion,
          l.Id_Empleado,
          l.FechaLiquidacion,
          l.Total,
          e.Nombre, 
          e.Apellido, 
          e.Numero_Documento
         FROM Liquidacion l
         JOIN Empleado e ON l.Id_Empleado = e.Id_Empleado
         ORDER BY l.FechaLiquidacion DESC`
    );

    res.json(liquidaciones);
  } catch (error) {
    console.error("Error obteniendo liquidaciones:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Obtener liquidaciones por empleado (DNI)
router.get(
  "/empleado/:dni",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { dni } = req.params;

      const [liquidaciones] = await pool.execute(
        `SELECT 
          l.Id_Liquidacion,
          l.Id_Empleado,
          l.FechaLiquidacion,
          l.Total,
          e.Nombre, 
          e.Apellido
         FROM Liquidacion l
         JOIN Empleado e ON l.Id_Empleado = e.Id_Empleado
         WHERE e.Numero_Documento = ?
         ORDER BY l.FechaLiquidacion DESC`,
        [dni]
      );

      res.json(liquidaciones);
    } catch (error) {
      console.error("Error obteniendo liquidaciones:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
);

// Calcular liquidación
router.post("/calcular", authenticateToken, async (req: Request, res: Response) => {
  try {
    console.log("🔍 Datos recibidos en /calcular:", JSON.stringify(req.body));
    

    const {
      dni,
      tipoJornada,
      periodo,
      asistenciaActiva,
      sacActivo,
      sumaFijaNoRemunerativa,
      horasExtras50,
      horasExtras100,
      adicionalTrasladoSeleccionado,
      esAfiliadoSindicato,
    } = req.body;

    if (!dni || !tipoJornada) {
      console.log("❌ Faltan campos obligatorios");
      return res.status(400).json({
        message: "Faltan campos obligatorios: dni, tipoJornada",
      });
    }

    console.log("✅ Campos obligatorios OK");
    
    // Obtener datos del empleado y su categoría (JOIN por ID de categoría)
    console.log("📋 Buscando empleado con DNI:", dni);
    const [empleados] = await pool.execute(
      `SELECT e.Id_Empleado, e.Nombre, e.Apellido, e.Fecha_Desde, e.Categoria, c.Sueldo_Basico
       FROM Empleado e
       JOIN Categoria c ON e.Categoria = c.Id_Categoria
       WHERE e.Numero_Documento = ?`,
      [dni]
    );

    console.log("📊 Empleados encontrados:", Array.isArray(empleados) ? empleados.length : 0);

    if (!Array.isArray(empleados) || empleados.length === 0) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    const empleado = empleados[0] as any;
    const sueldoBasico = empleado.Sueldo_Basico;
    const fechaIngreso = new Date(empleado.Fecha_Desde);
    const hoy = new Date();
    let antiguedad = hoy.getFullYear() - fechaIngreso.getFullYear();
    if (
      hoy.getMonth() < fechaIngreso.getMonth() ||
      (hoy.getMonth() === fechaIngreso.getMonth() &&
        hoy.getDate() < fechaIngreso.getDate())
    ) {
      antiguedad--;
    }

    // Obtener conceptos
    const [conceptos] = await pool.execute(
      `SELECT id, nombre, tipo, descripcion, porcentaje, editable, suma_fija_no_remunerativa 
       FROM Conceptos_CCT130_75 
       ORDER BY 
         CASE 
           WHEN tipo = 'descuento' AND nombre LIKE '%Cuota Sindical Afiliado%' THEN 1
           WHEN tipo = 'descuento' AND nombre LIKE '%Cuota Solidaria%' THEN 2
           WHEN tipo = 'descuento' AND nombre LIKE '%Aporte Solidario%' THEN 3
           ELSE id
         END`
    );

    console.log("📊 Conceptos obtenidos:", Array.isArray(conceptos) ? conceptos.length : 0);

    if (!Array.isArray(conceptos)) {
      console.log("❌ Error: conceptos no es un array");
      return res.status(500).json({ message: "Error al obtener conceptos" });
    }

    // Filtrar conceptos según selección
    const conceptosFiltrados = (conceptos as any[]).filter((c: any) => {
      // Filtrar adicionales de traslado: solo incluir el seleccionado
      const esTraslado = c.nombre.toLowerCase().includes("adicional traslado");
      if (esTraslado) {
        return adicionalTrasladoSeleccionado && c.nombre === adicionalTrasladoSeleccionado;
      }

      // Filtrar conceptos de sindicato según afiliación
      const esSindicatoAfiliado = c.nombre.toLowerCase().includes("cuota sindical afiliado");
      const esSindicatoNoAfiliado = c.nombre.toLowerCase().includes("cuota solidaria") || 
                                     c.nombre.toLowerCase().includes("aporte solidario extraordinario");

      if (esSindicatoAfiliado) {
        return esAfiliadoSindicato === true; // Solo si es afiliado
      }

      if (esSindicatoNoAfiliado) {
        return esAfiliadoSindicato === false; // Solo si NO es afiliado
      }

      return true; // Incluir todos los demás conceptos
    });

    console.log(`📊 Conceptos filtrados: ${conceptosFiltrados.length} (traslado: ${adicionalTrasladoSeleccionado || 'ninguno'}, afiliado sindicato: ${esAfiliadoSindicato})`);

    // Horas mensuales por tipo de jornada
    const horasMensuales: Record<string, number> = {
      completa: 192,
      dos_tercios: 128,
      media: 96,
    };

    const horasDelMes = horasMensuales[tipoJornada] || 192;
    
    // Calcular "salario habitual" según Art. 201 LCT
    // Debe incluir: sueldo básico + adicionales habituales remunerativos (ej: antigüedad)
    // Primero calculamos antigüedad
    const adicionalAntiguedad = parseFloat(sueldoBasico) * 0.01 * antiguedad;
    
    // Base para valor hora = Sueldo básico + Antigüedad + otros habituales
    // (La asistencia NO se incluye porque no siempre se cobra)
    const baseParaValorHora = parseFloat(sueldoBasico) + adicionalAntiguedad;
    
    const valorHoraNormal = baseParaValorHora / horasDelMes;
    
    console.log(`📊 Cálculo valor hora: Sueldo básico: ${sueldoBasico} + Antigüedad: ${adicionalAntiguedad} = Base: ${baseParaValorHora} / ${horasDelMes} hs = ${valorHoraNormal} por hora`);

    // PRE-CALCULAR SAC (requiere async por consulta histórica)
    let sacCalculado: number | null = null;
    let diasTrabajadosSemestre = 0; // Para cálculo proporcional
    let diasTotalesSemestre = 182.5; // Promedio de días en medio año (365/2)
    
    if (sacActivo && periodo) {
      const [anio, mes] = periodo.split('-').map(Number);
      
      // Determinar rango de meses del semestre
      let mesesSemestre: string[] = [];
      let fechaInicioSemestre: Date | null = null;
      let fechaFinSemestre: Date | null = null;
      
      if (mes === 6) {
        // Primer semestre: enero a junio
        mesesSemestre = ['01', '02', '03', '04', '05', '06'].map(m => `${anio}-${m.toString().padStart(2, '0')}`);
        fechaInicioSemestre = new Date(anio, 0, 1); // 1 de enero
        fechaFinSemestre = new Date(anio, 5, 30); // 30 de junio
      } else if (mes === 12) {
        // Segundo semestre: julio a diciembre
        mesesSemestre = ['07', '08', '09', '10', '11', '12'].map(m => `${anio}-${m}`);
        fechaInicioSemestre = new Date(anio, 6, 1); // 1 de julio
        fechaFinSemestre = new Date(anio, 11, 31); // 31 de diciembre
      }
      
      if (mesesSemestre.length > 0 && fechaInicioSemestre && fechaFinSemestre) {
        try {
          // Verificar cuántos días trabajó en el semestre
          diasTotalesSemestre = Math.ceil((fechaFinSemestre.getTime() - fechaInicioSemestre.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          
          // Calcular días efectivamente trabajados en el semestre
          diasTrabajadosSemestre = diasTotalesSemestre;
          
          // Si la fecha de ingreso es posterior al inicio del semestre, calcular días proporcionales
          if (fechaIngreso > fechaInicioSemestre) {
            if (fechaIngreso <= fechaFinSemestre) {
              diasTrabajadosSemestre = Math.ceil((fechaFinSemestre.getTime() - fechaIngreso.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              console.log(`📅 Empleado ingresó el ${fechaIngreso.toISOString().split('T')[0]}, días trabajados en semestre: ${diasTrabajadosSemestre} de ${diasTotalesSemestre}`);
            } else {
              // El empleado ingresó después del fin del semestre
              diasTrabajadosSemestre = 0;
              console.log(`⚠️ Empleado ingresó después del semestre`);
            }
          }
          
          // Consultar liquidaciones del semestre para obtener la mejor remuneración
          const [liquidacionesSemestre] = await pool.execute(
            `SELECT TotalHaberes, Periodo
             FROM Liquidacion 
             WHERE Id_Empleado = ? 
             AND Periodo IN (${mesesSemestre.map(() => '?').join(',')})
             ORDER BY TotalHaberes DESC
             LIMIT 1`,
            [empleado.Id_Empleado, ...mesesSemestre]
          );
          
          if (Array.isArray(liquidacionesSemestre) && liquidacionesSemestre.length > 0) {
            // Usar la mejor remuneración histórica del semestre
            const mejorRemuneracion = parseFloat((liquidacionesSemestre[0] as any).TotalHaberes);
            
            // Calcular SAC proporcional si corresponde
            if (diasTrabajadosSemestre < diasTotalesSemestre) {
              // SAC proporcional = (Mejor remuneración × Días trabajados) / (Días del semestre)
              // Fórmula: (365/2) / (Mejor remuneración × Días trabajados)
              // Simplificado: (Mejor remuneración × Días trabajados) / (365/2)
              sacCalculado = (mejorRemuneracion * diasTrabajadosSemestre) / (365 / 2);
              console.log(`📊 SAC PROPORCIONAL: (${mejorRemuneracion} × ${diasTrabajadosSemestre} días) / 182.5 = ${sacCalculado.toFixed(2)}`);
            } else {
              // SAC completo (50% de la mejor remuneración)
              sacCalculado = mejorRemuneracion * 0.5;
              console.log(`📊 SAC COMPLETO: ${mejorRemuneracion} × 0.5 = ${sacCalculado.toFixed(2)}`);
            }
          } else {
            // No hay liquidaciones históricas, calcular sobre haberes del mes actual
            // (se calculará después cuando tengamos todos los conceptos)
            sacCalculado = -1; // Marcador temporal indicando que se debe calcular proporcionalmente sobre mes actual
            console.log(`⚠️ No hay liquidaciones históricas. SAC se calculará sobre haberes del mes actual con ${diasTrabajadosSemestre} días trabajados de ${diasTotalesSemestre}`);
          }
        } catch (error) {
          console.error("❌ Error consultando liquidaciones para SAC:", error);
          sacCalculado = 0;
        }
      } else {
        // Mes no válido para SAC
        sacCalculado = 0;
        console.log("⚠️ SAC solo se calcula en junio o diciembre");
      }
    }

    // Calcular cada concepto
    const conceptosCalculados = conceptosFiltrados.map((c: any) => {
      let valorCalculado = 0;

      // Sueldo básico
      if (c.nombre.toLowerCase() === "sueldo básico") {
        valorCalculado = parseFloat(sueldoBasico);
        console.log(`💵 Sueldo básico: ${valorCalculado}`);
      }
      // Adicional por antigüedad (1% por año sobre sueldo básico)
      else if (
        c.nombre.toLowerCase().includes("adicional por antigüedad") ||
        c.nombre.toLowerCase().includes("antigüedad")
      ) {
        valorCalculado = parseFloat(sueldoBasico) * 0.01 * antiguedad;
        console.log(`📅 Antigüedad: ${sueldoBasico} × 0.01 × ${antiguedad} años = ${valorCalculado}`);
      }
      // Adicional por asistencia (7.5% sobre sueldo básico)
      else if (
        c.nombre.toLowerCase().includes("adicional por asistencia y puntualidad")
      ) {
        if (asistenciaActiva) {
          valorCalculado = parseFloat(sueldoBasico) * parseFloat(c.porcentaje || 0);
          console.log(`✅ Presentismo: ${sueldoBasico} × ${c.porcentaje} = ${valorCalculado}`);
        } else {
          valorCalculado = 0;
          console.log(`❌ Presentismo: desactivado`);
        }
      }
      // SAC (Sueldo Anual Complementario)
      else if (
        c.nombre.toLowerCase().includes("sac") ||
        c.nombre.toLowerCase().includes("aguinaldo")
      ) {
        // Usar el valor pre-calculado
        valorCalculado = sacCalculado !== null ? sacCalculado : 0;
        console.log(`🎁 SAC: ${valorCalculado}`);
      }
      // Suma fija no remunerativa
      else if (c.suma_fija_no_remunerativa !== null && c.suma_fija_no_remunerativa !== undefined) {
        const montoIngresado = parseFloat(sumaFijaNoRemunerativa || 0);
        valorCalculado = montoIngresado > 0 ? montoIngresado : 0;
        console.log(`💰 Suma fija no remunerativa: ${valorCalculado}`);
      }
      // Horas extras 50%
      else if (c.nombre.toLowerCase().includes("horas extras al 50")) {
        const cantidadHoras = parseFloat(horasExtras50 || 0);
        valorCalculado = cantidadHoras * valorHoraNormal * 1.5;
        console.log(`⏰ Horas extras 50%: ${cantidadHoras} hs × ${valorHoraNormal.toFixed(2)} × 1.5 = ${valorCalculado}`);
      }
      // Horas extras 100%
      else if (c.nombre.toLowerCase().includes("horas extras al 100")) {
        const cantidadHoras = parseFloat(horasExtras100 || 0);
        valorCalculado = cantidadHoras * valorHoraNormal * 2;
        console.log(`⏰ Horas extras 100%: ${cantidadHoras} hs × ${valorHoraNormal.toFixed(2)} × 2 = ${valorCalculado}`);
      }
      // Descuentos - NO se calculan aquí, se calcularán después
      else if (c.tipo === 'descuento') {
        valorCalculado = 0; // Temporal
        console.log(`⏸️ Descuento ${c.nombre}: se calculará después sobre base completa`);
      }
      // Otros adicionales con porcentaje fijo (sobre sueldo básico)
      else if (c.porcentaje && !c.editable && c.tipo !== 'descuento') {
        valorCalculado = parseFloat(sueldoBasico) * parseFloat(c.porcentaje);
        console.log(`📊 ${c.nombre}: ${sueldoBasico} × ${c.porcentaje} = ${valorCalculado}`);
      }

      return {
        id: c.id,
        nombre: c.nombre,
        tipo: c.tipo,
        porcentaje: c.porcentaje,
        valorCalculado: Math.round(valorCalculado * 100) / 100,
      };
    });

    // POST-PROCESAMIENTO SAC: Si no había liquidaciones históricas, calcular sobre haberes del mes actual
    if (sacCalculado === -1) {
      const totalHaberesMesActual = conceptosCalculados
        .filter((c: any) => c.tipo === 'haber')
        .reduce((sum: number, c: any) => sum + c.valorCalculado, 0);
      
      const sacIndex = conceptosCalculados.findIndex((c: any) => 
        c.nombre.toLowerCase().includes("sac") || c.nombre.toLowerCase().includes("aguinaldo")
      );
      
      if (sacIndex !== -1) {
        // Calcular SAC proporcional o completo según días trabajados
        if (diasTrabajadosSemestre < diasTotalesSemestre && diasTrabajadosSemestre > 0) {
          // SAC proporcional = (Haberes mes actual × Días trabajados) / (365/2)
          conceptosCalculados[sacIndex].valorCalculado = Math.round((totalHaberesMesActual * diasTrabajadosSemestre) / (365 / 2) * 100) / 100;
          console.log(`📊 SAC PROPORCIONAL sobre mes actual: (${totalHaberesMesActual} × ${diasTrabajadosSemestre} días) / 182.5 = ${conceptosCalculados[sacIndex].valorCalculado}`);
        } else {
          // SAC completo (50% de haberes)
          conceptosCalculados[sacIndex].valorCalculado = Math.round(totalHaberesMesActual * 0.5 * 100) / 100;
          console.log(`📊 SAC COMPLETO sobre mes actual: ${totalHaberesMesActual} × 0.5 = ${conceptosCalculados[sacIndex].valorCalculado}`);
        }
      }
    }

    // CALCULAR BASE PARA DESCUENTOS
    // Base = Sueldo básico + Presentismo + Antigüedad + SAC (si corresponde)
    const sueldoBasicoNum = parseFloat(sueldoBasico);
    
    const antiguedadConcepto = conceptosCalculados.find((c: any) => 
      c.nombre.toLowerCase().includes("adicional por antigüedad") ||
      c.nombre.toLowerCase().includes("antigüedad")
    );
    const antiguedadValor = antiguedadConcepto ? antiguedadConcepto.valorCalculado : 0;
    
    const presentismoConcepto = conceptosCalculados.find((c: any) =>
      c.nombre.toLowerCase().includes("adicional por asistencia y puntualidad")
    );
    const presentismoValor = presentismoConcepto && asistenciaActiva ? presentismoConcepto.valorCalculado : 0;
    
    const sacConcepto = conceptosCalculados.find((c: any) =>
      c.nombre.toLowerCase().includes("sac") || c.nombre.toLowerCase().includes("aguinaldo")
    );
    const sacValor = sacConcepto && sacActivo ? sacConcepto.valorCalculado : 0;
    
    const baseParaDescuentos = sueldoBasicoNum + antiguedadValor + presentismoValor + sacValor;
    
    console.log(`📊 Base para descuentos: Sueldo básico (${sueldoBasicoNum}) + Antigüedad (${antiguedadValor}) + Presentismo (${presentismoValor}) + SAC (${sacValor}) = ${baseParaDescuentos}`);

    // RECALCULAR DESCUENTOS CON LA BASE CORRECTA
    conceptosCalculados.forEach((c: any) => {
      if (c.tipo === 'descuento' && c.porcentaje) {
        c.valorCalculado = Math.round(baseParaDescuentos * parseFloat(c.porcentaje) * 100) / 100;
        console.log(`💳 Descuento ${c.nombre}: ${baseParaDescuentos} × ${c.porcentaje} = ${c.valorCalculado}`);
      }
    });

    console.log("✅ Calculando response...");
    const response = {
      empleado: {
        id: empleado.Id_Empleado,
        nombre: empleado.Nombre,
        apellido: empleado.Apellido,
        antiguedad,
      },
      valorHoraNormal: Math.round(valorHoraNormal * 100) / 100,
      conceptos: conceptosCalculados,
    };
    
    console.log("✅ Response generado, enviando...");
    res.json(response);
  } catch (error) {
    console.error("❌ Error calculando liquidación:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Guardar liquidación completa
router.post("/guardar", authenticateToken, async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      idEmpleado,
      periodo,
      totalRemunerativo,
      totalNoRemunerativo,
      totalHaberes,
      totalDescuentos,
      netoAPagar,
      sumaFijaNoRemunerativa,
      horasExtras50,
      horasExtras100,
      sacActivo,
      asistenciaActiva,
      esAfiliadoSindicato,
      adicionalTrasladoSeleccionado,
      tipoJornada,
      conceptosDetalle, // Array de { concepto: string, monto: number }
      estado = 'borrador'
    } = req.body;

    console.log("💾 Guardando liquidación:", { idEmpleado, periodo, netoAPagar });

    // Validaciones
    if (!idEmpleado || !periodo || !totalHaberes || !totalDescuentos || netoAPagar === undefined) {
      await connection.rollback();
      return res.status(400).json({
        message: "Faltan campos obligatorios: idEmpleado, periodo, totalHaberes, totalDescuentos, netoAPagar"
      });
    }

    // Insertar en tabla Liquidacion
    const [result] = await connection.execute(
      `INSERT INTO Liquidacion (
        Id_Empleado,
        Periodo,
        Total,
        TotalRemunerativo,
        TotalNoRemunerativo,
        TotalHaberes,
        TotalDescuentos,
        NetoAPagar,
        SumaFijaNoRemunerativa,
        HorasExtras50,
        HorasExtras100,
        SACActivo,
        AsistenciaActiva,
        EsAfiliadoSindicato,
        AdicionalTrasladoSeleccionado,
        TipoJornada,
        Estado,
        FechaLiquidacion,
        FechaGeneracion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        idEmpleado,
        periodo,
        netoAPagar, // Total (campo legacy)
        totalRemunerativo,
        totalNoRemunerativo,
        totalHaberes,
        totalDescuentos,
        netoAPagar,
        sumaFijaNoRemunerativa || 0,
        horasExtras50 || 0,
        horasExtras100 || 0,
        sacActivo || false,
        asistenciaActiva !== undefined ? asistenciaActiva : true,
        esAfiliadoSindicato !== undefined ? esAfiliadoSindicato : true,
        adicionalTrasladoSeleccionado || null,
        tipoJornada || 'completa',
        estado,
        periodo + '-01' // FechaLiquidacion como primer día del periodo
      ]
    );

    const idLiquidacion = (result as any).insertId;
    console.log("✅ Liquidación guardada con ID:", idLiquidacion);

    // Insertar detalles
    if (conceptosDetalle && Array.isArray(conceptosDetalle) && conceptosDetalle.length > 0) {
      const detalleValues = conceptosDetalle
        .filter((c: any) => c.monto !== 0) // Solo guardar conceptos con monto
        .map((c: any) => [idLiquidacion, c.concepto, c.monto]);

      if (detalleValues.length > 0) {
        await connection.query(
          `INSERT INTO Detalle_Liquidacion (Id_Liquidacion, Concepto, Monto) VALUES ?`,
          [detalleValues]
        );
        console.log(`✅ ${detalleValues.length} detalles guardados`);
      }
    }

    await connection.commit();
    
    res.status(201).json({
      message: "Liquidación guardada exitosamente",
      idLiquidacion,
      periodo,
      netoAPagar
    });

  } catch (error) {
    await connection.rollback();
    console.error("❌ Error guardando liquidación:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  } finally {
    connection.release();
  }
});

// Buscar liquidaciones por DNI o Nombre/Apellido
router.get("/buscar", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    if (!search || typeof search !== 'string') {
      return res.status(400).json({ message: "Parámetro de búsqueda requerido" });
    }

    console.log("🔍 Buscando liquidaciones con:", search);

    // Buscar por DNI o Nombre/Apellido
    const [liquidaciones] = await pool.execute(
      `SELECT 
        l.*,
        e.Nombre as EmpleadoNombre,
        e.Apellido as EmpleadoApellido,
        e.Numero_Documento as EmpleadoDNI
      FROM Liquidacion l
      INNER JOIN Empleado e ON l.Id_Empleado = e.Id_Empleado
      WHERE 
        e.Numero_Documento LIKE ? OR
        CONCAT(e.Nombre, ' ', e.Apellido) LIKE ? OR
        CONCAT(e.Apellido, ' ', e.Nombre) LIKE ? OR
        e.Nombre LIKE ? OR
        e.Apellido LIKE ?
      ORDER BY l.Periodo DESC, l.FechaGeneracion DESC`,
      [
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`
      ]
    );

    console.log(`✅ ${Array.isArray(liquidaciones) ? liquidaciones.length : 0} liquidaciones encontradas`);
    res.json(liquidaciones);

  } catch (error) {
    console.error("❌ Error buscando liquidaciones:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Obtener detalle de una liquidación específica
router.get("/:id/detalle", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log("📋 Obteniendo detalle de liquidación:", id);

    const [detalles] = await pool.execute(
      `SELECT * FROM Detalle_Liquidacion WHERE Id_Liquidacion = ? ORDER BY Id_DetalleLiquidacion`,
      [id]
    );

    res.json(detalles);

  } catch (error) {
    console.error("❌ Error obteniendo detalle:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// ==================== GENERAR PDF ====================
router.post("/:id/generar-pdf", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("📄 Generando PDF para liquidación:", id);

    // Obtener datos de la liquidación
    const [liquidaciones]: any = await pool.execute(
      `SELECT l.*, e.Nombre, e.Apellido, e.Numero_Documento,
              emp.Nombre_Empresa, emp.CUIL_CUIT, emp.Direccion
       FROM Liquidacion l
       INNER JOIN Empleado e ON l.Id_Empleado = e.Id_Empleado
       LEFT JOIN Empresa emp ON e.Id_Empresa = emp.Id_Empresa
       WHERE l.Id_Liquidacion = ?`,
      [id]
    );

    if (!liquidaciones || liquidaciones.length === 0) {
      return res.status(404).json({ message: "Liquidación no encontrada" });
    }

    const liquidacion = liquidaciones[0];

    // Obtener detalle de conceptos
    const [detalles]: any = await pool.execute(
      `SELECT * FROM Detalle_Liquidacion WHERE Id_Liquidacion = ? ORDER BY Id_DetalleLiquidacion`,
      [id]
    );

    // Crear directorio si no existe
    const uploadsDir = path.join(process.cwd(), "uploads", "recibos");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Nombre del archivo
    const fileName = `recibo_${liquidacion.Numero_Documento}_${liquidacion.Periodo.replace(/\//g, "-")}_${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileName);
    const relativePath = `uploads/recibos/${fileName}`;

    // Crear PDF
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // MEMBRETE EMPRESA MEJORADO
    // Fondo azul claro para el encabezado
    const encabezadoY = doc.y;
    doc.save();
    doc.rect(40, encabezadoY, 515, 70).fill('#e3f2fd');
    doc.restore();
    doc.fontSize(22).font("Helvetica-Bold").fillColor("#1976d2").text(liquidacion.Nombre_Empresa || "Empresa", 40, encabezadoY + 10, { align: "center", width: 515 });
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#333").text(`CUIT: ${liquidacion.CUIL_CUIT || "N/A"}`, 40, encabezadoY + 38, { align: "center", width: 515 });
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#333").text(`Domicilio: ${liquidacion.Direccion || "N/A"}`, 40, encabezadoY + 54, { align: "center", width: 515 });
    doc.moveDown(3.5);
    doc.fontSize(18).font("Helvetica-Bold").fillColor("#000").text("RECIBO DE SUELDO", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica").fillColor("#000").text(`Período: ${liquidacion.Periodo}`, { align: "center" });
    doc.fontSize(9).fillColor("#000").text(`Fecha de liquidación: ${new Date(liquidacion.FechaLiquidacion).toLocaleDateString("es-AR")}`, { align: "center" });
    doc.moveDown(1.5);

    // DATOS DEL EMPLEADO
    doc.fontSize(11).font("Helvetica-Bold").text("EMPLEADO", { underline: true });
    doc.fontSize(9).font("Helvetica");
    doc.text(`Apellido y Nombre: ${liquidacion.Apellido}, ${liquidacion.Nombre}`);
    doc.text(`DNI: ${liquidacion.Numero_Documento}`);
    doc.text(`Tipo de Jornada: ${liquidacion.TipoJornada || "N/A"}`);
    doc.moveDown(1.5);

    // TABLA DE CONCEPTOS
    doc.fontSize(11).font("Helvetica-Bold").text("DETALLE DE LIQUIDACIÓN", { underline: true });
    doc.moveDown(0.5);

    const startY = doc.y;
    const tableLeft = 50;
    const tableRight = 550;
    const colConcepto = tableLeft;
    const colMonto = 430;
    const rowHeight = 20;
    const conceptoColumnWidth = colMonto - colConcepto - 10;
    const montoColumnWidth = tableRight - colMonto;

    const formatCurrency = (value: number) =>
      `$ ${Number(value).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    const drawConceptRow = (
      concepto: string,
      monto: number,
      y: number,
      options?: { amountBold?: boolean; absAmount?: boolean }
    ) => {
      const montoValue = options?.absAmount ? Math.abs(monto) : monto;
      const montoText = formatCurrency(montoValue);

      const safeConcepto = (concepto || "").trim();
      const maxConceptoChars = 45;
      const conceptoCorto =
        safeConcepto.length > maxConceptoChars
          ? `${safeConcepto.slice(0, maxConceptoChars - 3)}...`
          : safeConcepto;

      doc.font("Helvetica").fontSize(8).fillColor("#000");
      doc.text(conceptoCorto, colConcepto, y, {
        width: conceptoColumnWidth,
        align: "left",
        lineBreak: false,
      });

      const conceptoWidth = doc.widthOfString(conceptoCorto);
      const dotsStartX = colConcepto + conceptoWidth + 4;
      const dotsEndX = colMonto - 8;

      if (dotsEndX > dotsStartX) {
        const dotWidth = doc.widthOfString(".");
        const dotsCount = Math.floor((dotsEndX - dotsStartX) / dotWidth);
        if (dotsCount > 1) {
          doc.fillColor("#666").text(".".repeat(dotsCount), dotsStartX, y, {
            lineBreak: false,
          });
        }
      }

      doc
        .font(options?.amountBold ? "Courier-Bold" : "Courier")
        .fontSize(8)
        .fillColor("#000")
        .text(montoText, colMonto, y, {
          width: montoColumnWidth,
          align: "right",
          lineBreak: false,
        });
    };

    // Cabecera de tabla
    doc.fontSize(9).font("Helvetica-Bold");
    doc.text("CONCEPTO", colConcepto, startY);
    doc.text("MONTO", colMonto, startY, { width: montoColumnWidth, align: "right" });
    doc.moveTo(colConcepto, startY + 15).lineTo(tableRight, startY + 15).stroke();

    let currentY = startY + rowHeight;
    doc.font("Helvetica").fontSize(8);

    // Separar haberes y descuentos por nombre del concepto
    const conceptosHaberes = detalles.filter((d: any) => {
      const concepto = d.Concepto.toLowerCase();
      return !concepto.includes('descuento') && 
             !concepto.includes('jubilación') && 
             !concepto.includes('pami') && 
             !concepto.includes('obra social') && 
             !concepto.includes('sindical') && 
             !concepto.includes('cuota');
    });

    const conceptosDescuentos = detalles.filter((d: any) => {
      const concepto = d.Concepto.toLowerCase();
      return concepto.includes('descuento') || 
             concepto.includes('jubilación') || 
             concepto.includes('pami') || 
             concepto.includes('obra social') || 
             concepto.includes('sindical') || 
             concepto.includes('cuota');
    });

    // HABERES
    let totalHaberes = 0;
    conceptosHaberes.forEach((detalle: any) => {
      drawConceptRow(detalle.Concepto, Number(detalle.Monto), currentY);
      totalHaberes += parseFloat(detalle.Monto);
      currentY += rowHeight;
    });

    // Línea separadora
    doc.moveTo(colConcepto, currentY).lineTo(tableRight, currentY).stroke();
    currentY += 10;

    // DESCUENTOS
    let totalDescuentos = 0;
    doc.font("Helvetica-Bold").text("DESCUENTOS", colConcepto, currentY);
    currentY += rowHeight;
    doc.font("Helvetica");

    conceptosDescuentos.forEach((detalle: any) => {
      drawConceptRow(detalle.Concepto, Number(detalle.Monto), currentY, {
        absAmount: true,
      });
      totalDescuentos += Math.abs(parseFloat(detalle.Monto));
      currentY += rowHeight;
    });

    // Línea separadora
    doc.moveTo(colConcepto, currentY).lineTo(tableRight, currentY).stroke();
    currentY += 15;

    // TOTALES
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Total Remunerativo:", colConcepto, currentY);
    doc.font("Courier-Bold");
    doc.text(formatCurrency(Number(liquidacion.TotalRemunerativo || 0)), colMonto, currentY, {
      width: montoColumnWidth,
      align: "right",
    });
    currentY += rowHeight;

    doc.font("Helvetica-Bold");
    doc.text("Total No Remunerativo:", colConcepto, currentY);
    doc.font("Courier-Bold");
    doc.text(formatCurrency(Number(liquidacion.TotalNoRemunerativo || 0)), colMonto, currentY, {
      width: montoColumnWidth,
      align: "right",
    });
    currentY += rowHeight;

    doc.font("Helvetica-Bold");
    doc.text("Total Haberes:", colConcepto, currentY);
    doc.font("Courier-Bold");
    doc.text(formatCurrency(Number(liquidacion.TotalHaberes || 0)), colMonto, currentY, {
      width: montoColumnWidth,
      align: "right",
    });
    currentY += rowHeight;

    doc.font("Helvetica-Bold");
    doc.text("Total Descuentos:", colConcepto, currentY);
    doc.font("Courier-Bold");
    doc.text(formatCurrency(Number(liquidacion.TotalDescuentos || 0)), colMonto, currentY, {
      width: montoColumnWidth,
      align: "right",
    });
    currentY += rowHeight + 5;

    // NETO A COBRAR (destacado)
    doc.fontSize(12).fillColor("#1976d2");
    doc.rect(colConcepto - 10, currentY - 5, tableRight - colConcepto + 10, 30).fill("#e3f2fd");
    doc.fillColor("#000000");
    doc.font("Helvetica-Bold");
    doc.text("NETO A COBRAR:", colConcepto, currentY);
    doc.font("Courier-Bold");
    doc.text(formatCurrency(Number(liquidacion.NetoAPagar || 0)), colMonto, currentY, {
      width: montoColumnWidth,
      align: "right",
    });

    // FOOTER
    doc.fontSize(7).font("Helvetica").fillColor("#666666");
    doc.text(
      `Generado el ${new Date().toLocaleString("es-AR")} | Estado: ${liquidacion.Estado}`,
      50,
      doc.page.height - 50,
      { align: "center" }
    );

    doc.end();

    // Esperar a que termine de escribirse
    writeStream.on("finish", async () => {
      try {
        // Guardar en la BD
        await pool.execute(
          `INSERT INTO PDF_Liquidacion (Id_Liquidacion, Nombre_Archivo, Ruta_Archivo) 
           VALUES (?, ?, ?)`,
          [id, fileName, relativePath]
        );

        res.json({
          message: "PDF generado exitosamente",
          fileName,
          filePath: relativePath
        });
      } catch (dbError) {
        console.error("❌ Error guardando en BD:", dbError);
        res.status(500).json({ message: "PDF generado pero no se pudo registrar en BD" });
      }
    });

    writeStream.on("error", (err) => {
      console.error("❌ Error escribiendo PDF:", err);
      res.status(500).json({ message: "Error generando PDF" });
    });

  } catch (error) {
    console.error("❌ Error generando PDF:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// ==================== DESCARGAR PDF ====================
router.get("/:id/pdf", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("📥 Descargando PDF de liquidación:", id);

    // Buscar el PDF más reciente de esta liquidación
    const [pdfs]: any = await pool.execute(
      `SELECT * FROM PDF_Liquidacion 
       WHERE Id_Liquidacion = ? 
       ORDER BY Fecha_Generacion DESC 
       LIMIT 1`,
      [id]
    );

    if (!pdfs || pdfs.length === 0) {
      return res.status(404).json({ message: "PDF no encontrado. Debe generarlo primero." });
    }

    const pdf = pdfs[0];
    const filePath = path.join(process.cwd(), pdf.Ruta_Archivo);

    // Verificar que existe el archivo
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Archivo PDF no encontrado en el servidor" });
    }

    // Enviar el archivo
    res.download(filePath, pdf.Nombre_Archivo, (err) => {
      if (err) {
        console.error("❌ Error descargando PDF:", err);
        res.status(500).json({ message: "Error al descargar el PDF" });
      }
    });

  } catch (error) {
    console.error("❌ Error descargando PDF:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Obtener sueldo básico por empleado (por DNI)
router.get("/empleado/:dni/sueldo-basico", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { dni } = req.params;
    // JOIN por ID de categoría
    const [rows] = await pool.execute(
      `SELECT c.Nombre_Categoria, c.Sueldo_Basico, c.Suma_Fija_No_Remunerativa
         FROM Empleado e
         JOIN Categoria c ON e.Categoria = c.Id_Categoria
        WHERE e.Numero_Documento = ?`,
      [dni]
    );
    const result = Array.isArray(rows) ? rows as any[] : [];
    if (result.length > 0) {
      res.json({
        sueldoBasico: result[0].Sueldo_Basico,
        sumaFijaNoRemunerativa: result[0].Suma_Fija_No_Remunerativa ?? 0,
      });
    } else {
      res.status(404).json({ message: "Empleado o categoría no encontrada" });
    }
  } catch (error) {
    console.error("Error obteniendo sueldo básico:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;
