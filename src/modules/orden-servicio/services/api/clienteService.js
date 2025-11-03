// src/services/api/clienteService.js
import { apiProvider } from './apiProvider';

export const getClienteService = () => ({
  // 🧱 Crear cliente
  crearCliente: async (clienteData) => {
    // Preprocesamiento del teléfono
    const telefonoFinal =
      clienteData?.telefono && clienteData?.paisTelefono?.codigo
        ? `${clienteData.paisTelefono.codigo}${clienteData.telefono}`
        : clienteData?.telefono || '';

    const payload = { ...clienteData, telefono: telefonoFinal };

    console.log('📞 [clienteService] Payload final con prefijo:', payload);

    // Request al backend (interceptor se encarga del manejo de errores)
    return apiProvider.post('/clientes', payload);
  },

  // 🧩 Generar emails sugeridos
  generarEmails: async ({ nombres, apellidos }) => {
    return apiProvider.post('/clientes/generar-emails', { nombres, apellidos });
  },
});
