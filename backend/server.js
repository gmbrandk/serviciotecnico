// backend/server.js
require('module-alias/register');

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const conectarDB = require('./config/db');
const authRoutes = require('@routes/auth');
const codigosRoutes = require('@routes/codigos');
const usuariosRoutes = require('@routes/usuarios/usuarios');
const superadminRoutes = require('@routes/superadmin');

dotenv.config();
const app = express();

// Conectar a la base de datos
conectarDB();

// Middleware
app.use(cors());
app.use(express.json()); // Para poder leer los datos JSON

// Rutas
// Montamos los routers
app.use('/api/auth', authRoutes);
app.use('/api/codigos', codigosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/superadmin', superadminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
