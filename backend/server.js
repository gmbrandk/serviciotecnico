// backend/server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const conectarDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

dotenv.config();
const app = express();

// Conectar a la base de datos
conectarDB();

// Middleware
app.use(cors());
app.use(express.json()); // Para poder leer los datos JSON

// Rutas
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
