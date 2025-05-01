const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const { smtp } = require('../config');
const logger = require('../utils/logger');
const { sanitizeHtml } = require('../utils/validators');

// Caché de transportadores SMTP para reutilizarlos
const transporters = {};

/**
 * Obtiene un transportador SMTP para el servicio especificado
 * @param {string} service - Nombre del servicio (heaven o kameo)
 * @returns {Object} - Transportador SMTP de nodemailer
 */
const getTransporter = (service) => {
  // Si ya existe un transportador para este servicio, lo reutilizamos
  if (transporters[service]) {
    return transporters[service];
  }
  
  try {
    // Obtener configuración SMTP para el servicio
    const smtpConfig = smtp.getSmtpConfig(service);
    
    // Crear un nuevo transportador SMTP
    const transporter = nodemailer.createTransport(smtpConfig);
    
    // Almacenar el transportador en caché para futuras solicitudes
    transporters[service] = transporter;
    
    logger.info(`Transportador SMTP creado para el servicio: ${service}`);
    return transporter;
  } catch (error) {
    logger.error(`Error al crear transportador SMTP para el servicio: ${service}`, { error: error.message });
    throw new Error(`No se pudo crear el transportador SMTP: ${error.message}`);
  }
};

/**
 * Verifica la conexión con el servidor SMTP
 * @param {string} service - Nombre del servicio (heaven o kameo)
 * @returns {boolean} - true si la conexión es exitosa, false en caso contrario
 */
const verifySmtpConnection = async (service) => {
  try {
    const transporter = getTransporter(service);
    await transporter.verify();
    logger.info(`Conexión SMTP verificada para el servicio: ${service}`);
    return true;
  } catch (error) {
    logger.error(`Error al verificar conexión SMTP para el servicio: ${service}`, { error: error.message });
    return false;
  }
};

/**
 * Envía un correo electrónico
 * @param {Object} emailData - Datos del correo a enviar
 * @returns {Object} - Resultado del envío
 */
const sendEmail = async (emailData) => {
  const { to, subject, message, service, from, attachments } = emailData;
  const messageId = uuidv4();
  
  try {
    // Obtener configuración SMTP para el servicio
    const smtpConfig = smtp.getSmtpConfig(service);
    
    // Obtener transportador SMTP
    const transporter = getTransporter(service);
    
    // Verificar y loggear los adjuntos
    if (attachments && attachments.length > 0) {
      logger.info('Detalles de adjuntos recibidos:', {
        attachmentsCount: attachments.length,
        attachmentsDetails: attachments.map(att => ({
          filename: att.filename,
          contentType: att.contentType,
          contentDisposition: att.contentDisposition,
          cid: att.cid,
          contentLength: att.content ? att.content.length : 0
        }))
      });
    }
    
    // Configurar opciones de correo
    const mailOptions = {
      from: from || smtpConfig.from,
      to,
      subject,
      text: message, // Versión en texto plano
      html: sanitizeHtml(message), // Versión HTML sanitizada
      messageId: `<${messageId}@${smtpConfig.host}>`,
      headers: {
        'X-Message-ID': messageId
      },
      attachments: attachments || [] // Añadir adjuntos si existen
    };
    
    // Enviar correo
    logger.info(`Enviando correo a ${to} desde servicio ${service}`, { 
      messageId,
      attachmentsCount: attachments?.length || 0,
      hasHtmlContent: !!message
    });
    
    const info = await transporter.sendMail(mailOptions);
    
    logger.info(`Correo enviado exitosamente`, { 
      messageId, 
      to, 
      subject,
      response: info.response,
      attachmentsCount: attachments?.length || 0,
      accepted: info.accepted,
      rejected: info.rejected
    });
    
    return {
      success: true,
      messageId: info.messageId || messageId,
      response: info.response
    };
  } catch (error) {
    logger.error(`Error al enviar correo`, { 
      messageId, 
      to, 
      subject,
      error: error.message,
      attachmentsCount: attachments?.length || 0
    });
    
    throw new Error(`Error al enviar correo: ${error.message}`);
  }
};

module.exports = {
  sendEmail,
  verifySmtpConnection
}; 