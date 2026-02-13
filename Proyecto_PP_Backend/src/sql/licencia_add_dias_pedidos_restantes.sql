-- Agrega columnas para persistir días solicitados y días restantes en licencias
-- Nota: este script es seguro para ejecutar más de una vez en MySQL 8+
ALTER TABLE Licencia
  ADD COLUMN IF NOT EXISTS diasPedidos INT NULL AFTER Estado,
  ADD COLUMN IF NOT EXISTS diasRestantes INT NULL AFTER diasPedidos;
