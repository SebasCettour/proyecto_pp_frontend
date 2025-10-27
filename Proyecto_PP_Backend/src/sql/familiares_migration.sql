-- Tabla Familiares para grupo familiar de empleados
CREATE TABLE IF NOT EXISTS Familiares (
    Id_Familiar INT AUTO_INCREMENT PRIMARY KEY,
    Id_Empleado INT NOT NULL,
    Nombre VARCHAR(100) NOT NULL,
    Parentesco ENUM('Padre','Madre','Cónyuge','Hijo','Hija') NOT NULL,
    Fecha_Nacimiento DATE NOT NULL,
    Tipo_Documento ENUM('DNI','Pasaporte','LC','LE','Certificado de Nacimiento') NOT NULL,
    Numero_Documento VARCHAR(50) NOT NULL,
    Fecha_Registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Id_Empleado) REFERENCES Empleado(Id_Empleado) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;