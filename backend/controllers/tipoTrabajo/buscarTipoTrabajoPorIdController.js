// controllers/tiposTrabajo.controller.js
const tiposTrabajoService = require('@services/tipoTrabajo/buscarTipoTrabajoporIdService');

exports.listarTiposTrabajo = async (req, res) => {
  const data = await tiposTrabajoService.listar();
  return res.status(200).json(data);
};

exports.buscarTipoTrabajoPorId = async (req, res) => {
  const { id } = req.params;

  const data = await tiposTrabajoService.buscarPorId(id);

  if (!data.success) {
    return res.status(404).json(data);
  }

  return res.status(200).json(data);
};
