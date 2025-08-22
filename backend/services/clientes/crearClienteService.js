const Cliente = require('@models/Cliente');
const generarEmailFicticio = require('@utils/generarEmailFicticio');
const validarYFormatearTelefono = require('@utils/telefonia/validarYFormatearTelefono');
const { ValidationError } = require('@utils/errors');

const crearClienteService = async (data) => {
  console.log('▶️ [crearClienteService] Iniciando con data:', data);

  const { nombre, dni, telefono } = data;

  // Validaciones obligatorias
  if (!nombre?.trim())
    throw new ValidationError({
      code: 'REQUIRED_FIELD',
      message: 'El nombre es obligatorio',
      details: { field: 'nombre' },
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

  // Validar y formatear teléfono
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

  // Email obligatorio → generar si falta
  let emailFinal = data.email?.trim() || generarEmailFicticio({ nombre, dni });
  console.log('📧 [crearClienteService] Email final:', emailFinal);

  // Validar unicidad
  const existenteDni = await Cliente.findOne({ dni });
  if (existenteDni) {
    console.error('❌ [crearClienteService] DNI duplicado:', dni);
    throw new ValidationError({
      code: 'DUPLICATE_DNI',
      message: `El DNI ${dni} ya está registrado a nombre de "${existenteDni.nombre}"`,
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
      message: `El teléfono ${telefonoFinal} ya está registrado a nombre de "${existenteTelefono.nombre}"`,
      details: existenteTelefono,
    });
  }

  const existenteEmail = await Cliente.findOne({ email: emailFinal });
  if (existenteEmail) {
    console.error('❌ [crearClienteService] Email duplicado:', emailFinal);
    throw new ValidationError({
      code: 'DUPLICATE_EMAIL',
      message: `El correo ${emailFinal} ya está registrado a nombre de "${existenteEmail.nombre}"`,
      details: existenteEmail,
    });
  }

  // Crear cliente
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
