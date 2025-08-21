const Cliente = require('@models/Cliente');
const generarEmailFicticio = require('@utils/generarEmailFicticio');
const validarYFormatearTelefono = require('@utils/telefonia/validarYFormatearTelefono');
const { ValidationError } = require('@utils/errors');

const crearClienteService = async (data) => {
  console.log('▶️ [crearClienteService] Iniciando con data:', data);

  const { nombre, dni, telefono } = data;

  if (!nombre?.trim()) throw new ValidationError('El nombre es obligatorio');
  if (!dni?.trim()) throw new ValidationError('El DNI es obligatorio');
  if (!telefono?.trim())
    throw new ValidationError('El teléfono es obligatorio');

  // Validar y formatear teléfono
  let telefonoFinal;
  try {
    const infoTelefono = validarYFormatearTelefono(telefono);
    telefonoFinal = infoTelefono.telefonoFormateado;
    console.log('📞 [crearClienteService] Teléfono formateado:', telefonoFinal);
  } catch (error) {
    console.error('❌ [crearClienteService] Error teléfono:', error);
    throw new ValidationError(error.message);
  }

  // Email obligatorio → generar si falta
  let emailFinal = data.email?.trim() || generarEmailFicticio({ nombre, dni });
  console.log('📧 [crearClienteService] Email final:', emailFinal);

  // Validar unicidad
  if (await Cliente.findOne({ dni })) {
    console.error('❌ [crearClienteService] DNI duplicado:', dni);
    throw new ValidationError('Ya existe un cliente con ese DNI');
  }
  if (await Cliente.findOne({ telefono: telefonoFinal })) {
    console.error(
      '❌ [crearClienteService] Teléfono duplicado:',
      telefonoFinal
    );
    throw new ValidationError('Ya existe un cliente con ese teléfono');
  }
  if (await Cliente.findOne({ email: emailFinal })) {
    console.error('❌ [crearClienteService] Email duplicado:', emailFinal);
    throw new ValidationError('Ya existe un cliente con ese correo');
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

  return saved; // 👈 asegúrate que exista este return
};

module.exports = crearClienteService;
