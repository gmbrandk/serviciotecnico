const mongoose = require('mongoose');
const Cliente = require('@models/Cliente');
const OrdenServicio = require('@models/OrdenServicio');

/**
 * 🔧 Crea un cliente con múltiples órdenes de servicio simuladas.
 *
 * @param {Object} opciones - Configuración del cliente y sus órdenes.
 * @param {string} opciones.estadoCliente - Estado del cliente.
 * @param {string} opciones.observaciones - Observaciones del cliente.
 * @param {number} opciones.numOrdenes - Total de órdenes.
 * @param {number} opciones.reparadas - Cantidad con estadoEquipo "reparado".
 * @param {number} opciones.retiroSinReparar - Cantidad con estadoEquipo "retiro_cliente".
 * @param {number} opciones.irreparables - Cantidad con estadoEquipo "irreparable".
 * @param {number} opciones.observacionesNegativas - Cantidad con observaciones negativas.
 * @returns {Promise<Cliente>} Cliente con sus órdenes creadas.
 */
const crearClienteYOrdenes = async ({
  estadoCliente = 'activo',
  observaciones = '',
  numOrdenes = 0,
  reparadas = 0,
  retiroSinReparar = 0,
  irreparables = 0,
  observacionesNegativas = 0,
} = {}) => {
  // 📌 1. Crear cliente válido
  const cliente = await Cliente.create({
    nombre: `Cliente Test ${Date.now()}`,
    dni: `DNI${Date.now()}`,
    estado: estadoCliente,
    observaciones,
    telefono: '123456789',
    email: 'test@cliente.com',
    direccion: 'Calle Falsa 123',
  });

  // 📌 2. IDs mock para referencias requeridas
  const fakeTecnicoId = new mongoose.Types.ObjectId();
  const fakeEquipoId = new mongoose.Types.ObjectId();
  const fakeTipoTrabajoId = new mongoose.Types.ObjectId();

  // 📌 3. Generar órdenes simuladas
  const ordenes = [];

  for (let i = 0; i < numOrdenes; i++) {
    const orden = {
      cliente: cliente._id,
      representante: cliente._id,
      tecnico: fakeTecnicoId,
      equipo: fakeEquipoId,
      estadoOS: 'finalizado',
      observaciones: 'Todo bien',
      defectosReportados: 'Ninguno',
      diagnosticoCliente: 'Correcto',
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

    // Asignar estadoEquipo
    if (i < reparadas) {
      orden.estadoEquipo = 'reparado';
    } else if (i < reparadas + retiroSinReparar) {
      orden.estadoEquipo = 'retiro_cliente';
    } else {
      orden.estadoEquipo = 'irreparable';
    }

    if (i < observacionesNegativas) {
      orden.observaciones = 'Cliente agresivo con pago tardío';
    }

    ordenes.push(orden);
  }

  // 📌 4. Insertar en lote
  await OrdenServicio.insertMany(ordenes);

  return cliente;
};

module.exports = { crearClienteYOrdenes };
