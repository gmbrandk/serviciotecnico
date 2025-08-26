// 📁 services/fichaTecnica/crearFichaTecnicaService.js

const FichaTecnica = require('@models/FichaTecnica');
const generarNombreTecnico = require('@utils/formatters/normalizarNombreTecnico');
const generarTokensBusqueda = require('@utils/generadores/tokens');
const { ValidationError, DuplicateError } = require('@utils/errors');
const normalizarFichaTecnica = require('@utils/formatters/normalizarFichaTecnica');
const normalizarSku = require('@utils/formatters/normalizarSku');

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
  // 🔍 Validaciones obligatorias
  if (!modelo) throw new ValidationError('El campo "modelo" es obligatorio');
  if (!sku) throw new ValidationError('El campo "sku" es obligatorio');
  if (!marca) throw new ValidationError('El campo "marca" es obligatorio');
  if (!cpu) throw new ValidationError('El campo "cpu" es obligatorio');
  if (!gpu) throw new ValidationError('El campo "gpu" es obligatorio');
  if (!ram) throw new ValidationError('El campo "ram" es obligatorio');
  if (!almacenamiento)
    throw new ValidationError('El campo "almacenamiento" es obligatorio');

  // 🧠 Formatear campos técnicos
  const fichaFormateada = normalizarFichaTecnica({
    modelo,
    marca,
    sku,
    cpu,
    gpu,
    ram,
    almacenamiento,
  });

  // ✅ Normalizar SKU antes de usarlo
  const skuNormalizado = normalizarSku(sku);

  // Validar SKU duplicado en base al campo normalizado
  const yaExisteSku = await FichaTecnica.findOne({ sku: skuNormalizado });
  if (yaExisteSku) {
    throw new DuplicateError(
      `Ya existe una ficha técnica con el SKU "${skuNormalizado}"`
    );
  }

  // ⚙️ Generar nombre técnico para tokens (uso interno)
  const nombreTecnico = generarNombreTecnico(marca, modelo);
  const tokensBusqueda = generarTokensBusqueda(
    `${nombreTecnico} ${sku} ${marca}`
  );

  // ✅ Crear nueva ficha técnica
  const ficha = new FichaTecnica({
    modelo,
    marca,
    sku: skuNormalizado,
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
