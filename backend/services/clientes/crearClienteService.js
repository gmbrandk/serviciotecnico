const Cliente = require('@models/Cliente');
const { generarEmailsFicticiosCliente } = require('@services/email.service');
const validarYFormatearTelefono = require('@utils/telefonia/validarYFormatearTelefono');
const { ValidationError } = require('@utils/errors');

const crearClienteService = async (data) => {
  console.log('▶️ [crearClienteService] Iniciando con data:', data);

  const { nombres, apellidos, dni, telefono } = data;

  // 🔹 Validaciones obligatorias
  if (!nombres?.trim()) {
    throw new ValidationError({
      code: 'REQUIRED_FIELD',
      message: 'El campo "nombres" es obligatorio',
      details: { field: 'nombres' },
    });
  }

  if (!apellidos?.trim()) {
    throw new ValidationError({
      code: 'REQUIRED_FIELD',
      message: 'El campo "apellidos" es obligatorio',
      details: { field: 'apellidos' },
    });
  }

  if (!dni?.trim()) {
    throw new ValidationError({
      code: 'REQUIRED_FIELD',
      message: 'El DNI es obligatorio',
      details: { field: 'dni' },
    });
  }

  if (!telefono?.trim()) {
    throw new ValidationError({
      code: 'REQUIRED_FIELD',
      message: 'El teléfono es obligatorio',
      details: { field: 'telefono' },
    });
  }

  // 🔹 Validar y formatear teléfono
  let telefonoFinal;
  try {
    const infoTelefono = validarYFormatearTelefono(telefono);
    telefonoFinal = infoTelefono.telefonoFormateado;
    console.log('📞 [crearClienteService] Teléfono formateado:', telefonoFinal);
  } catch (error) {
    console.error('❌ [crearClienteService] Error teléfono:', error);
    throw new ValidationError({
      code: 'INVALID_PHONE',
      message: error.message,
      details: { input: telefono },
    });
  }

  // 🔹 Email → usar el proporcionado o generar uno ficticio
  let emailFinal = data.email?.trim();
  if (!emailFinal) {
    const opciones = generarEmailsFicticiosCliente({ nombres, apellidos });
    emailFinal = opciones[0]; // 👈 toma la primera opción como email por defecto
    console.log(
      '📧 [crearClienteService] Email ficticio generado:',
      emailFinal
    );
  }

  // 🔹 Validar unicidad
  const existenteDni = await Cliente.findOne({ dni });
  if (existenteDni) {
    console.error('❌ [crearClienteService] DNI duplicado:', dni);
    throw new ValidationError({
      code: 'DUPLICATE_DNI',
      message: `El DNI ${dni} ya está registrado a nombre de "${existenteDni.nombres} ${existenteDni.apellidos}"`,
      details: existenteDni,
    });
  }

  const existenteTelefono = await Cliente.findOne({ telefono: telefonoFinal });
  if (existenteTelefono) {
    console.error(
      '❌ [crearClienteService] Teléfono duplicado:',
      telefonoFinal
    );
    throw new ValidationError({
      code: 'DUPLICATE_PHONE',
      message: `El teléfono ${telefonoFinal} ya está registrado a nombre de "${existenteTelefono.nombres} ${existenteTelefono.apellidos}"`,
      details: existenteTelefono,
    });
  }

  const existenteEmail = await Cliente.findOne({ email: emailFinal });
  if (existenteEmail) {
    console.error('❌ [crearClienteService] Email duplicado:', emailFinal);
    throw new ValidationError({
      code: 'DUPLICATE_EMAIL',
      message: `El correo ${emailFinal} ya está registrado a nombre de "${existenteEmail.nombres} ${existenteEmail.apellidos}"`,
      details: existenteEmail,
    });
  }

  // 🔹 Crear cliente
  const clienteData = {
    ...data,
    telefono: telefonoFinal,
    email: emailFinal,
    estado: 'activo',
    calificacion: 'regular',
  };

  console.log('📝 [crearClienteService] Datos finales cliente:', clienteData);

  const cliente = new Cliente(clienteData);
  const saved = await cliente.save();

  console.log('✅ [crearClienteService] Cliente creado con _id:', saved._id);

  return saved;
};

module.exports = crearClienteService;
