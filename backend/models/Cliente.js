// 📦 models/Cliente.js
const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  dni: { type: String, required: true, unique: true, trim: true },
  email: { type: String, trim: true, lowercase: true, unique: true },
  telefono: String,
  direccion: String,
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
  isActivo: {
    type: Boolean,
    default: true,
  },
  fechaRegistro: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Cliente', ClienteSchema);
