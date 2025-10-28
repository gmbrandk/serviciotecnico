const TipoDeTrabajo = require('@models/TipodeTrabajo');
const { ValidationError } = require('@utils/errors');

const crearTipoDeTrabajoService = async (data) => {
  console.log('▶️ Iniciando creación de Tipo de Trabajo...');

  const {
    nombre,
    descripcion,
    tipo,
    categoria,
    precioBase,
    flexRange,
    unidadMedida,
    activo,
    nivelServicio,
  } = data;

  // Validaciones básicas
  if (!nombre) throw new ValidationError('El nombre es obligatorio');

  if (typeof precioBase !== 'number' || precioBase < 0) {
    throw new ValidationError('El precioBase debe ser un número válido (>= 0)');
  }

  // Validación de flexRange
  if (flexRange) {
    const { min, max } = flexRange;
    if (min >= max) {
      throw new ValidationError('El rango FLEX es inválido: min >= max');
    }
  }

  // Verificar duplicado
  const existe = await TipoDeTrabajo.findOne({
    nombre: new RegExp(`^${nombre}$`, 'i'),
  });
  if (existe)
    throw new ValidationError('Ya existe un tipo de trabajo con ese nombre');

  const tipoTrabajo = new TipoDeTrabajo({
    nombre,
    descripcion,
    tipo,
    categoria,
    precioBase,
    flexRange: flexRange || { min: -0.1, max: 0.25 },
    unidadMedida,
    activo: activo !== undefined ? activo : true,
    nivelServicio,
  });

  await tipoTrabajo.save();
  console.log('✅ Tipo de Trabajo guardado:', tipoTrabajo._id);

  return tipoTrabajo;
};

module.exports = crearTipoDeTrabajoService;
