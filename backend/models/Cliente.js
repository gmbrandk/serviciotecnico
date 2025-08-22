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

// models/Cliente.js (fragmento)
ClienteSchema.index({ dni: 1 }, { unique: true, sparse: false });
ClienteSchema.index({ telefono: 1 }, { unique: true, sparse: true });
ClienteSchema.index({ email: 1 }, { unique: true, sparse: true });
// Para nombre, mejor index normal + collation o text si lo usas mucho:
ClienteSchema.index(
  { nombre: 1 },
  { collation: { locale: 'es', strength: 1 } }
);

module.exports = mongoose.model('Cliente', ClienteSchema);
