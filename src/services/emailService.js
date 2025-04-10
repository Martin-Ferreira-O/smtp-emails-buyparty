const nodemailer = require('nodemailer');
const { getSmtpConfig, getSenderEmail } = require('../config/smtp');

/**
 * Servicio para enviar correos electrónicos
 */
class EmailService {
  /**
   * Envía un correo electrónico usando la configuración de la empresa especificada
   * 
   * @param {Object} emailData - Datos del correo a enviar
   * @param {string} emailData.empresa - Nombre de la empresa (remitente)
   * @param {string} emailData.to - Destinatario del correo
   * @param {string} emailData.subject - Asunto del correo
   * @param {string} emailData.text - Contenido en texto plano (opcional)
   * @param {string} emailData.html - Contenido en HTML (opcional)
   * @returns {Promise<Object>} Resultado del envío
   * @throws {Error} Error si la configuración SMTP no existe o hay un problema al enviar
   */
  async sendEmail({ empresa, to, subject, text, html }) {
    // Obtener la configuración SMTP para la empresa especificada
    const smtpConfig = getSmtpConfig(empresa);
    if (!smtpConfig) {
      throw new Error(`No se encontró configuración SMTP para la empresa: ${empresa}`);
    }

    // Obtener el correo del remitente
    const from = getSenderEmail(empresa);
    if (!from) {
      throw new Error(`No se encontró el correo remitente para la empresa: ${empresa}`);
    }

    try {
      // Crear el transportador SMTP
      const transporter = nodemailer.createTransport(smtpConfig);

      // Configurar el correo
      const mailOptions = {
        from,
        to,
        subject,
        text: text || '',
        html: html || ''
      };

      // Enviar el correo
      const info = await transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: info.messageId,
        empresa,
        to
      };
    } catch (error) {
      // Capturar y reenviar el error con un mensaje más claro
      let errorMessage = 'Error al enviar el correo electrónico';
      
      if (error.code === 'EAUTH') {
        errorMessage = 'Error de autenticación SMTP. Credenciales incorrectas.';
      } else if (error.code === 'ESOCKET') {
        errorMessage = 'Error de conexión con el servidor SMTP.';
      } else if (error.code === 'EENVELOPE') {
        errorMessage = 'Error en el formato del correo electrónico (remitente o destinatario inválido).';
      }
      
      throw new Error(`${errorMessage}: ${error.message}`);
    }
  }
}

module.exports = new EmailService(); 