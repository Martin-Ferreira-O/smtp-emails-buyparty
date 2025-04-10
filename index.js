require('dotenv').config();
const express = require('express');
const emailRoutes = require('./src/routes/emailRoutes');

// Crear la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Configuración de rutas
app.use('/api', emailRoutes);

// Ruta de inicio para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.json({
    message: 'API de envío de correos electrónicos funcionando correctamente',
    endpoints: {
      sendEmail: '/api/send-email'
    }
  });
});

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Solo iniciar el servidor si no estamos en ambiente de test
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
  });
}

// Exportar la aplicación para testing
module.exports = app;
