// models/TipoDeTrabajo.js

const mongoose = require('mongoose');

const TipoDeTrabajoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
      default: '', // ✅ Recomendado: asegura que el campo exista siempre
    },
    precioBase: {
      type: Number,
      required: true,
      min: 0,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // ✅ Incluye createdAt y updatedAt automáticamente
  }
);

module.exports = mongoose.model('TipoDeTrabajo', TipoDeTrabajoSchema);
