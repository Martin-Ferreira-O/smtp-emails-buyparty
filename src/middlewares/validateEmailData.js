/**
 * Middleware para validar los datos del correo electrónico
 * 
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para pasar al siguiente middleware
 * @returns {void}
 */
function validateEmailData(req, res, next) {
  const { empresa, to, subject } = req.body;
  const errors = [];

  // Validar campos obligatorios
  if (!empresa) {
    errors.push('El campo "empresa" es obligatorio');
  }

  if (!to) {
    errors.push('El campo "to" (destinatario) es obligatorio');
  } else if (!isValidEmail(to)) {
    errors.push('El formato de correo electrónico del destinatario es inválido');
  }

  if (!subject) {
    errors.push('El campo "subject" (asunto) es obligatorio');
  }

  // Validar que al menos existe texto o HTML
  if (!req.body.text && !req.body.html) {
    errors.push('Debe proporcionar al menos uno de los campos: "text" o "html"');
  }

  // Si hay errores, devolver una respuesta con los errores
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Datos de correo electrónico inválidos',
      errors
    });
  }

  // Si todo está bien, pasar al siguiente middleware
  next();
}

/**
 * Validar formato de correo electrónico
 * 
 * @param {string} email - Correo electrónico a validar
 * @returns {boolean} - true si es válido, false si no
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = validateEmailData; 