// 📦 models/Cliente.js
const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  dni: { type: String, required: true, unique: true },
  telefono: String,
  email: String,
  direccion: String,
  observaciones: String, // Notas generales, no usadas para automatizar reglas
  estado: {
    type: String,
    enum: ['activo', 'suspendido', 'baneado'],
    default: 'activo',
  },
  calificacion: {
    type: String,
    enum: ['muy_malo', 'malo', 'regular', 'bueno', 'muy_bueno'],
    default: 'regular',
  },
  fechaRegistro: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Cliente', ClienteSchema);
