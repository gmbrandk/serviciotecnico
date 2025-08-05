const FichaTecnica = require('@models/FichaTecnica');
const generarNombreTecnico = require('@utils/formatters/normalizarNombreTecnico');
const generarTokensBusqueda = require('@utils/generadores/tokens');
const { ValidationError, DuplicateError } = require('@utils/errors');

const editarFichaTecnicaService = async (id, datos) => {
  const { modelo, sku, marca, cpu, gpu, ram, almacenamiento, fuente } = datos;

  if (!modelo) throw new ValidationError('El campo "modelo" es obligatorio');
  if (!sku) throw new ValidationError('El campo "sku" es obligatorio');
  if (!marca) throw new ValidationError('El campo "marca" es obligatorio');
  if (!cpu) throw new ValidationError('El campo "cpu" es obligatorio');
  if (!gpu) throw new ValidationError('El campo "gpu" es obligatorio');
  if (!ram) throw new ValidationError('El campo "ram" es obligatorio');
  if (!almacenamiento)
    throw new ValidationError('El campo "almacenamiento" es obligatorio');

  // Generamos el nombre técnico (NO se persiste)
  const nombreTecnico = generarNombreTecnico(marca, modelo);
  if (!nombreTecnico) {
    throw new ValidationError(
      'Modelo o marca inválidos para generar nombre técnico'
    );
  }

  // Verificamos conflicto por modelo técnico (no por modelo visible) o SKU
  const conflicto = await FichaTecnica.findOne({
    _id: { $ne: id },
    $or: [
      { $expr: { $eq: [{ $toUpper: '$nombreTecnico' }, nombreTecnico] } },
      { sku: new RegExp(`^${sku}$`, 'i') },
    ],
  });

  if (conflicto) {
    throw new DuplicateError(
      'Ya existe otra ficha técnica con ese nombre técnico o SKU'
    );
  }

  // Generamos los tokens con nombre técnico, pero guardamos el modelo visible
  const tokensBusqueda = generarTokensBusqueda(
    `${nombreTecnico} ${sku} ${marca}`
  );

  const actualizada = await FichaTecnica.findByIdAndUpdate(
    id,
    {
      modelo, // este es el modelo ingresado por el usuario
      sku,
      marca,
      cpu,
      gpu,
      ram,
      almacenamiento,
      fuente: fuente || 'manual',
      tokensBusqueda,
    },
    { new: true }
  );

  if (!actualizada) {
    throw new ValidationError('Ficha técnica no encontrada');
  }

  return actualizada;
};

module.exports = editarFichaTecnicaService;
