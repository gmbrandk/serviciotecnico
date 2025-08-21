// backend/app.js

const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

// Cargar .env correcto
const envPath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(__dirname, envPath) });

const corsOptions = {
  origin: 'http://localhost:5173', // frontend URL
  credentials: true, // 🔑 permite cookies
};

// Crear la app
const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Rutas
const authRoutes = require('@routes/auth/auth');
const codigoRoutes = require('@routes/codigo/codigos');
const usuarioRoutes = require('@routes/usuarios/usuarios');
const superadminRoutes = require('@routes/superadmin');
const movimientoRoutes = require('@routes/movimientos/movimiento.routes');
const clientesRoutes = require('@routes/clientes/clientes');
const equiposRoutes = require('@routes/equipos/equipos');
const fichaTecnicaRoutes = require('./routes/fichaTecnica/fichaTecnica');
const ordenServicioRoutes = require('./routes/ordenServicio/ordenServicio');
const tipoTrabajoRoutes = require('./routes/tipoTrabajo/tipoTrabajo');

app.use('/api/auth', authRoutes);
app.use('/api/codigos', codigoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/equipos', equiposRoutes);
app.use('/api/ficha-tecnica', fichaTecnicaRoutes);
app.use('/api/os', ordenServicioRoutes);
app.use('/api/tipo-trabajo', tipoTrabajoRoutes);

module.exports = app;
