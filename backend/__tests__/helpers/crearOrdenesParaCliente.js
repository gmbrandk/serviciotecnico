// __tests__/helpers/crearOrdenesParaCliente.js
const mongoose = require('mongoose');
const OrdenServicio = require('@models/OrdenServicio');

/**
 * 🛠️ Inserta múltiples órdenes asociadas a un cliente dado.
 *
 * @param {Object} params
 * @param {string|ObjectId} params.clienteId - ID del cliente.
 * @param {number} params.numOrdenes - Total de órdenes a crear.
 * @param {number} params.reparadas - Cantidad con estadoEquipo "reparado".
 * @param {number} params.retiroSinReparar - Cantidad con estadoEquipo "retiro_cliente".
 * @param {number} params.irreparables - Cantidad con estadoEquipo "irreparable".
 * @param {number} params.observacionesNegativas - Cantidad con observaciones negativas.
 */
const crearOrdenesParaCliente = async ({
  clienteId,
  numOrdenes = 0,
  reparadas = 0,
  retiroSinReparar = 0,
  irreparables = 0,
  observacionesNegativas = 0,
}) => {
  const fakeTecnicoId = new mongoose.Types.ObjectId();
  const fakeEquipoId = new mongoose.Types.ObjectId();
  const fakeTipoTrabajoId = new mongoose.Types.ObjectId();

  const ordenes = [];

  for (let i = 0; i < numOrdenes; i++) {
    const orden = {
      cliente: clienteId,
      representante: clienteId,
      tecnico: fakeTecnicoId,
      equipo: fakeEquipoId,
      estadoOS: 'finalizado',
      observaciones:
        i < observacionesNegativas
          ? 'Cliente agresivo con pago tardío'
          : 'Todo bien',
      defectosReportados: 'Ninguno',
      diagnosticoCliente: 'Correcto',
      estadoEquipo:
        i < reparadas
          ? 'reparado'
          : i < reparadas + retiroSinReparar
          ? 'retiro_cliente'
          : 'irreparable',
      total: 100,
      trabajosRealizados: [
        {
          tipoTrabajo: fakeTipoTrabajoId,
          cantidad: 1,
          precioUnitario: 100,
          subtotal: 100,
        },
      ],
    };

    ordenes.push(orden);
  }

  await OrdenServicio.insertMany(ordenes);
};

module.exports = crearOrdenesParaCliente;
