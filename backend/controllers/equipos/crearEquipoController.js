const Equipo = require('@models/Equipo');
const FichaTecnica = require('@models/FichaTecnica');
// const buscarEspecificacionExterna = require('@utils/buscarEspecificacionExterna'); // si usaras API

const crearEquipo = async (req, res) => {
  try {
    const { modelo, sku, clienteActual, ...otrosCampos } = req.body;

    // 1. Buscar ficha técnica por SKU o modelo
    let fichaTecnica = await FichaTecnica.findOne({
      $or: [{ sku: sku?.trim() }, { modelo: modelo?.trim() }],
    });

    // 2. (opcional) Buscar en API externa si no está en la base
    // if (!fichaTecnica) {
    //   const fichaApi = await buscarEspecificacionExterna(sku || modelo);
    //   if (fichaApi) {
    //     fichaTecnica = await FichaTecnica.create(fichaApi);
    //   }
    // }

    // 3. Crear equipo con la ficha si existe
    const nuevoEquipo = new Equipo({
      clienteActual,
      modelo,
      sku,
      fichaTecnica: fichaTecnica?._id || null,
      historialPropietarios: [
        {
          clienteId: clienteActual,
          fechaAsignacion: new Date(),
        },
      ],
      ...otrosCampos,
    });

    await nuevoEquipo.save();

    return res.status(201).json({
      success: true,
      mensaje: 'Equipo registrado correctamente',
      equipo: nuevoEquipo,
    });
  } catch (error) {
    console.error('Error al crear equipo:', error);
    return res.status(500).json({ success: false, mensaje: 'Error interno' });
  }
};

module.exports = {
  crearEquipo,
};
