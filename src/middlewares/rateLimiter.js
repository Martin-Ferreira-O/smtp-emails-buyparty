const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Configuración para el rate limiter
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutos por defecto
const max = parseInt(process.env.RATE_LIMIT_MAX || '100', 10); // 100 solicitudes por ventana por defecto

/**
 * Middleware de rate limiting para limitar el número de solicitudes por IP
 */
const limiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true, // Devuelve los headers de rate limit estándar
  legacyHeaders: false, // Desactiva los headers `X-RateLimit-*`
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, por favor intente de nuevo más tarde.'
  }
});

module.exports = limiter; 