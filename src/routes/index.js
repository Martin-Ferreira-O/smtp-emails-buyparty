const express = require('express');
const router = express.Router();
const emailRoutes = require('./email.routes');

// Rutas de la API
router.use('/', emailRoutes);

// Ruta para verificar el estado de la API
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 