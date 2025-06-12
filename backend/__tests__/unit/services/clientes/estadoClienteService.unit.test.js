const mongoose = require('mongoose');
const Cliente = require('@models/Cliente');
const estadoClienteService = require('@services/clientes/estadoClienteService');

jest.mock('@models/Cliente');

describe('🧪 estadoClienteService (unitario)', () => {
  afterEach(() => jest.clearAllMocks());

  const idValido = new mongoose.Types.ObjectId().toHexString();

  const clienteActivo = {
    _id: idValido,
    estado: 'activo',
    calificacion: 'bueno',
    save: jest.fn().mockResolvedValue(true),
  };

  const clienteSuspendido = {
    _id: idValido,
    estado: 'suspendido',
    calificacion: 'malo',
    save: jest.fn().mockResolvedValue(true),
  };

  const clienteBaneado = {
    _id: idValido,
    estado: 'baneado',
    calificacion: 'muy_malo',
    save: jest.fn().mockResolvedValue(true),
  };

  describe('🔸 suspenderCliente', () => {
    it('debería suspender al cliente si está activo', async () => {
      Cliente.findById.mockResolvedValueOnce({ ...clienteActivo });

      const res = await estadoClienteService.suspenderCliente(idValido);

      expect(res.cliente.estado).toBe('suspendido');
      expect(res.cliente.calificacion).toBe('malo');
      expect(res.yaEstaSuspendido).toBe(false);
    });

    it('debería no hacer nada si ya está suspendido', async () => {
      Cliente.findById.mockResolvedValueOnce({
        ...clienteSuspendido,
        estado: 'suspendido', // asegúrate que esté correctamente definido
        calificacion: 'malo',
        save: jest.fn().mockResolvedValue(true),
      });

      const res = await estadoClienteService.suspenderCliente(idValido);

      expect(res.yaEstaSuspendido).toBe(true);
    });

    it('debería lanzar error si no se encuentra el cliente', async () => {
      Cliente.findById.mockResolvedValueOnce(null);

      await expect(
        estadoClienteService.suspenderCliente(idValido)
      ).rejects.toThrow('Cliente no encontrado');
    });
  });

  describe('🔸 reactivarCliente', () => {
    it('debería reactivar al cliente si está suspendido', async () => {
      Cliente.findById.mockResolvedValueOnce({ ...clienteSuspendido });

      const res = await estadoClienteService.reactivarCliente(idValido);

      expect(res.cliente.estado).toBe('activo');
      expect(res.cliente.calificacion).toBe('bueno');
      expect(res.yaEstaActivo).toBe(false);
    });

    it('debería no hacer nada si ya está activo', async () => {
      Cliente.findById.mockResolvedValueOnce({ ...clienteActivo });

      const res = await estadoClienteService.reactivarCliente(idValido);

      expect(res.yaEstaActivo).toBe(true);
    });
  });

  describe('🔸 confirmarBajaCliente', () => {
    it('debería dar de baja definitiva a un cliente suspendido', async () => {
      Cliente.findById.mockResolvedValueOnce({ ...clienteSuspendido });

      const res = await estadoClienteService.confirmarBajaCliente(idValido);

      expect(res.cliente.estado).toBe('baneado');
      expect(res.cliente.calificacion).toBe('muy_malo');
      expect(res.yaEstaBaneado).toBe(false);
    });

    it('debería no hacer nada si ya está baneado', async () => {
      Cliente.findById.mockResolvedValueOnce({ ...clienteBaneado });

      const res = await estadoClienteService.confirmarBajaCliente(idValido);

      expect(res.yaEstaBaneado).toBe(true);
    });

    it('debería lanzar error si no se encuentra el cliente', async () => {
      Cliente.findById.mockResolvedValueOnce(null);

      await expect(
        estadoClienteService.confirmarBajaCliente(idValido)
      ).rejects.toThrow('Cliente no encontrado');
    });
  });
});
