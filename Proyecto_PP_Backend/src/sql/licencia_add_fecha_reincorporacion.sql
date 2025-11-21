-- Agrega la columna FechaReincorporacion a la tabla Licencia
ALTER TABLE Licencia ADD COLUMN FechaReincorporacion DATE AFTER FechaFin;