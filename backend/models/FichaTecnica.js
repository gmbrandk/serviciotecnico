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
  },
  {
    timestamps: true,
  }
);

fichaTecnicaSchema.index({ modelo: 1 });
fichaTecnicaSchema.index({ sku: 1 });
fichaTecnicaSchema.index({ tokensBusqueda: 1 });

const FichaTecnica = mongoose.model('FichaTecnica', fichaTecnicaSchema);
module.exports = FichaTecnica;
