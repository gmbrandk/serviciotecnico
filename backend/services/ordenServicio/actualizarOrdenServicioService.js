const OrdenServicio = require('@models/OrdenServicio');
const Cliente = require('@models/Cliente');
const Equipo = require('@models/Equipo');
const { ValidationError } = require('@utils/errors');
const mongoose = require('mongoose');
const xss = require('xss');
const normalizarTexto = require('@utils/strings/normalizarTexto');

const actualizarOrdenServicioService = async (id, data) => {
  const orden = await OrdenServicio.findById(id);
  if (!orden) throw new ValidationError('Orden de servicio no encontrada');

  // ✅ Validar transición de estadoOS
  if (data.estadoOS && data.estadoOS !== orden.estadoOS) {
    const estadoActual = orden.estadoOS;
    const estadoNuevo = data.estadoOS;

    const transicionesValidas = {
      pendiente: ['diagnosticado'],
      diagnosticado: ['esperando_confirmacion'],
      esperando_confirmacion: ['autorizado', 'cancelado'],
      autorizado: ['en_proceso'],
      en_proceso: ['esperando_repuesto', 'completado', 'cancelado'],
      esperando_repuesto: ['en_proceso', 'cancelado'],
      completado: [],
      cancelado: [],
    };

    const permitidos = transicionesValidas[estadoActual] || [];
    if (!permitidos.includes(estadoNuevo)) {
      throw new ValidationError(
        `Transición inválida: no se puede cambiar de "${estadoActual}" a "${estadoNuevo}".`
      );
    }
  }

  // 🔍 Procesar cliente
  if (data.cliente && typeof data.cliente === 'object') {
    const clienteLimpio = {
      dni: xss(String(data.cliente.dni || '').trim()),
      nombre: normalizarTexto(data.cliente.nombre || ''),
      email: xss(
        String(data.cliente.email || '')
          .trim()
          .toLowerCase()
      ),
      telefono: xss(String(data.cliente.telefono || '').trim()),
    };

    let clienteDoc = await Cliente.findOne({ dni: clienteLimpio.dni });
    if (!clienteDoc) {
      clienteDoc = await Cliente.create(clienteLimpio);
    }
    data.cliente = clienteDoc._id;
  }

  // 🔍 Procesar equipo
  if (data.equipo && typeof data.equipo === 'object') {
    const equipoLimpio = {
      sku: xss(
        String(data.equipo.sku || '')
          .trim()
          .toUpperCase()
      ),
      marca: normalizarTexto(data.equipo.marca || ''),
      modelo: normalizarTexto(data.equipo.modelo || ''),
      nroSerie: xss(
        String(data.equipo.nroSerie || '')
          .trim()
          .toUpperCase()
      ),
      tipo: normalizarTexto(data.equipo.tipo || ''),
    };

    let equipoDoc = await Equipo.findOne({ sku: equipoLimpio.sku });
    if (!equipoDoc) {
      equipoDoc = await Equipo.create(equipoLimpio);
    }
    data.equipo = equipoDoc._id;
  }

  // ✅ Validar y limpiar lineasServicio
  if (data.lineasServicio) {
    if (
      !Array.isArray(data.lineasServicio) ||
      data.lineasServicio.length === 0
    ) {
      throw new ValidationError('Se requiere al menos una línea de servicio.');
    }

    data.lineasServicio = data.lineasServicio.map((linea, index) => {
      if (!mongoose.Types.ObjectId.isValid(linea.tipoTrabajo)) {
        throw new ValidationError(
          `Tipo de trabajo inválido en línea ${index + 1}`
        );
      }

      return {
        ...linea,
        tipoTrabajo: new mongoose.Types.ObjectId(linea.tipoTrabajo),
      };
    });

    // Calculamos el nuevo total
    data.total = data.lineasServicio.reduce(
      (sum, linea) => sum + linea.precioUnitario * linea.cantidad,
      0
    );
  }

  // 🔄 Aplicar los cambios
  Object.assign(orden, data);
  await orden.save();

  // 📦 Poblar referencias
  await orden.populate([
    { path: 'cliente' },
    { path: 'representante' },
    { path: 'equipo' },
    { path: 'lineasServicio.tipoTrabajo' },
  ]);

  return orden;
};

module.exports = actualizarOrdenServicioService;
