-- Agrega la columna Fecha_Actualizacion a la tabla Categoria si no existe
toDo: ejecutar en MySQL
ALTER TABLE Categoria ADD COLUMN Fecha_Actualizacion DATETIME NULL AFTER Ultimo_Sueldo_Basico;