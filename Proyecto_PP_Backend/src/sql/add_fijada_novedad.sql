-- Agrega columna para marcar novedades importantes/fijadas en el tablon.
-- Ejecutar una sola vez en la base de datos correspondiente.

ALTER TABLE Novedad
  ADD COLUMN Fijada TINYINT NOT NULL DEFAULT 0;
