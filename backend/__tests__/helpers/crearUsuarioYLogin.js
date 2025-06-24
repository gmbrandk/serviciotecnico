const request = require('supertest');
const app = require('../../app');
const Usuario = require('@models/Usuario');

const crearUsuarioYLogin = async ({
  nombre = 'Usuario Test',
  email = `usuario+${Date.now()}@test.com`,
  password = '123456',
  role = 'administrador',
} = {}) => {
  console.log('👉 Creando usuario con email:', email);

  // ⚠️ NO hashear la contraseña manualmente
  const usuario = await Usuario.create({
    nombre,
    email,
    password, // pasa directamente el texto plano
    role,
  });

  console.log('🧪 Usuario creado. Intentando login...');

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  console.log('🧪 Login respuesta status:', res.statusCode);
  console.log('🧪 Login respuesta body:', res.body);
  console.log('🧪 Cookies:', res.headers['set-cookie']);

  if (res.statusCode !== 200) {
    throw new Error(`❌ Login falló: ${res.body.mensaje}`);
  }

  const cookie = res.headers['set-cookie'];

  return { usuario, cookie };
};

module.exports = crearUsuarioYLogin;
