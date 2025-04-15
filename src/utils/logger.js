const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config').server.logs;

// Asegurar que el directorio de logs exista
const logDir = path.dirname(config.file);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Definir formato para los logs
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Crear el logger
const logger = winston.createLogger({
  level: config.level,
  format: logFormat,
  defaultMeta: { service: 'smtp-api' },
  transports: [
    // Escribir logs en archivo
    new winston.transports.File({
      filename: config.file,
      maxsize: config.maxSize,
      maxFiles: config.maxFiles,
      tailable: true
    }),
    // Log de errores separado
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: config.maxSize,
      maxFiles: config.maxFiles
    })
  ]
});

// Si no estamos en producción, también mostramos logs en consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Sanitizar datos sensibles antes de loggear
const sanitizeData = (data) => {
  if (!data) return data;
  
  // Si es un objeto, sanitizamos sus propiedades
  if (typeof data === 'object' && data !== null) {
    const sanitized = { ...data };
    
    // Lista de campos sensibles a ocultar
    const sensitiveFields = ['password', 'pass', 'secret', 'token', 'apiKey', 'api_key', 'x-api-key'];
    
    // Sanitizar campos sensibles
    for (const key of Object.keys(sanitized)) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        // Recursivamente sanitizar objetos anidados
        sanitized[key] = sanitizeData(sanitized[key]);
      }
    }
    
    return sanitized;
  }
  
  return data;
};

// Métodos de log con sanitización
const logWithSanitization = {
  error: (message, data) => logger.error(message, sanitizeData(data)),
  warn: (message, data) => logger.warn(message, sanitizeData(data)),
  info: (message, data) => logger.info(message, sanitizeData(data)),
  http: (message, data) => logger.http(message, sanitizeData(data)),
  verbose: (message, data) => logger.verbose(message, sanitizeData(data)),
  debug: (message, data) => logger.debug(message, sanitizeData(data))
};

module.exports = logWithSanitization; 