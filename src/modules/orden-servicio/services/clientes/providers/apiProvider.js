// services/clientes/providers/apiProvider
import { errorResponse, successResponse } from '@utils/responseFormatter';
import axios from 'axios';

const baseURL = 'http://localhost:5000/api';

export const apiProvider = {
  crearCliente: async (clienteData) => {
    try {
      // ✅ Preprocesar teléfono
      const telefonoFinal =
        clienteData?.telefono && clienteData?.paisTelefono?.codigo
          ? `${clienteData.paisTelefono.codigo}${clienteData.telefono}`
          : clienteData?.telefono || '';

      const payload = { ...clienteData, telefono: telefonoFinal };

      console.log('📞 [apiProvider] Payload final con prefijo:', payload);

      const res = await axios.post(`${baseURL}/clientes`, payload, {
        withCredentials: true,
      });

      return successResponse({
        status: res.status,
        code: 'CLIENTE_CREADO',
        message: res.data.message || 'Cliente creado con éxito',
        details: { cliente: res.data.details?.cliente },
      });
    } catch (error) {
      console.error('[❌ apiProvider] Error en crearCliente:', error);
      return errorResponse(error, 'Error al crear cliente.');
    }
  },

  generarEmails: async ({ nombres, apellidos }) => {
    try {
      const res = await axios.post(
        `${baseURL}/clientes/generar-emails`,
        { nombres, apellidos },
        { withCredentials: true }
      );

      return successResponse({
        status: res.status,
        code: 'EMAILS_GENERADOS',
        message: res.data.message || 'Sugerencias obtenidas',
        details: res.data.details || [],
      });
    } catch (error) {
      console.error('[❌ apiProvider] Error al generarEmails:', error);
      return errorResponse(error, 'Error al generar emails.');
    }
  },
};
