-- Agrega columna para borrado lógico en Usuarios
ALTER TABLE Usuarios ADD COLUMN Activo BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Borrado lógico';

-- Agrega columna para borrado lógico en Empleado
ALTER TABLE Empleado ADD COLUMN Activo BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Borrado lógico';
