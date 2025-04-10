const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const validateEmailData = require('../middlewares/validateEmailData');
const rateLimiter = require('../middlewares/rateLimiter');

/**
 * Ruta para enviar un correo electrónico
 * POST /api/send-email
 */
router.post('/send-email', rateLimiter, validateEmailData, emailController.sendEmail);

module.exports = router; 