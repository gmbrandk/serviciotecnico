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
  especificacionesActuales: {
    ram: {
      valor: { type: String },
      fuente: {
        type: String,
        enum: ['template', 'manual', 'api'],
        default: 'template',
      },
    },
    almacenamiento: {
      valor: { type: String },
      fuente: {
        type: String,
        enum: ['template', 'manual', 'api'],
        default: 'template',
      },
    },
    cpu: {
      valor: { type: String },
      fuente: {
        type: String,
        enum: ['template', 'manual', 'api'],
        default: 'template',
      },
    },
    gpu: {
      valor: { type: String },
      fuente: {
        type: String,
        enum: ['template', 'manual', 'api'],
        default: 'template',
      },
    },
    // Agrega más campos si es necesario
  },

  repotenciado: {
    type: Boolean,
    default: false,
  },

  historialPropietarios: [HistorialPropietarioSchema],
});

module.exports = mongoose.model('Equipo', EquipoSchema);
