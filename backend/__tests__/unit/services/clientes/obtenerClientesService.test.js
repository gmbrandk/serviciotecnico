const mongoose = require('mongoose');
const obtenerClientesService = require('../../../../services/clientes/obtenerClientesService');
const Cliente = require('@models/Cliente');

jest.mock('@models/Cliente', () => ({
  findById: jest.fn(),
  find: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  exec: jest.fn(),
  countDocuments: jest.fn(),
}));

describe('obtenerClientesBase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('🔍 Buscar por ID', () => {
    it('✅ devuelve cliente si ID es válido', async () => {
      const idValido = new mongoose.Types.ObjectId().toString();
      const mockCliente = { _id: idValido, nombre: 'Cliente válido' };

      Cliente.findById.mockResolvedValue(mockCliente);

      const resultado = await obtenerClientesService({ id: idValido });

      expect(Cliente.findById).toHaveBeenCalledWith(idValido);
      expect(resultado).toEqual(mockCliente);
    });

    it('❌ lanza error si ID es inválido', async () => {
      const resultado = obtenerClientesService({ id: 'invalido' });

      await expect(resultado).rejects.toEqual({
        status: 400,
        mensaje: 'ID inválido',
      });
    });

    it('❌ lanza error si cliente no existe', async () => {
      Cliente.findById.mockResolvedValue(null);

      const resultado = obtenerClientesService({
        id: '666f123456789abcde000000',
      });

      await expect(resultado).rejects.toEqual({
        status: 404,
        mensaje: 'Cliente no encontrado',
      });
    });
  });

  describe('📋 Buscar múltiples clientes', () => {
    it('✅ devuelve lista de clientes y total con filtros', async () => {
      const mockClientes = [{ nombre: 'Cliente A' }, { nombre: 'Cliente B' }];
      Cliente.find.mockReturnValue({
        sort: () => ({
          skip: () => ({
            limit: () => Promise.resolve(mockClientes),
          }),
        }),
      });
      Cliente.countDocuments.mockResolvedValue(2);

      const result = await obtenerClientesService({
        filtros: { estado: 'activo' },
        opciones: { page: 1, limit: 10 },
      });

      expect(result.clientes).toEqual(mockClientes);
      expect(result.total).toBe(2);
      expect(Cliente.find).toHaveBeenCalledWith({ estado: 'activo' });
    });

    it('✅ aplica paginación y ordenamiento correctamente', async () => {
      const mockSorted = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(['Cliente paginado']),
      };

      Cliente.find.mockReturnValue({ sort: () => mockSorted });
      Cliente.countDocuments.mockResolvedValue(1);

      const result = await obtenerClientesService({
        filtros: {},
        opciones: { page: 2, limit: 1, sortBy: 'nombre', order: 'desc' },
      });

      expect(mockSorted.skip).toHaveBeenCalledWith(1); // (2 - 1) * 1
      expect(mockSorted.limit).toHaveBeenCalledWith(1);
      expect(result.clientes).toEqual(['Cliente paginado']);
      expect(result.total).toBe(1);
    });
  });
});
