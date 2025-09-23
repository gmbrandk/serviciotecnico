// 📂 models/Equipo.js
const mongoose = require('mongoose');
const normalizeField = require('@utils/normalizeField');

// 📌 Helper para normalizar con opciones por defecto
const normalize = (value) =>
  normalizeField(value, { uppercase: true, removeNonAlnum: true }).normalizado;

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

// 📌 Hooks de normalización en save
EquipoBaseSchema.pre('save', function (next) {
  if (this.sku) {
    this.skuNormalizado = normalize(this.sku);
  }
  next();
});

// 📌 Hooks de normalización en updates
EquipoBaseSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.sku) {
    update.skuNormalizado = normalize(update.sku);
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

// Hooks save
SmartphoneSchema.pre('save', function (next) {
  if (this.nroSerie) this.nroSerieNormalizado = normalize(this.nroSerie);
  if (this.macAddress) this.macAddressNormalizado = normalize(this.macAddress);
  if (this.imei) this.imeiNormalizado = normalize(this.imei);
  next();
});

// Hooks update
SmartphoneSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.nroSerie) {
    update.nroSerieNormalizado = normalize(update.nroSerie);
  }
  if (update.macAddress) {
    update.macAddressNormalizado = normalize(update.macAddress);
  }
  if (update.imei) {
    update.imeiNormalizado = normalize(update.imei);
  }
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

// Hooks save
LaptopSchema.pre('save', function (next) {
  if (this.nroSerie) this.nroSerieNormalizado = normalize(this.nroSerie);
  if (this.macAddress) this.macAddressNormalizado = normalize(this.macAddress);
  next();
});

// Hooks update
LaptopSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.nroSerie) {
    update.nroSerieNormalizado = normalize(update.nroSerie);
  }
  if (update.macAddress) {
    update.macAddressNormalizado = normalize(update.macAddress);
  }
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
