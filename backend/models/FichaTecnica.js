const mongoose = require('mongoose');

const fichaTecnicaSchema = new mongoose.Schema(
  {
    modelo: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    marca: {
      type: String,
      required: true,
      trim: true,
    },
    cpu: {
      type: String,
      required: true,
      trim: true,
    },
    gpu: {
      type: String,
      required: true,
      trim: true,
    },
    ram: {
      type: String,
      required: true,
      trim: true,
    },
    almacenamiento: {
      type: String,
      required: true,
      trim: true,
    },
    fuente: {
      type: String,
      enum: ['manual', 'scraper', 'auto', 'otro'],
      default: 'manual',
    },
    tokensBusqueda: {
      type: [String],
      index: true,
    },
    estado: {
      type: String,
      enum: ['activa', 'suspendida', 'en_revision', 'eliminada'],
      default: 'activa',
    },
    isActiva: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Índices únicos
fichaTecnicaSchema.index({ modelo: 1 }, { unique: true });
fichaTecnicaSchema.index({ sku: 1 }, { unique: true });

// 🔍 Index para búsqueda por tokens
fichaTecnicaSchema.index({ tokensBusqueda: 1 });

const FichaTecnica = mongoose.model('FichaTecnica', fichaTecnicaSchema);
module.exports = FichaTecnica;
