// 📁 models/FichaTecnica.js
const mongoose = require('mongoose');
const normalizeField = require('@utils/normalizeField');

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
    modeloNormalizado: {
      type: String,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
      unique: true, // sigue siendo único como clave primaria
    },
    skuNormalizado: {
      type: String,
      unique: true,
      index: true, // 👈 clave confiable para vincular
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
  { timestamps: true }
);

// 🔹 Índices
fichaTecnicaSchema.index({ marca: 1, modelo: 1 }, { unique: true });
fichaTecnicaSchema.index({ tokensBusqueda: 1 });

// 🔹 Hook para normalización y tokens
fichaTecnicaSchema.pre('save', function (next) {
  if (this.isModified('sku') && this.sku) {
    const { normalizado } = normalizeField(this.sku, {
      uppercase: true,
      removeNonAlnum: true,
    });
    this.skuNormalizado = normalizado;
  }

  if (this.isModified('modelo') && this.modelo) {
    const { normalizado } = normalizeField(this.modelo, {
      uppercase: true,
      removeNonAlnum: true,
    });
    this.modeloNormalizado = normalizado;
  }

  // Tokens de búsqueda flexibles
  const tokens = [
    ...(this.marca ? this.marca.split(/\s+/) : []),
    ...(this.modelo ? this.modelo.split(/[-\s]+/) : []),
    ...(this.sku ? [this.sku] : []),
  ]
    .map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter(Boolean);

  this.tokensBusqueda = [...new Set(tokens)];

  next();
});

const FichaTecnica = mongoose.model('FichaTecnica', fichaTecnicaSchema);
module.exports = FichaTecnica;
