import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
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
    // ✅ CONSULTA CORREGIDA CON LOS CAMPOS REALES
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
      sueldoBasico,
      tipoJornada,
      periodo,
      asistenciaActiva,
      sacActivo,
      sumaFijaNoRemunerativa,
      horasExtras50,
      horasExtras100,
      adicionalTrasladoSeleccionado,
    } = req.body;

    if (!dni || !sueldoBasico || !tipoJornada) {
      console.log("❌ Faltan campos obligatorios");
      return res.status(400).json({
        message: "Faltan campos obligatorios: dni, sueldoBasico, tipoJornada",
      });
    }

    console.log("✅ Campos obligatorios OK");
    
    // Obtener datos del empleado
    console.log("📋 Buscando empleado con DNI:", dni);
    const [empleados] = await pool.execute(
      `SELECT Id_Empleado, Nombre, Apellido, Fecha_Desde 
       FROM Empleado 
       WHERE Numero_Documento = ?`,
      [dni]
    );

    console.log("📊 Empleados encontrados:", Array.isArray(empleados) ? empleados.length : 0);

    if (!Array.isArray(empleados) || empleados.length === 0) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    const empleado = empleados[0] as any;
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
       ORDER BY id`
    );

    console.log("📊 Conceptos obtenidos:", Array.isArray(conceptos) ? conceptos.length : 0);

    if (!Array.isArray(conceptos)) {
      console.log("❌ Error: conceptos no es un array");
      return res.status(500).json({ message: "Error al obtener conceptos" });
    }

    // Filtrar conceptos de traslado: solo incluir el seleccionado
    const conceptosFiltrados = (conceptos as any[]).filter((c: any) => {
      const esTraslado = c.nombre.toLowerCase().includes("adicional traslado");
      if (esTraslado) {
        // Solo incluir si coincide con el seleccionado
        return adicionalTrasladoSeleccionado && c.nombre === adicionalTrasladoSeleccionado;
      }
      return true; // Incluir todos los demás conceptos
    });

    console.log(`📊 Conceptos filtrados: ${conceptosFiltrados.length} (traslado seleccionado: ${adicionalTrasladoSeleccionado || 'ninguno'})`);

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
    
    if (sacActivo && periodo) {
      const [anio, mes] = periodo.split('-').map(Number);
      
      // Determinar rango de meses del semestre
      let mesesSemestre: string[] = [];
      if (mes === 6) {
        // Primer semestre: enero a junio
        mesesSemestre = ['01', '02', '03', '04', '05', '06'].map(m => `${anio}-${m.toString().padStart(2, '0')}`);
      } else if (mes === 12) {
        // Segundo semestre: julio a diciembre
        mesesSemestre = ['07', '08', '09', '10', '11', '12'].map(m => `${anio}-${m}`);
      }
      
      if (mesesSemestre.length > 0) {
        try {
          // Consultar liquidaciones del semestre
          const [liquidacionesSemestre] = await pool.execute(
            `SELECT TotalHaberes 
             FROM Liquidacion 
             WHERE Id_Empleado = ? 
             AND Periodo IN (${mesesSemestre.map(() => '?').join(',')})
             ORDER BY TotalHaberes DESC
             LIMIT 1`,
            [empleado.Id_Empleado, ...mesesSemestre]
          );
          
          if (Array.isArray(liquidacionesSemestre) && liquidacionesSemestre.length > 0) {
            // Usar la mejor remuneración histórica
            const mejorRemuneracion = (liquidacionesSemestre[0] as any).TotalHaberes;
            sacCalculado = parseFloat(mejorRemuneracion) * 0.5;
            console.log(`📊 SAC calculado sobre mejor remuneración histórica: ${mejorRemuneracion} -> ${sacCalculado}`);
          } else {
            // No hay liquidaciones históricas, calcular sobre haberes del mes actual
            // (se calculará después cuando tengamos todos los conceptos)
            sacCalculado = -1; // Marcador temporal
            console.log("⚠️ No hay liquidaciones históricas, SAC se calculará sobre haberes del mes actual");
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
        conceptosCalculados[sacIndex].valorCalculado = Math.round(totalHaberesMesActual * 0.5 * 100) / 100;
        console.log(`📊 SAC calculado sobre haberes del mes actual: ${totalHaberesMesActual} -> ${conceptosCalculados[sacIndex].valorCalculado}`);
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

export default router;
