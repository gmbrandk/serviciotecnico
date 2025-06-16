// 💻 models/Equipo.js
const mongoose = require('mongoose');

const HistorialPropietarioSchema = new mongoose.Schema({
  clienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true,
  },
  fechaAsignacion: {
    type: Date,
    default: Date.now,
    required: true,
  },
  fechaFin: {
    type: Date,
    default: null,
  },
});

const EquipoSchema = new mongoose.Schema({
  tipo: { type: String, required: true }, // laptop, pc, impresora, etc.
  marca: String,
  modelo: String,
  nroSerie: { type: String, unique: true },

  clienteActual: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true,
  },

  fichaTecnica: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FichaTecnica',
    default: null,
  },

  historialPropietarios: [HistorialPropietarioSchema],
});

module.exports = mongoose.model('Equipo', EquipoSchema);
