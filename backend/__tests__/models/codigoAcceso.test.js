const mongoose = require('mongoose');
const CodigoAcceso = require('@models/CodigoAcceso');

// Conectar a la base de datos de prueba
beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }, 10000); // aumento de tiempo de espera
  
  afterEach(async () => {
    await CodigoAcceso.deleteMany({});
  });

afterAll(async () => {
  await mongoose.connection.close();
});
   

// Prueba unitaria para validaciones del modelo
describe('Modelo CodigoAcceso - Validaciones', () => {
  it('debería fallar si el código no es único', async () => {
    const codigo1 = new CodigoAcceso({
      codigo: 'D3M37R10',
      usosDisponibles: 3,
      creadoPor: new mongoose.Types.ObjectId(),
      estado: 'activo',
    });

    await codigo1.save();

    const codigo2 = new CodigoAcceso({
      codigo: 'D3M37R10',
      usosDisponibles: 2,
      creadoPor: new mongoose.Types.ObjectId(),
    });

    // Debería lanzar error por código duplicado
    await expect(codigo2.save()).rejects.toThrow('E11000 duplicate key error collection');
  });

  it('debería fallar si el código no tiene el formato adecuado', async () => {
    const codigo = new CodigoAcceso({
      codigo: Math.random().toString(36).substring(2, 10), // formato incorrecto: debe estar en mayúsculas
      usosDisponibles: 2,
      creadoPor: new mongoose.Types.ObjectId(),
    });

    // La validación debería fallar
    await expect(codigo.save()).rejects.toThrow('no es un código válido');
  });

  it('debería fallar si los usosDisponibles son menores que 1', async () => {
    const codigo = new CodigoAcceso({
      codigo: Math.random().toString(36).substring(2, 10).toUpperCase(),
      usosDisponibles: 0, // menos que el mínimo de 1
      creadoPor: new mongoose.Types.ObjectId(),
    });

    // La validación debería fallar por el mínimo de usos
    await expect(codigo.save()).rejects.toThrow('El número mínimo de usos debe ser 1');
  });

  it('debería fallar si el estado no es válido', async () => {
    const codigo = new CodigoAcceso({
      codigo: Math.random().toString(36).substring(2, 10).toUpperCase(),
      usosDisponibles: 3,
      creadoPor: new mongoose.Types.ObjectId(),
      estado: 'desconocido', // estado no válido
    });

    // La validación debería fallar por un estado inválido
    await expect(codigo.save()).rejects.toThrow('is not a valid enum value for path `estado`');
  });

  it('debería guardar un código válido', async () => {
    const codigo = new CodigoAcceso({
      codigo: 'C0R1CTM4', // código válido
      usosDisponibles: 3,
      creadoPor: new mongoose.Types.ObjectId(),
    });

    const guardado = await codigo.save();
    expect(guardado.codigo).toBe('C0R1CTM4');
    expect(guardado.usosDisponibles).toBe(3);
    expect(guardado.estado).toBe('activo');
  });
});
