require('dotenv').config();

const serverConfig = {
  // Configuración del puerto del servidor
  port: process.env.PORT || 3000,
  
  // Entorno de ejecución
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Configuración de seguridad
  security: {
    jwtSecret: process.env.JWT_SECRET,
    apiKeySecret: process.env.API_KEY_SECRET,
    
    // Configuración de rate limiting
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // límite de 100 solicitudes por ventana
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: 'Demasiadas solicitudes, por favor intente más tarde.'
      }
    },
    
    // Configuración de CORS
    cors: {
      origin: process.env.NODE_ENV === 'production' ? [
        'https://heaven.ticketfacil.live',
        'https://kameo.ticketfacil.live'
      ] : '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
      credentials: true
    }
  },
  
  // Configuración de logs
  logs: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
    maxSize: 5242880, // 5MB
    maxFiles: 5,
    colorize: process.env.NODE_ENV !== 'production'
  }
};

// Verifica si estamos en entorno de producción
const isProduction = serverConfig.nodeEnv === 'production';

module.exports = {
  ...serverConfig,
  isProduction
}; 