const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  nombres: { type: String, required: true, trim: true }, // 👈 ahora plural y obligatorio
  apellidos: { type: String, required: true, trim: true }, // 👈 nuevo campo obligatorio
  dni: { type: String, required: true, unique: true, trim: true },
  email: { type: String, trim: true, lowercase: true, unique: true },
  telefono: { type: String, trim: true },
  direccion: { type: String, trim: true },
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
  isActivo: { type: Boolean, default: true },
  fechaRegistro: { type: Date, default: Date.now },
});

// 📌 Índices
ClienteSchema.index({ dni: 1 }, { unique: true, sparse: false });
ClienteSchema.index({ telefono: 1 }, { unique: true, sparse: true });
ClienteSchema.index({ email: 1 }, { unique: true, sparse: true });

// Para búsquedas por nombre/apellido con collation en español
ClienteSchema.index(
  { nombres: 1, apellidos: 1 },
  { collation: { locale: 'es', strength: 1 } }
);

module.exports = mongoose.model('Cliente', ClienteSchema);
