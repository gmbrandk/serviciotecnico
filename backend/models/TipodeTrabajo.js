const mongoose = require('mongoose');

const TipoDeTrabajoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      unique: true,
    },

    descripcion: {
      type: String,
      trim: true,
    },

    tipo: {
      type: String,
      enum: ['servicio', 'refaccion', 'mixto'],
      default: 'servicio',
    },

    categoria: {
      type: String,
      enum: [
        'diagnostico',
        'mantenimiento',
        'reparacion',
        'instalacion',
        'configuracion',
        'actualizacion',
        'otro',
      ],
      default: 'otro',
    },

    precioBase: {
      type: Number,
      required: true,
      min: [0, 'El precio base debe ser >= 0'],
    },

    flexRange: {
      min: { type: Number, default: -0.1 }, // -10%
      max: { type: Number, default: 0.25 }, // +25%
    },

    unidadMedida: {
      type: String,
      enum: ['unidad', 'hora', 'servicio', 'pieza'],
      default: 'servicio',
    },

    activo: {
      type: Boolean,
      default: true,
    },

    nivelServicio: {
      type: String,
      enum: ['basico', 'intermedio', 'avanzado'],
      default: 'basico',
    },

    ultimaActualizacion: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TipoDeTrabajo', TipoDeTrabajoSchema);
