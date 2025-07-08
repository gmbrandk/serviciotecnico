const FichaTecnica = require('@models/FichaTecnica');

const eliminarFichaTecnica = async (req, res) => {
  try {
    const { id } = req.params;

    const ficha = await FichaTecnica.findByIdAndDelete(id);

    if (!ficha) {
      return res.status(404).json({ message: 'Ficha técnica no encontrada' });
    }

    res.json({ message: 'Ficha técnica eliminada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar ficha técnica' });
  }
};

module.exports = eliminarFichaTecnica;
