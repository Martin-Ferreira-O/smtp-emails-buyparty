/**
 * Utilidades para validación de datos de entrada
 */

/**
 * Valida una dirección de correo electrónico
 * @param {string} email - Dirección de correo a validar
 * @returns {boolean} - true si el email es válido, false en caso contrario
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  // Expresión regular para validar emails
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  return emailRegex.test(email);
};

/**
 * Valida que un objeto tenga todos los campos requeridos
 * @param {Object} data - Objeto a validar
 * @param {Array<string>} requiredFields - Lista de campos requeridos
 * @returns {Object} - Objeto con el resultado de la validación
 */
const validateRequiredFields = (data, requiredFields) => {
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      missingFields: requiredFields,
      message: 'No se proporcionaron datos'
    };
  }
  
  const missingFields = requiredFields.filter(field => {
    // Verifica si el campo existe y no es undefined, null, o una cadena vacía
    const value = data[field];
    return value === undefined || value === null || value === '';
  });
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
    message: missingFields.length > 0 
      ? `Campos requeridos faltantes: ${missingFields.join(', ')}`
      : ''
  };
};

/**
 * Valida los datos para enviar un correo electrónico
 * @param {Object} emailData - Datos del correo a validar
 * @returns {Object} - Objeto con el resultado de la validación
 */
const validateEmailData = (emailData) => {
  // Verificar campos requeridos
  const requiredFields = ['to', 'subject', 'message', 'service'];
  const fieldsValidation = validateRequiredFields(emailData, requiredFields);
  
  if (!fieldsValidation.isValid) {
    return fieldsValidation;
  }
  
  // Validar dirección de correo electrónico del destinatario
  if (!isValidEmail(emailData.to)) {
    return {
      isValid: false,
      message: 'La dirección de correo del destinatario no es válida'
    };
  }
  
  // Validar dirección del remitente si está presente
  if (emailData.from && !isValidEmail(emailData.from)) {
    return {
      isValid: false,
      message: 'La dirección de correo del remitente no es válida'
    };
  }
  
  // Validar que el servicio sea uno de los permitidos (heaven o kameo)
  const validServices = ['heaven', 'kameo'];
  if (!validServices.includes(emailData.service.toLowerCase())) {
    return {
      isValid: false,
      message: `El servicio debe ser uno de los siguientes: ${validServices.join(', ')}`
    };
  }
  
  return {
    isValid: true,
    message: ''
  };
};

/**
 * Sanitiza contenido HTML para prevenir ataques XSS
 * @param {string} html - Contenido HTML a sanitizar
 * @returns {string} - HTML sanitizado
 */
const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  
  // Lista de patrones maliciosos a reemplazar
  const patterns = [
    { search: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, replace: '' },
    { search: /javascript:/gi, replace: 'removed:' },
    { search: /on\w+=/gi, replace: 'removed=' }
  ];
  
  // Aplicar cada patrón de reemplazo
  let sanitized = html;
  patterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern.search, pattern.replace);
  });
  
  return sanitized;
};

module.exports = {
  isValidEmail,
  validateRequiredFields,
  validateEmailData,
  sanitizeHtml
}; 