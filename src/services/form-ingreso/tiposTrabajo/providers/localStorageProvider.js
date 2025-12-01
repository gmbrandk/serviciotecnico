// services/tiposTrabajo/providers/localStorageProvider.js
import { tiposTrabajoMock } from '@__mock__/form-ingreso/tipos-trabajo';

export const localStorageProvider = {
  listarTiposTrabajo: async () => {
    console.info('[TiposTrabajoMock] listando tipos de trabajo...');
    return {
      success: true,
      status: 200,
      code: 'TIPOS_TRABAJO_LISTADOS',
      message: 'Tipos de trabajo obtenidos localmente',
      details: { tiposTrabajo: tiposTrabajoMock }, // ← 🔥 CORREGIDO
    };
  },
};
