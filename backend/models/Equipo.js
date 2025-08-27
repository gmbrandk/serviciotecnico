// 💻 models/Equipo.js
const mongoose = require('mongoose');

// 🛠️ Utilidad para normalizar (puedes extraerla a @utils/formatters/normalizeField.js)
const normalizeField = (value) => {
  if (!value) return null;
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(); // elimina no-alfa y mayúsculas
};

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

const EquipoSchema = new mongoose.Schema(
  {
    tipo: { type: String, required: true }, // laptop, pc, celular, impresora, etc.
    marca: String,
    modelo: String,

    sku: {
      type: String,
      required: [true, 'El campo SKU es obligatorio'],
      trim: true,
      set: (v) => v?.toUpperCase(), // ✨ Normalización básica
    },

    // Valores originales
    nroSerie: { type: String, unique: false, sparse: true },
    macAddress: { type: String, unique: false, sparse: true },
    imei: { type: String, unique: false, sparse: true },

    // Valores normalizados (usados para búsquedas e índices únicos)
    nroSerieNormalizado: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    macAddressNormalizado: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    imeiNormalizado: { type: String, unique: true, sparse: true, index: true },
    skuNormalizado: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    // 🚩 Estado de identificación (temporal o definitiva)
    estadoIdentificacion: {
      type: String,
      enum: ['definitiva', 'temporal'],
      default: 'definitiva',
    },

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
    },

    repotenciado: {
      type: Boolean,
      default: false,
    },

    historialPropietarios: [HistorialPropietarioSchema],
  },
  { timestamps: true }
);

// 🔹 Hook para mantener siempre los valores normalizados
EquipoSchema.pre('save', function (next) {
  if (this.nroSerie) {
    this.nroSerieNormalizado = normalizeField(this.nroSerie);
  }
  if (this.macAddress) {
    this.macAddressNormalizado = normalizeField(this.macAddress);
  }
  if (this.imei) {
    this.imeiNormalizado = normalizeField(this.imei);
  }
  if (this.sku) {
    this.skuNormalizado = normalizeField(this.sku);
  }
  next();
});

module.exports = mongoose.model('Equipo', EquipoSchema);
