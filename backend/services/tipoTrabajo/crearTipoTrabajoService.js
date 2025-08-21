const TipoDeTrabajo = require('@models/TipodeTrabajo');
const { ValidationError } = require('@utils/errors');

const crearTipoDeTrabajoService = async (data) => {
  console.log('▶️ Iniciando creación de Tipo de Trabajo...');

  const { nombre, descripcion, precioBase, activo } = data;

  if (!nombre) {
    throw new ValidationError('El nombre es obligatorio');
  }

  if (typeof precioBase !== 'number' || precioBase < 0) {
    throw new ValidationError('El precioBase debe ser un número válido (>= 0)');
  }

  // Verificar si ya existe uno con el mismo nombre
  const existe = await TipoDeTrabajo.findOne({
    nombre: new RegExp(`^${nombre}$`, 'i'),
  });
  if (existe) {
    throw new ValidationError('Ya existe un tipo de trabajo con ese nombre');
  }

  const tipoTrabajo = new TipoDeTrabajo({
    nombre,
    descripcion,
    precioBase,
    activo: activo !== undefined ? activo : true,
  });

  await tipoTrabajo.save();
  console.log('✅ Tipo de Trabajo guardado:', tipoTrabajo._id);

  return tipoTrabajo;
};

module.exports = crearTipoDeTrabajoService;
