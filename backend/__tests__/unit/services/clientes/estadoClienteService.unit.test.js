const mongoose = require('mongoose');
const estadoClienteController = require('@controllers/clientes/estadoClienteController');
const estadoClienteService = require('@services/clientes/estadoClienteService');
const { sendSuccess, sendError } = require('@utils/httpResponse');

jest.mock('@services/clientes/estadoClienteService');
jest.mock('@utils/httpResponse', () => ({
  sendSuccess: jest.fn(),
  sendError: jest.fn(),
}));

describe('🧪 estadoClienteController (unitario)', () => {
  const mockReq = (id) => ({ params: { id } });
  const res = {}; // no necesitamos simular res porque sendSuccess/sendError ya están mockeados

  const idValido = new mongoose.Types.ObjectId().toHexString();
  const clienteMock = {
    _id: idValido,
    nombre: 'Cliente Uno',
    estado: 'activo',
    isActivo: true,
    calificacion: 'bueno',
  };

  afterEach(() => jest.clearAllMocks());

  describe('🔸 suspender', () => {
    it('debería suspender al cliente correctamente', async () => {
      estadoClienteService.suspenderCliente.mockResolvedValue({
        yaEstaSuspendido: false,
        cliente: clienteMock,
      });

      await estadoClienteController.suspender(mockReq(idValido), res);

      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        200,
        'Cliente suspendido correctamente',
        { cliente: clienteMock }
      );
    });

    it('debería retornar que ya está suspendido', async () => {
      estadoClienteService.suspenderCliente.mockResolvedValue({
        yaEstaSuspendido: true,
        cliente: clienteMock,
      });

      await estadoClienteController.suspender(mockReq(idValido), res);

      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        200,
        'El cliente ya se encuentra suspendido',
        { cliente: clienteMock }
      );
    });

    it('debería retornar error si ID es inválido', async () => {
      await estadoClienteController.suspender(mockReq('invalido'), res);
      expect(sendError).toHaveBeenCalledWith(res, 400, 'ID inválido');
    });

    it('debería manejar errores del servicio', async () => {
      estadoClienteService.suspenderCliente.mockRejectedValue(
        new Error('Error de prueba')
      );
      await estadoClienteController.suspender(mockReq(idValido), res);
      expect(sendError).toHaveBeenCalledWith(res, 400, 'Error de prueba');
    });
  });

  describe('🔸 reactivar', () => {
    it('debería reactivar al cliente correctamente', async () => {
      estadoClienteService.reactivarCliente.mockResolvedValue({
        yaEstaActivo: false,
        cliente: clienteMock,
      });

      await estadoClienteController.reactivar(mockReq(idValido), res);

      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        200,
        'Cliente reactivado correctamente',
        { cliente: clienteMock }
      );
    });

    it('debería retornar que ya está activo', async () => {
      estadoClienteService.reactivarCliente.mockResolvedValue({
        yaEstaActivo: true,
        cliente: clienteMock,
      });

      await estadoClienteController.reactivar(mockReq(idValido), res);

      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        200,
        'El cliente ya está activo',
        { cliente: clienteMock }
      );
    });
  });

  describe('🔸 confirmarBaja', () => {
    it('debería dar de baja al cliente correctamente', async () => {
      estadoClienteService.confirmarBajaCliente.mockResolvedValue({
        yaEstaBaneado: false,
        cliente: clienteMock,
      });

      await estadoClienteController.confirmarBaja(mockReq(idValido), res);

      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        200,
        'Baja definitiva confirmada correctamente',
        { cliente: clienteMock }
      );
    });

    it('debería retornar que ya fue baneado', async () => {
      estadoClienteService.confirmarBajaCliente.mockResolvedValue({
        yaEstaBaneado: true,
        cliente: clienteMock,
      });

      await estadoClienteController.confirmarBaja(mockReq(idValido), res);

      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        200,
        'El cliente ya fue dado de baja permanentemente',
        { cliente: clienteMock }
      );
    });
  });
});
