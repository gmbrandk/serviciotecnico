const request = require('supertest');
const app = require('../../app');  // Importa la aplicación correctamente
const CodigoAcceso = require('../../models/CodigoAcceso');


describe('Registro de usuario', () => {
  let server;

  beforeAll(() => {
    server = app.listen(5001);  // Inicia el servidor en un puerto específico para las pruebas
  });

  afterAll(() => {
    server.close();  // Cierra el servidor después de las pruebas
  });

  it('debería rechazar sin código de acceso válido', async () => {
    const res = await request(app).post('/api/auth/register').send({
      nombre: 'testuser',
      email: 'test@example.com',
      password: '123456',
      role: 'tecnico',
      codigoAcceso: 'INVALIDO'
    });

    expect(res.statusCode).toBe(403);
    expect(res.body.mensaje).toMatch(/inválido/i);
  });

  it('debería rechazar si el email ya está registrado', async () => {
    const codigo = await CodigoAcceso.create({ codigo: 'ABC123', usosDisponibles: 2 , creadoPor: 'admin123'});

    await Usuario.create({
      nombre: 'existente',
      email: 'ya@registrado.com',
      password: '123456',
      role: 'tecnico',
    });

    const res = await request(app).post('/api/auth/register').send({
      nombre: 'nuevo',
      email: 'ya@registrado.com',
      password: '123456',
      role: 'tecnico',
      codigoAcceso: 'ABC123'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/correo ya está registrado/i);
  });
});
