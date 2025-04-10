const emailService = require('../services/emailService');

/**
 * Controlador para la gestión de correos electrónicos
 */
const emailController = {
  /**
   * Enviar un correo electrónico
   * 
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Promise<void>}
   */
  async sendEmail(req, res) {
    try {
      const { empresa, to, subject, text, html } = req.body;
      
      // Enviar el correo usando el servicio
      const result = await emailService.sendEmail({
        empresa,
        to,
        subject,
        text,
        html
      });
      
      res.status(200).json({
        success: true,
        message: 'Correo electrónico enviado con éxito',
        data: result
      });
    } catch (error) {
      console.error('Error al enviar correo:', error);
      
      // Determinar el código de estado HTTP basado en el tipo de error
      let statusCode = 500;
      if (error.message.includes('No se encontró configuración SMTP')) {
        statusCode = 404;
      } else if (error.message.includes('Error de autenticación SMTP')) {
        statusCode = 401;
      } else if (error.message.includes('inválido')) {
        statusCode = 400;
      }
      
      res.status(statusCode).json({
        success: false,
        message: 'Error al enviar el correo electrónico',
        error: error.message
      });
    }
  }
};

module.exports = emailController; 