-- Convierte Novedad.Fecha a DATETIME para guardar fecha + hora reales de publicación
-- Ejecutar una sola vez en la base de datos correspondiente.

ALTER TABLE Novedad
  MODIFY COLUMN Fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
