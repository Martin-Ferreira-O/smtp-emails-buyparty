const emailService = require('../services/email.service');
const { validateEmailData } = require('../utils/validators');
const logger = require('../utils/logger');

/**
 * Controlador para enviar un correo electrónico
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const sendEmail = async (req, res) => {
  try {
    const emailData = req.body;
    
    // Validar datos del correo
    const validation = validateEmailData(emailData);
    if (!validation.isValid) {
      logger.warn('Datos de correo inválidos', { 
        error: validation.message, 
        ip: req.ip 
      });
      
      return res.status(400).json({
        success: false,
        error: validation.message
      });
    }
    
    // Enviar correo
    const result = await emailService.sendEmail(emailData);
    
    // Responder con éxito
    res.status(200).json({
      success: true,
      messageId: result.messageId
    });
  } catch (error) {
    logger.error('Error al procesar solicitud de envío de correo', { 
      error: error.message, 
      ip: req.ip 
    });
    
    res.status(500).json({
      success: false,
      error: 'Error al enviar correo'
    });
  }
};

/**
 * Controlador para verificar el estado del servicio SMTP
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const checkSmtpStatus = async (req, res) => {
  try {
    const { service } = req.params;
    
    // Validar servicio
    if (!service || !['heaven', 'kameo'].includes(service.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Servicio inválido. Debe ser "heaven" o "kameo"'
      });
    }
    
    // Verificar conexión SMTP
    const isConnected = await emailService.verifySmtpConnection(service);
    
    res.status(200).json({
      success: true,
      service,
      status: isConnected ? 'connected' : 'disconnected'
    });
  } catch (error) {
    logger.error('Error al verificar estado SMTP', { 
      error: error.message, 
      ip: req.ip 
    });
    
    res.status(500).json({
      success: false,
      error: 'Error al verificar estado SMTP'
    });
  }
};

module.exports = {
  sendEmail,
  checkSmtpStatus
}; 