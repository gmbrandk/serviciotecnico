// utils/mockOrdenServicio.js
const randomId = () => Math.random().toString(36).substring(2, 10);

const nombresMock = [
  'Juan',
  'María',
  'Pedro',
  'Adriana',
  'Lucía',
  'Antonio',
  'Luciano',
  'Cristian',
];
const apellidosMock = [
  'Pérez',
  'Gutiérrez',
  'Rodríguez',
  'Tudela',
  'Quispe',
  'Mamani',
  'Olazabal',
];
const marcasMock = ['Dell', 'HP', 'Lenovo', 'Toshiba', 'Acer', 'Asus', 'Apple'];
const modelosMock = [
  'Inspiron 15',
  'Pavilion X360',
  'ThinkPad X1',
  'Satellite L45',
  'Aspire 5',
  'MacBook Pro',
  'VivoBook 14',
];
const tiposEquipo = ['Laptop', 'Desktop', 'Impresora', 'Servidor'];

/**
 * 🔹 Cliente de prueba (solo persona natural, sin repeticiones)
 */
export function generarClienteMock() {
  // Selección de nombres sin repetición
  const primerNombre =
    nombresMock[Math.floor(Math.random() * nombresMock.length)];
  let nombres = [primerNombre];
  if (Math.random() < 0.4) {
    let segundoNombre;
    do {
      segundoNombre =
        nombresMock[Math.floor(Math.random() * nombresMock.length)];
    } while (segundoNombre === primerNombre); // evitar repetición
    nombres.push(segundoNombre);
  }

  // Selección de apellidos sin repetición
  const primerApellido =
    apellidosMock[Math.floor(Math.random() * apellidosMock.length)];
  let apellidos = [primerApellido];
  if (Math.random() < 0.6) {
    let segundoApellido;
    do {
      segundoApellido =
        apellidosMock[Math.floor(Math.random() * apellidosMock.length)];
    } while (segundoApellido === primerApellido); // evitar repetición
    apellidos.push(segundoApellido);
  }

  return {
    nombres: nombres.join(' '),
    apellidos: apellidos.join(' '),
    dni: String(Math.floor(1e7 + Math.random() * 9e7)), // 8 dígitos
    telefono:
      '9' +
      Math.floor(Math.random() * 1e8)
        .toString()
        .padStart(8, '0'),
    email: `${primerNombre.toLowerCase()}.${primerApellido.toLowerCase()}@example.com`,
    direccion: `Av. Siempre Viva ${Math.floor(Math.random() * 1000)}`,
  };
}

/**
 * 🔹 Equipo de prueba
 */
export function generarEquipoMock() {
  const marca = marcasMock[Math.floor(Math.random() * marcasMock.length)];
  const modelo = modelosMock[Math.floor(Math.random() * modelosMock.length)];
  const tipo = tiposEquipo[Math.floor(Math.random() * tiposEquipo.length)];

  return {
    tipo,
    marca,
    modelo,
    sku: `${marca.toUpperCase()}-${randomId()}`,
    macAddress: Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, '0')
    ).join(':'),
    nroSerie: `SN-${randomId().toUpperCase()}`,
    ram: `${[4, 8, 16, 32][Math.floor(Math.random() * 4)]} GB`,
    almacenamiento: `${
      [128, 256, 512, 1024][Math.floor(Math.random() * 4)]
    } GB`,
    procesador: ['i3', 'i5', 'i7', 'Ryzen 5', 'Ryzen 7'][
      Math.floor(Math.random() * 5)
    ],
    estadoActual: Math.random() > 0.5 ? 'Operativo' : 'Con fallas',
    fechaCompra: new Date(
      Date.now() - Math.floor(Math.random() * 5 * 365 * 24 * 60 * 60 * 1000)
    ).toISOString(),
  };
}

/**
 * 🔹 Orden de servicio de prueba
 */
export function generarOrdenMock() {
  const trabajos = [
    {
      categoria: 'servicio',
      descripcion: 'Pantalla rota por golpe',
      cantidad: 1,
      precioUnitario: 250,
    },
    {
      categoria: 'servicio',
      descripcion: 'Limpieza interna y cambio de pasta térmica',
      cantidad: 1,
      precioUnitario: 150,
    },
    {
      categoria: 'producto',
      descripcion: 'Disco dañado',
      cantidad: 1,
      precioUnitario: 300,
    },
    {
      categoria: 'servicio',
      descripcion:
        'Instalacion de Sistema Operativo Windows y Programas de ofimatica',
      cantidad: 1,
      precioUnitario: 40,
    },
    {
      categoria: 'servicio',
      descripcion: 'Equipo no enciende',
      cantidad: 1,
      precioUnitario: 40,
    },
  ];

  const lineas = trabajos
    .sort(() => 0.5 - Math.random()) // random subset
    .slice(0, Math.floor(Math.random() * trabajos.length) + 1)
    .map((t) => ({
      ...t,
      subTotal: t.cantidad * t.precioUnitario,
    }));

  const total = lineas.reduce((acc, l) => acc + l.subTotal, 0);

  return {
    diagnosticoCliente: 'Equipo no enciende correctamente',
    observaciones: 'Cliente necesita reparación urgente',
    fechaIngreso: new Date().toISOString().slice(0, 16),
    estado: ['pendiente', 'en-proceso', 'finalizado'][
      Math.floor(Math.random() * 3)
    ],
    tecnicoAsignado: ['tec-123', 'tec-456', 'tec-789'][
      Math.floor(Math.random() * 3)
    ],
    lineas,
    total,
  };
}

/**
 * 🔹 Mock de orden completa (cliente + equipo + orden)
 */
export function generarOrdenServicioMock() {
  return {
    cliente: generarClienteMock(),
    equipo: generarEquipoMock(),
    ordenServicio: generarOrdenMock(),
  };
}
