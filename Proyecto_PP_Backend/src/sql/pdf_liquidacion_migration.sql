-- Tabla para registrar los PDFs generados de liquidaciones
CREATE TABLE IF NOT EXISTS PDF_Liquidacion (
    Id_PDF INT AUTO_INCREMENT PRIMARY KEY,
    Id_Liquidacion INT NOT NULL,
    Nombre_Archivo VARCHAR(255) NOT NULL,
    Ruta_Archivo VARCHAR(500) NOT NULL,
    Fecha_Generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Id_Liquidacion) REFERENCES Liquidacion(Id_Liquidacion) ON DELETE CASCADE,
    INDEX idx_id_liquidacion (Id_Liquidacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
