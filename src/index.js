require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const https = require('https');
const http = require('http');

const config = require('./config');
const logger = require('./utils/logger');
const apiRoutes = require('./routes');

// Crear aplicación Express
const app = express();

// Middleware de seguridad
app.use(helmet()); // Protección de encabezados HTTP
app.use(cors(config.server.security.cors)); // Configuración CORS

// Middleware para limitar tasa de peticiones
app.use(rateLimit(config.server.security.rateLimit));

// Middleware para parsear JSON
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Middleware de logging HTTP
const morganFormat = config.server.isProduction ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.http(message.trim())
  }
}));

// Rutas de la API
app.use('/api', apiRoutes);

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  logger.error('Error no controlado', { error: err.message, stack: err.stack });
  
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  logger.warn(`Ruta no encontrada: ${req.originalUrl}`, { ip: req.ip });
  
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada'
  });
});

// Configuración del puerto
const PORT = config.server.port;

// Función para iniciar el servidor
const startServer = (appInstance = app) => {
  let server;
  
  // Verificar si estamos en producción y tenemos certificados SSL
  if (config.server.isProduction) {
    try {
      // Ruta a los certificados (ajustar según sea necesario)
      const privateKeyPath = process.env.SSL_KEY_PATH;
      const certificatePath = process.env.SSL_CERT_PATH;

      // Verificar si existen los certificados
      if (fs.existsSync(privateKeyPath) && fs.existsSync(certificatePath)) {
        const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
        const certificate = fs.readFileSync(certificatePath, 'utf8');
        
        const credentials = { key: privateKey, cert: certificate };
        
        // Crear servidor HTTPS
        server = https.createServer(credentials, appInstance);
        logger.info('Iniciando servidor HTTPS');
      } else {
        logger.warn('Certificados SSL no encontrados, iniciando servidor HTTP');
        server = http.createServer(appInstance);
      }
    } catch (error) {
      logger.error('Error al configurar SSL', { error: error.message });
      logger.warn('Iniciando servidor en modo HTTP como fallback');
      server = http.createServer(appInstance);
    }
  } else {
    // En desarrollo, usamos HTTP
    server = http.createServer(appInstance);
    logger.info('Iniciando servidor HTTP (entorno de desarrollo)');
  }
  
  // Iniciar servidor
  server.listen(PORT, () => {
    logger.info(`Servidor corriendo en el puerto ${PORT}`);
    logger.info(`Modo: ${config.server.nodeEnv}`);
    logger.info(`URL: ${config.server.isProduction ? 'https' : 'http'}://localhost:${PORT}`);
  });
  
  // Manejo de errores del servidor
  server.on('error', (error) => {
    logger.error('Error en el servidor', { error: error.message });
    process.exit(1);
  });
  
  // Manejo de señales para cierre graceful
  process.on('SIGTERM', () => gracefulShutdown(server));
  process.on('SIGINT', () => gracefulShutdown(server));

  return server;
};

// Función para detener el servidor de forma graceful
const gracefulShutdown = (server) => {
  logger.info('Recibida señal de terminación, cerrando servidor...');
  
  server.close(() => {
    logger.info('Servidor cerrado con éxito');
    process.exit(0);
  });
  
  // Forzar cierre después de 10 segundos si no se cierra correctamente
  setTimeout(() => {
    logger.error('No se pudo cerrar el servidor con gracia, forzando cierre');
    process.exit(1);
  }, 10000);
};

// Iniciar el servidor
startServer();

module.exports = {
  startServer,
  gracefulShutdown
};