require('dotenv').config();

/**
 * Configuración de las credenciales SMTP para cada empresa
 */
const smtpConfig = {
  // Configuración para empresa1
  empresa1: {
    host: process.env.SMTP_EMPRESA1_HOST,
    port: parseInt(process.env.SMTP_EMPRESA1_PORT || '587', 10),
    secure: process.env.SMTP_EMPRESA1_SECURE === 'true',
    auth: {
      user: process.env.SMTP_EMPRESA1_USER,
      pass: process.env.SMTP_EMPRESA1_PASS
    }
  },
  // Configuración para empresa2
  empresa2: {
    host: process.env.SMTP_EMPRESA2_HOST,
    port: parseInt(process.env.SMTP_EMPRESA2_PORT || '587', 10),
    secure: process.env.SMTP_EMPRESA2_SECURE === 'true',
    auth: {
      user: process.env.SMTP_EMPRESA2_USER,
      pass: process.env.SMTP_EMPRESA2_PASS
    }
  }
  // Puedes añadir más empresas siguiendo el mismo patrón
};

/**
 * Función para obtener la configuración SMTP de una empresa específica
 * @param {string} empresa - Nombre de la empresa
 * @returns {Object|null} Configuración SMTP o null si no existe
 */
const getSmtpConfig = (empresa) => {
  return smtpConfig[empresa] || null;
};

/**
 * Función para obtener el correo electrónico de remitente de una empresa
 * @param {string} empresa - Nombre de la empresa
 * @returns {string|null} Correo electrónico o null si no existe
 */
const getSenderEmail = (empresa) => {
  const config = smtpConfig[empresa];
  return config ? config.auth.user : null;
};

module.exports = {
  getSmtpConfig,
  getSenderEmail
}; 