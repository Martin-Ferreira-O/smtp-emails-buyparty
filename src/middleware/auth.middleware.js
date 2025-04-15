const crypto = require('crypto');
const { server } = require('../config');
const logger = require('../utils/logger');

/**
 * Middleware para validar API Key
 * 
 * Este middleware verifica que la solicitud tenga una API Key válida
 * enviada en el encabezado x-api-key.
 */
const validateApiKey = (req, res, next) => {
  try {
    // Obtener API Key del encabezado
    const apiKey = req.headers['x-api-key'];
    
    // Si no se proporciona API Key, rechazar solicitud
    if (!apiKey) {
      logger.warn('Intento de acceso sin API Key', { 
        ip: req.ip, 
        path: req.path 
      });
      
      return res.status(401).json({
        success: false,
        error: 'Se requiere autenticación con API Key'
      });
    }
    
    // Lista de API Keys válidas (en producción, esto debería estar en una base de datos)
    // En este ejemplo, se genera un hash de la API Key almacenada en variables de entorno
    const apiKeySecret = server.security.apiKeySecret;
    if (!apiKeySecret) {
      logger.error('API_KEY_SECRET no configurada en el servidor');
      return res.status(500).json({
        success: false,
        error: 'Error de configuración del servidor'
      });
    }
    
    // En un entorno real, validaríamos contra una lista de API Keys almacenadas de forma segura
    // Para este ejemplo, usamos la API_KEY_SECRET como una API Key válida
    
    // Crear un hash de la API Key para una comparación segura
    const hashedApiKey = crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');
    
    const hashedSecret = crypto
      .createHash('sha256')
      .update(apiKeySecret)
      .digest('hex');
    
    // Verificar si la API Key es válida
    if (hashedApiKey !== hashedSecret) {
      logger.warn('Intento de acceso con API Key inválida', { 
        ip: req.ip, 
        path: req.path 
      });
      
      return res.status(403).json({
        success: false,
        error: 'API Key inválida'
      });
    }
    
    // Si la API Key es válida, continuar con la solicitud
    logger.debug('API Key válida', { path: req.path });
    next();
  } catch (error) {
    logger.error('Error al validar API Key', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  validateApiKey
}; 