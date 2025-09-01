// 📂 models/Equipo.js
const mongoose = require('mongoose');

// 🛠️ Utilidad para normalizar
const normalizeField = (value) => {
  if (!value) return null;
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
};

// 📌 Historial de propietario
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

// 📌 Esquema base de Equipo
const EquipoBaseSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      required: true,
      enum: ['smartphone', 'laptop', 'pc', 'impresora'],
    },
    marca: String,
    modelo: String,

    sku: {
      type: String,
      required: [true, 'El campo SKU es obligatorio'],
      trim: true,
      set: (v) => v?.toUpperCase(),
    },
    skuNormalizado: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    // Estado de identificación
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

    repotenciado: { type: Boolean, default: false },

    historialPropietarios: [HistorialPropietarioSchema],
  },
  { discriminatorKey: 'tipo', timestamps: true }
);

EquipoBaseSchema.pre('save', function (next) {
  if (this.sku) {
    this.skuNormalizado = normalizeField(this.sku);
  }
  next();
});

const Equipo = mongoose.model('Equipo', EquipoBaseSchema);

// 📌 Smartphone Schema
const SmartphoneSchema = new mongoose.Schema({
  nroSerie: String,
  nroSerieNormalizado: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },

  macAddress: String,
  macAddressNormalizado: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },

  imei: String,
  imeiNormalizado: { type: String, unique: true, sparse: true, index: true },
});

SmartphoneSchema.pre('save', function (next) {
  if (this.nroSerie) this.nroSerieNormalizado = normalizeField(this.nroSerie);
  if (this.macAddress)
    this.macAddressNormalizado = normalizeField(this.macAddress);
  if (this.imei) this.imeiNormalizado = normalizeField(this.imei);
  next();
});

const Smartphone = Equipo.discriminator('smartphone', SmartphoneSchema);

// 📌 Laptop Schema
const LaptopSchema = new mongoose.Schema({
  nroSerie: String,
  nroSerieNormalizado: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },

  macAddress: String,
  macAddressNormalizado: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },

  especificacionesActuales: {
    ram: {
      valor: String,
      fuente: {
        type: String,
        enum: ['template', 'manual', 'api'],
        default: 'template',
      },
    },
    almacenamiento: {
      valor: String,
      fuente: {
        type: String,
        enum: ['template', 'manual', 'api'],
        default: 'template',
      },
    },
    cpu: {
      valor: String,
      fuente: {
        type: String,
        enum: ['template', 'manual', 'api'],
        default: 'template',
      },
    },
    gpu: {
      valor: String,
      fuente: {
        type: String,
        enum: ['template', 'manual', 'api'],
        default: 'template',
      },
    },
  },
});

LaptopSchema.pre('save', function (next) {
  if (this.nroSerie) this.nroSerieNormalizado = normalizeField(this.nroSerie);
  if (this.macAddress)
    this.macAddressNormalizado = normalizeField(this.macAddress);
  next();
});

// 📌 Índices en el esquema base
EquipoBaseSchema.index({ skuNormalizado: 1 }, { unique: true, sparse: true });
EquipoBaseSchema.index({ marca: 1 });
EquipoBaseSchema.index({ tipo: 1 });

// 📌 Índices smartphone
SmartphoneSchema.index(
  { nroSerieNormalizado: 1 },
  { unique: true, sparse: true }
);
SmartphoneSchema.index({ imeiNormalizado: 1 }, { unique: true, sparse: true });
SmartphoneSchema.index(
  { macAddressNormalizado: 1 },
  { unique: true, sparse: true }
);

// 📌 Índices laptop
LaptopSchema.index({ nroSerieNormalizado: 1 }, { unique: true, sparse: true });
LaptopSchema.index(
  { macAddressNormalizado: 1 },
  { unique: true, sparse: true }
);

const Laptop = Equipo.discriminator('laptop', LaptopSchema);

module.exports = { Equipo, Smartphone, Laptop };
