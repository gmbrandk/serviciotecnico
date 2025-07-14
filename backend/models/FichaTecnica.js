const mongoose = require('mongoose');
const MarcaModelo = require('./MarcaModelo');

const fichaTecnicaSchema = new mongoose.Schema(
  {
    marcaModelo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MarcaModelo',
      required: true,
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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

// Índices
fichaTecnicaSchema.index({ marcaModelo: 1, version: 1 }, { unique: true });
fichaTecnicaSchema.index({ sku: 1 }, { unique: true });
fichaTecnicaSchema.index({ tokensBusqueda: 1 });

// Validación: asegurar que marcaModeloId existe
fichaTecnicaSchema.pre('validate', async function (next) {
  const existe = await MarcaModelo.exists({ _id: this.marcaModelo });

  if (!existe) {
    return next(
      new Error(`❌ La referencia marcaModelo no es válida o no existe.`)
    );
  }

  next();
});

const FichaTecnica = mongoose.model('FichaTecnica', fichaTecnicaSchema);
module.exports = FichaTecnica;
