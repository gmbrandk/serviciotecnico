const Cliente = require('@models/Cliente');
const { generarEmailsFicticiosCliente } = require('@services/email.service');
const validarYFormatearTelefono = require('@utils/telefonia/validarYFormatearTelefono');
const { ValidationError } = require('@utils/errors');

const crearClienteService = async (data, { session } = {}) => {
  console.log('▶️ [crearClienteService] Iniciando con data:', data);

  const { nombres, apellidos, dni, telefono } = data;

  // 🔹 Validaciones obligatorias
  if (!nombres?.trim())
    throw new ValidationError({
      code: 'REQUIRED_FIELD',
      message: 'El campo "nombres" es obligatorio',
      details: { field: 'nombres' },
    });
  if (!apellidos?.trim())
    throw new ValidationError({
      code: 'REQUIRED_FIELD',
      message: 'El campo "apellidos" es obligatorio',
      details: { field: 'apellidos' },
    });
  if (!dni?.trim())
    throw new ValidationError({
      code: 'REQUIRED_FIELD',
      message: 'El DNI es obligatorio',
      details: { field: 'dni' },
    });
  if (!telefono?.trim())
    throw new ValidationError({
      code: 'REQUIRED_FIELD',
      message: 'El teléfono es obligatorio',
      details: { field: 'telefono' },
    });

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
    emailFinal = opciones[0];
    console.log(
      '📧 [crearClienteService] Email ficticio generado:',
      emailFinal
    );
  }

  // 🔹 Validar unicidad con session
  const existenteDni = await Cliente.findOne({ dni: dni.trim() }).session(
    session || undefined
  );
  if (existenteDni)
    throw new ValidationError({
      code: 'DUPLICATE_DNI',
      message: `El DNI ${dni} ya está registrado`,
    });

  const existenteTelefono = await Cliente.findOne({
    telefono: telefonoFinal,
  }).session(session || undefined);
  if (existenteTelefono)
    throw new ValidationError({
      code: 'DUPLICATE_PHONE',
      message: `Teléfono ya registrado`,
    });

  const existenteEmail = await Cliente.findOne({ email: emailFinal }).session(
    session || undefined
  );
  if (existenteEmail)
    throw new ValidationError({
      code: 'DUPLICATE_EMAIL',
      message: `Email ya registrado`,
    });

  // 🔹 Crear cliente
  const cliente = new Cliente({
    nombres: nombres.trim(),
    apellidos: apellidos.trim(),
    dni: dni.trim(),
    telefono: telefonoFinal,
    email: emailFinal,
    estado: 'activo',
    calificacion: 'regular',
  });

  console.log(
    '📝 [crearClienteService] Datos finales cliente:',
    cliente.toObject()
  );

  const saved = await cliente.save({ session });
  console.log('✅ [crearClienteService] Cliente creado con _id:', saved._id);

  return saved;
};

module.exports = crearClienteService;
