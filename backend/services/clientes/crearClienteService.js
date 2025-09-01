const Cliente = require('@models/Cliente');
const { generarEmailsFicticiosCliente } = require('@services/email.service');
const validarYFormatearTelefono = require('@utils/telefonia/validarYFormatearTelefono');
const { ValidationError } = require('@utils/errors');

const crearClienteService = async (data, { session } = {}) => {
  console.log('▶️ [crearClienteService] Iniciando con data:', data);

  let { nombres, apellidos, dni, telefono, email } = data;

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

  // 🔹 Normalizar entradas
  dni = dni.trim().toUpperCase();
  email = email?.trim().toLowerCase();

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
  let emailFinal = email;
  if (!emailFinal) {
    const opciones = generarEmailsFicticiosCliente({ nombres, apellidos });
    emailFinal = opciones[0].toLowerCase();
    console.log(
      '📧 [crearClienteService] Email ficticio generado:',
      emailFinal
    );
  }

  // 🔹 Validar duplicados manualmente (antes de intentar crear)
  const existente = await Cliente.findOne({
    $or: [{ dni }, { telefono: telefonoFinal }, { email: emailFinal }],
  }).session(session || undefined);

  if (existente) {
    let code = 'DUPLICATE_DATA';
    let message = 'Ya existe un cliente con los datos ingresados';

    if (existente.dni === dni) {
      code = 'DUPLICATE_DNI';
      message = `El DNI ${dni} ya está registrado`;
    } else if (existente.telefono === telefonoFinal) {
      code = 'DUPLICATE_PHONE';
      message = `El teléfono ${telefonoFinal} ya está registrado`;
    } else if (existente.email === emailFinal) {
      code = 'DUPLICATE_EMAIL';
      message = `El email ${emailFinal} ya está registrado`;
    }

    throw new ValidationError({ code, message });
  }

  // 🔹 Crear cliente
  const cliente = new Cliente({
    nombres: nombres.trim(),
    apellidos: apellidos.trim(),
    dni,
    telefono: telefonoFinal,
    email: emailFinal,
    estado: 'activo',
    calificacion: 'regular',
  });

  console.log(
    '📝 [crearClienteService] Datos finales cliente:',
    cliente.toObject()
  );

  try {
    const saved = await cliente.save({ session });
    console.log('✅ [crearClienteService] Cliente creado con _id:', saved._id);
    return saved;
  } catch (error) {
    // 🔹 Capturar errores de índice único
    if (error.code === 11000) {
      const campo = Object.keys(error.keyValue)[0];
      throw new ValidationError({
        code: `DUPLICATE_${campo.toUpperCase()}`,
        message: `El ${campo} ya está registrado`,
      });
    }
    throw error;
  }
};

module.exports = crearClienteService;
