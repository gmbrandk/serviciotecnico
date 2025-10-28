const TipoDeTrabajo = require('@models/TipodeTrabajo');
const { ValidationError } = require('@utils/errors');

const listarTiposDeTrabajoService = async (filtros = {}) => {
  console.log('▶️ Listando Tipos de Trabajo con filtros:', filtros);

  const query = {};
  if (typeof filtros.activo === 'boolean') query.activo = filtros.activo;
  if (filtros.tipo) query.tipo = filtros.tipo; // ej. servicio / producto

  // Seleccionamos solo los campos necesarios para el frontend
  const tipos = await TipoDeTrabajo.find(query)
    .select('nombre tipo categoria precioBase flexRange activo')
    .sort({ nombre: 1 })
    .lean();

  if (!tipos.length) {
    console.warn(
      '⚠️ No se encontraron tipos de trabajo con los filtros:',
      filtros
    );
  }

  return tipos;
};

module.exports = listarTiposDeTrabajoService;
