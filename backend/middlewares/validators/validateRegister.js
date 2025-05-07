const { body } = require('express-validator');

const validarRegistro = [
  // Validación del campo nombre
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres.')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo debe contener letras y espacios.'),

  // Validación del email
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio.')
    .isEmail().withMessage('Debe ser un email válido.')
    .normalizeEmail(),

  // Validación de la contraseña
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria.')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),

  
  body('confirmPassword')
    .notEmpty().withMessage('Debes confirmar tu contraseña.')
    .custom((valor, { req }) => valor === req.body.password)
    .withMessage('Las contraseñas no coinciden.'),


  // Código de acceso (opcional, por jerarquía)
  body('accessCode')
    .optional()
    .trim()
    .isLength({ min: 4 }).withMessage('El código de acceso debe tener al menos 4 caracteres.'),

  // ⚠️ Validaciones adicionales útiles pero no redundantes:

  // Validar formato del email para prevenir inyecciones básicas
  body('email')
    .matches(/^[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+$/).withMessage('Formato de email no válido.'),

  // Validación de contraseña segura (mínimo una letra y un número)
  body('password')
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/).withMessage('La contraseña debe contener al menos una letra y un número.')
];

module.exports = validarRegistro;
