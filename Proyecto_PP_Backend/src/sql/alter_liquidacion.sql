-- Agregar columnas a la tabla Liquidacion para almacenar información completa
-- Se agregan una por una para evitar errores si alguna ya existe

ALTER TABLE Liquidacion ADD COLUMN TotalRemunerativo DECIMAL(10,2) DEFAULT 0 COMMENT 'Total de conceptos remunerativos';
ALTER TABLE Liquidacion ADD COLUMN TotalNoRemunerativo DECIMAL(10,2) DEFAULT 0 COMMENT 'Total de conceptos no remunerativos';
ALTER TABLE Liquidacion ADD COLUMN NetoAPagar DECIMAL(10,2) DEFAULT 0 COMMENT 'Neto a cobrar (haberes - descuentos)';
ALTER TABLE Liquidacion ADD COLUMN SumaFijaNoRemunerativa DECIMAL(10,2) DEFAULT 0 COMMENT 'Monto suma fija no remunerativa';
ALTER TABLE Liquidacion ADD COLUMN HorasExtras50 DECIMAL(5,2) DEFAULT 0 COMMENT 'Cantidad horas extras al 50%';
ALTER TABLE Liquidacion ADD COLUMN HorasExtras100 DECIMAL(5,2) DEFAULT 0 COMMENT 'Cantidad horas extras al 100%';
ALTER TABLE Liquidacion ADD COLUMN SACActivo BOOLEAN DEFAULT FALSE COMMENT 'Si se incluyo SAC';
ALTER TABLE Liquidacion ADD COLUMN AsistenciaActiva BOOLEAN DEFAULT TRUE COMMENT 'Si se incluyo presentismo';
ALTER TABLE Liquidacion ADD COLUMN EsAfiliadoSindicato BOOLEAN DEFAULT TRUE COMMENT 'Si es afiliado al sindicato';
ALTER TABLE Liquidacion ADD COLUMN AdicionalTrasladoSeleccionado VARCHAR(150) COMMENT 'Adicional de traslado seleccionado';
ALTER TABLE Liquidacion ADD COLUMN TipoJornada ENUM('completa', 'dos_tercios', 'media') DEFAULT 'completa';
ALTER TABLE Liquidacion ADD COLUMN FechaGeneracion TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de generacion de la liquidacion';
ALTER TABLE Liquidacion ADD COLUMN Estado ENUM('borrador', 'confirmada', 'pagada') DEFAULT 'borrador' COMMENT 'Estado de la liquidacion';


