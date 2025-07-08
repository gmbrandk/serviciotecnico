const FichaTecnica = require('@models/FichaTecnica');
const generarNombreTecnico = require('../../utils/formatters/normalizarNombreTecnico');

const crearFichaTecnica = async (req, res) => {
  try {
    const { modelo, sku, marca, cpu, gpu, ram, almacenamiento, fuente } =
      req.body;

    const nombreTecnico = generarNombreTecnico(marca, modelo);
    if (!nombreTecnico) {
      return res.status(400).json({ message: 'Modelo o marca inválidos' });
    }

    // Verificar duplicados
    const yaExiste = await FichaTecnica.findOne({
      modelo: new RegExp(`^${modelo}$`, 'i'),
      sku: new RegExp(`^${sku}$`, 'i'),
    });

    if (yaExiste) {
      return res
        .status(409)
        .json({ message: 'Ficha técnica ya existe con ese modelo y SKU' });
    }

    const ficha = new FichaTecnica({
      modelo,
      sku,
      marca,
      cpu,
      gpu,
      ram,
      almacenamiento,
      fuente: fuente || 'manual',
    });

    await ficha.save();
    return res.status(201).json({ ficha });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear ficha técnica' });
  }
};

module.exports = crearFichaTecnica;
