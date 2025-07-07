const mongoose = require('mongoose');
const crearEquipoService = require('@services/equipos/crearEquipoService');
const Equipo = require('@models/Equipo');
const FichaTecnica = require('@models/FichaTecnica');
const calcularEspecificacionesEquipo = require('@helpers/equipos/calcularEspecificacionesEquipo');
const vincularFichaTecnica = require('@helpers/equipos/vincularFichaTecnica');

jest.mock('@models/Equipo');
jest.mock('@models/FichaTecnica');
jest.mock('@helpers/equipos/calcularEspecificacionesEquipo');
jest.mock('@helpers/equipos/vincularFichaTecnica');

describe('🔒 Sanitización y protección XSS en crearEquipoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Equipo.findOne.mockResolvedValue(null);
    vincularFichaTecnica.mockResolvedValue(null);
    FichaTecnica.create.mockResolvedValue({ _id: 'fichaId' });
    calcularEspecificacionesEquipo.mockReturnValue({
      especificacionesActuales: {},
      repotenciado: false,
    });
  });

  it('🧼 limpia <script> de modelo, SKU y nroSerie, y los convierte a mayúsculas', async () => {
    const dirty = {
      tipo: 'laptop',
      marca: 'lenovo',
      modelo: 'Thinkpad X1 <script>alert("XSS")</script>',
      sku: 'sku123<script>alert(1)</script>',
      nroSerie: 'abc123<script>',
      clienteActual: new mongoose.Types.ObjectId(),
      fichaTecnicaManual: {
        cpu: 'Intel i5',
        ram: '8GB',
        almacenamiento: '256GB SSD',
        gpu: 'Intel UHD',
      },
    };

    const mockEquipo = {
      toObject: () => ({
        modelo: 'THINKPAD X1 &lt;SCRIPT&gt;ALERT("XSS")&lt;/SCRIPT&gt;',
        sku: 'SKU123&lt;SCRIPT&gt;ALERT(1)&lt;/SCRIPT&gt;',
        nroSerie: 'ABC123&lt;SCRIPT&gt;',
      }),
      save: jest.fn().mockResolvedValue(true),
    };

    Equipo.mockImplementation(() => mockEquipo);

    const equipo = await crearEquipoService(dirty);
    const obj = equipo.toObject();

    expect(obj.modelo).toBe(
      'THINKPAD X1 &lt;SCRIPT&gt;ALERT("XSS")&lt;/SCRIPT&gt;'
    );
    expect(obj.sku).toBe('SKU123&lt;SCRIPT&gt;ALERT(1)&lt;/SCRIPT&gt;');
    expect(obj.nroSerie).toBe('ABC123&lt;SCRIPT&gt;');
  });

  it('✨ convierte los campos clave a MAYÚSCULAS incluso si vienen limpios', async () => {
    const clean = {
      tipo: 'laptop',
      marca: 'Asus',
      modelo: 'rog zephyrus g14',
      sku: 'sku-asus-01',
      nroSerie: 'zxc321',
      clienteActual: new mongoose.Types.ObjectId(),
    };

    const equipoMock = {
      toObject: () => ({
        modelo: 'ROG ZEPHYRUS G14',
        sku: 'SKU-ASUS-01',
        nroSerie: 'ZXC321',
      }),
      save: jest.fn().mockResolvedValue(true),
    };

    Equipo.mockImplementation(() => equipoMock);

    const equipo = await crearEquipoService(clean);
    const obj = equipo.toObject();

    expect(obj.modelo).toBe('ROG ZEPHYRUS G14');
    expect(obj.sku).toBe('SKU-ASUS-01');
    expect(obj.nroSerie).toBe('ZXC321');
  });

  it('🧼 limpia espacios en blanco innecesarios', async () => {
    const data = {
      tipo: 'laptop',
      marca: ' Dell ',
      modelo: ' Inspiron 15 ',
      sku: ' dell-sku ',
      nroSerie: ' 123dell ',
      clienteActual: new mongoose.Types.ObjectId(),
    };

    const equipoMock = {
      toObject: () => ({
        marca: 'Dell',
        modelo: 'INSPIRON 15',
        sku: 'DELL-SKU',
        nroSerie: '123DELL',
      }),
      save: jest.fn().mockResolvedValue(true),
    };

    Equipo.mockImplementation(() => equipoMock);

    const equipo = await crearEquipoService(data);
    const obj = equipo.toObject();

    expect(obj.marca).toBe('Dell');
    expect(obj.modelo).toBe('INSPIRON 15');
    expect(obj.sku).toBe('DELL-SKU');
    expect(obj.nroSerie).toBe('123DELL');
  });

  it('🚫 ignora campos no permitidos en el payload', async () => {
    const data = {
      tipo: 'laptop',
      modelo: 'clean model',
      clienteActual: new mongoose.Types.ObjectId(),
      campoInvalido: '🚫',
    };

    const equipoMock = {
      toObject: () => ({
        tipo: 'laptop',
        modelo: 'CLEAN MODEL',
        clienteActual: data.clienteActual,
        campoInvalido: undefined, // no debe existir
      }),
      save: jest.fn().mockResolvedValue(true),
    };

    Equipo.mockImplementation(() => equipoMock);

    const equipo = await crearEquipoService(data);
    const obj = equipo.toObject();

    expect(obj.modelo).toBe('CLEAN MODEL');
    expect(obj.campoInvalido).toBeUndefined(); // 🚫
  });
});
