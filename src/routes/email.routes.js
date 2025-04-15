const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');
const { validateApiKey } = require('../middleware/auth.middleware');

/**
 * Ruta para enviar un correo electrónico
 * 
 * POST /api/send-email
 * 
 * Cuerpo de la solicitud:
 * {
 *   "to": "destinatario@ejemplo.com",
 *   "from": "no-reply@heaven.ticketfacil.live", // opcional, se usa la configuración predeterminada si no se proporciona
 *   "subject": "Asunto del correo",
 *   "message": "Contenido del correo electrónico",
 *   "service": "heaven" // "heaven" o "kameo"
 * }
 * 
 * Encabezados requeridos:
 * x-api-key: TU_API_KEY
 */
router.post('/send-email', validateApiKey, emailController.sendEmail);

/**
 * Ruta para verificar el estado del servicio SMTP
 * 
 * GET /api/smtp-status/:service
 * 
 * Parámetros:
 * - service: Nombre del servicio (heaven o kameo)
 * 
 * Encabezados requeridos:
 * x-api-key: TU_API_KEY
 */
router.get('/smtp-status/:service', validateApiKey, emailController.checkSmtpStatus);

module.exports = router; 