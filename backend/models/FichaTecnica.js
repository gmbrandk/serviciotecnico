const mongoose = require('mongoose');

const fichaTecnicaSchema = new mongoose.Schema(
  {
    marca: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    modelo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
      unique: true, // 👈 Esto ya crea el índice
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
      // 🔥 Se quitó index: true
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

// Índices
fichaTecnicaSchema.index({ marca: 1, modelo: 1 }, { unique: true }); // Evita duplicados lógicos
// 🔥 Eliminado: fichaTecnicaSchema.index({ sku: 1 }, { unique: true });
fichaTecnicaSchema.index({ tokensBusqueda: 1 }); // Se mantuvo este

const FichaTecnica = mongoose.model('FichaTecnica', fichaTecnicaSchema);
module.exports = FichaTecnica;
