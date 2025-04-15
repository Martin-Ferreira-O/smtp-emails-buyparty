require('dotenv').config();

/**
 * Configuración de servicios SMTP
 * Cada servicio tiene su propia configuración de servidor SMTP
 */
const smtpConfig = {
  // Configuración para el servicio Heaven
  heaven: {
    host: process.env.HEAVEN_SMTP_HOST,
    port: parseInt(process.env.HEAVEN_SMTP_PORT, 10),
    secure: parseInt(process.env.HEAVEN_SMTP_PORT, 10) === 465, // true para puerto 465, false para otros puertos
    auth: {
      user: process.env.HEAVEN_SMTP_USER,
      pass: process.env.HEAVEN_SMTP_PASS
    },
    from: process.env.HEAVEN_SMTP_FROM || 'no-reply@heaven.ticketfacil.live',
    tls: {
      rejectUnauthorized: false //process.env.NODE_ENV === 'production' // Rechazar conexiones no autorizadas en producción
    }
  },
  
  // Configuración para el servicio Kameo
  kameo: {
    host: process.env.KAMEO_SMTP_HOST,
    port: parseInt(process.env.KAMEO_SMTP_PORT, 10),
    secure: parseInt(process.env.KAMEO_SMTP_PORT, 10) === 465, // true para puerto 465, false para otros puertos
    auth: {
      user: process.env.KAMEO_SMTP_USER,
      pass: process.env.KAMEO_SMTP_PASS
    },
    from: process.env.KAMEO_SMTP_FROM || 'no-reply@kameo.ticketfacil.live',
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production' // Rechazar conexiones no autorizadas en producción
    }
  }
};

/**
 * Obtiene la configuración SMTP para un servicio específico
 * @param {string} service - Nombre del servicio (heaven o kameo)
 * @returns {Object} Configuración SMTP del servicio
 */
const getSmtpConfig = (service) => {
  const config = smtpConfig[service.toLowerCase()];
  
  if (!config) {
    throw new Error(`Configuración SMTP no encontrada para el servicio: ${service}`);
  }
  
  return config;
};

module.exports = {
  getSmtpConfig,
  services: Object.keys(smtpConfig)
}; 
