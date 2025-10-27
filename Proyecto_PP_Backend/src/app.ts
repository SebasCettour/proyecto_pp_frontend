import express from 'express';
import cors from 'cors';
import path from 'path';

import licenciasRoutes from './routes/licencias.js';
import authRoutes from './routes/auth.js';
import cie10Routes from './routes/cie10.js';
import obrasSocialesRoutes from './routes/obrasSociales.js';
import sindicatosRoutes from './routes/sindicatos.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas

app.use('/api/auth', authRoutes);
app.use('/api/licencias', licenciasRoutes);
app.use('/api/cie10', cie10Routes);
app.use('/api/obras-sociales', obrasSocialesRoutes);
app.use('/api/sindicatos', sindicatosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente' });
});

export default app;