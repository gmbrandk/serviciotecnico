// backend/app.js
require('module-alias/register');

const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const errorHandlerMiddleware = require('@middlewares/errorHandlerMiddleware');

// Cargar .env correcto
const envPath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(__dirname, envPath) });

const corsOptions = {
    origin: 'http://localhost:5173', // frontend URL
    credentials: true // 🔑 permite cookies
  };

// Crear la app
const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Rutas
const authRoutes = require('@routes/auth/auth');
const codigoRoutes = require('@routes/codigos');
const usuarioRoutes = require('@routes/usuarios/usuarios');
const superadminRoutes = require('@routes/superadmin');

app.use('/api/auth', authRoutes);
app.use('/api/codigos', codigoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/superadmin', superadminRoutes);

app.use(errorHandlerMiddleware);

module.exports = app;