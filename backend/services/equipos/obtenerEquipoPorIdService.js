// 📁 services/equipos/obtenerEquipoPorIdService.js

const Equipo = require('@models/Equipo');
const { ValidationError } = require('@utils/errors');

const obtenerEquipoPorIdService = async (id) => {
  if (!id) throw new ValidationError('Se requiere un ID de equipo');

  const equipo = await Equipo.findById(id)
    .populate('clienteActual', 'nombre email telefono') // puedes ajustar campos
    .populate('fichaTecnica'); // si necesitas detalles técnicos también

  if (!equipo) {
    throw new ValidationError(
      'No se encontró el equipo con el ID proporcionado'
    );
  }

  return equipo;
};

module.exports = obtenerEquipoPorIdService;
