// 📁 services/fichaTecnica/crearFichaTecnicaService.js

const FichaTecnica = require('@models/FichaTecnica');
const generarNombreTecnico = require('@utils/formatters/normalizarNombreTecnico');
const generarTokensBusqueda = require('@utils/generadores/tokens');
const { ValidationError, DuplicateError } = require('@utils/errors');

const crearFichaTecnicaService = async ({
  modelo,
  sku,
  marca,
  cpu,
  gpu,
  ram,
  almacenamiento,
  fuente = 'manual',
  estado = 'activa',
}) => {
  if (!modelo) throw new ValidationError('El campo "modelo" es obligatorio');
  if (!sku) throw new ValidationError('El campo "sku" es obligatorio');
  if (!marca) throw new ValidationError('El campo "marca" es obligatorio');
  if (!cpu) throw new ValidationError('El campo "cpu" es obligatorio');
  if (!gpu) throw new ValidationError('El campo "gpu" es obligatorio');
  if (!ram) throw new ValidationError('El campo "ram" es obligatorio');
  if (!almacenamiento) throw new ValidationError('El campo "almacenamiento" es obligatorio');

  const modeloBase = generarNombreTecnico(marca, modelo);
  if (!modeloBase) {
    throw new ValidationError('Modelo o marca inválidos para generar modelo normalizado');
  }

  // 🔍 Verificar si el SKU ya existe (es único e inmutable)
  const yaExisteSku = await FichaTecnica.findOne({ sku: new RegExp(`^${sku}$`, 'i') });
  if (yaExisteSku) {
    throw new DuplicateError(`Ya existe una ficha técnica con el SKU "${sku}"`);
  }

  // 🔍 Contar cuántas versiones ya existen con el mismo modelo base
  const coincidencias = await FichaTecnica.find({ modelo: new RegExp(`^${modeloBase}( v\\.\\d+)?$`, 'i') });
  const version = coincidencias.length + 1;
  const modeloFinal = `${modeloBase} v.${version}`;

  const tokensBusqueda = generarTokensBusqueda(`${modeloFinal} ${sku} ${marca}`);

  const ficha = new FichaTecnica({
    modelo: modeloFinal,
    version,
    sku,
    marca,
    cpu,
    gpu,
    ram,
    almacenamiento,
    fuente,
    estado,
    tokensBusqueda,
  });

  await ficha.save();
  return ficha;
};

module.exports = crearFichaTecnicaService;
