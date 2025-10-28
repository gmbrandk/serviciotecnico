const TipoDeTrabajo = require('@models/TipodeTrabajo');

const auditarTiposDeTrabajoService = async () => {
  console.log('🔍 Ejecutando auditoría de Tipos de Trabajo...');

  const tipos = await TipoDeTrabajo.find({}).sort({ createdAt: -1 }); // más recientes primero

  return tipos;
};

module.exports = auditarTiposDeTrabajoService;
