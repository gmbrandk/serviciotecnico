const httpMocks = require('node-mocks-http');
const crearClienteController = require('@controllers/clientes/crearClienteController');
const Cliente = require('@models/Cliente');

jest.mock('@models/Cliente');

describe('🧪 [Integración] crearClienteController - Validación XSS', () => {
  afterEach(() => jest.clearAllMocks());

  const baseBody = {
    nombre: 'Cliente Nuevo',
    dni: '12345678',
    telefono: '999999999',
    email: 'cliente@correo.com',
    observaciones: 'Observaciones normales',
  };

  // Helper para testear campo con valor que incluye < o >
  const testXSSRejection = async (campo, valorPeligroso) => {
    const body = { ...baseBody, [campo]: valorPeligroso };
    const req = httpMocks.createRequest({ method: 'POST', body });
    const res = httpMocks.createResponse();

    await crearClienteController(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toBe(
      `El campo ${campo} contiene caracteres no permitidos`
    );
  };

  it('❌ Rechaza campo nombre con contenido peligroso XSS', async () => {
    await testXSSRejection('nombre', '<script>alert(1)</script>');
  });

  it('❌ Rechaza campo dni con contenido peligroso XSS', async () => {
    await testXSSRejection('dni', '<div>123</div>');
  });

  it('❌ Rechaza campo telefono con contenido peligroso XSS', async () => {
    await testXSSRejection('telefono', '123<456>789');
  });

  it('❌ Rechaza campo email con contenido peligroso XSS', async () => {
    await testXSSRejection('email', 'email@<script>.com');
  });

  it('❌ Rechaza campo observaciones con contenido peligroso XSS', async () => {
    await testXSSRejection('observaciones', '<img src=x onerror=alert(1)>');
  });
});
