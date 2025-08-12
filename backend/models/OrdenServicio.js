// models/OrdenServicio.js

const mongoose = require('mongoose');
const LineaServicioSchema = require('./subschemas/lineaServicio');

const OrdenServicioSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      unique: true,
    },
    equipo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipo',
      required: true,
    },
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente',
      required: true,
    },
    representante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente',
      required: true,
    },
    tecnico: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    fechaIngreso: {
      type: Date,
      default: Date.now,
    },
    defectosReportados: { type: String, trim: true },
    observaciones: { type: String, trim: true },
    diagnosticoCliente: { type: String, trim: true },
    estadoOS: {
      type: String,
      enum: [
        'pendiente',
        'diagnosticado',
        'esperando_confirmacion',
        'autorizado',
        'en_proceso',
        'esperando_repuesto',
        'completado',
        'cancelado',
        'anulado', // <-- soft delete
      ],
      default: 'pendiente',
    },
    estadoEquipo: {
      type: String,
      enum: ['reparado', 'retiro_cliente', 'irreparable'],
      required: function () {
        return this.estadoOS === 'finalizado';
      },
    },
    lineasServicio: {
      type: [LineaServicioSchema],
      default: [],
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Generar código OS secuencial solo cuando es nuevo
OrdenServicioSchema.pre('save', async function (next) {
  if (this.isNew) {
    const lastOrden = await mongoose
      .model('OrdenServicio')
      .findOne({})
      .sort({ createdAt: -1 }) // Última creada
      .select('codigo')
      .lean();

    let nextNumber = 1;
    if (lastOrden?.codigo) {
      const match = lastOrden.codigo.match(/OS-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    this.codigo = `OS-${String(nextNumber).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('OrdenServicio', OrdenServicioSchema);
