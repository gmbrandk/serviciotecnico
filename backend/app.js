// backend/app.js
require('module-alias/register');

const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar .env correcto
const envPath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(__dirname, envPath) });

// Crear la app
const app = express();
app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require('@routes/auth');
const codigoRoutes = require('@routes/codigos');
const usuarioRoutes = require('@routes/usuarios/usuarios');
const superadminRoutes = require('@routes/superadmin');

app.use('/api/auth', authRoutes);
app.use('/api/codigos', codigoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/superadmin', superadminRoutes);

module.exports = app;