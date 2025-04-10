const request = require('supertest');
const app = require('../index');
const emailService = require('../src/services/emailService');

// Mock del servicio de correo electrónico
jest.mock('../src/services/emailService');

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    test('debería devolver la página de inicio correctamente', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('POST /api/send-email', () => {
    test('debería enviar un correo exitosamente', async () => {
      // Configurar el mock del servicio
      emailService.sendEmail.mockResolvedValue({
        success: true,
        messageId: 'test-message-id',
        empresa: 'empresa1',
        to: 'test@example.com'
      });

      const emailData = {
        empresa: 'empresa1',
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test message',
        html: '<p>Test message</p>'
      };

      const response = await request(app)
        .post('/api/send-email')
        .send(emailData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Correo electrónico enviado con éxito');
      expect(response.body.data).toHaveProperty('messageId', 'test-message-id');
      
      // Verificar que se llamó al servicio con los datos correctos
      expect(emailService.sendEmail).toHaveBeenCalledWith(emailData);
    });

    test('debería rechazar cuando faltan datos requeridos', async () => {
      const emailData = {
        // Falta el campo empresa
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test message'
      };

      const response = await request(app)
        .post('/api/send-email')
        .send(emailData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toEqual(expect.arrayContaining([
        expect.stringContaining('empresa')
      ]));
      
      // Verificar que no se llamó al servicio
      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });

    test('debería manejar errores del servicio de correo', async () => {
      // Configurar el mock para simular un error
      emailService.sendEmail.mockRejectedValue(
        new Error('No se encontró configuración SMTP para la empresa: empresa_inexistente')
      );

      const emailData = {
        empresa: 'empresa_inexistente',
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test message'
      };

      const response = await request(app)
        .post('/api/send-email')
        .send(emailData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('No se encontró configuración SMTP');
    });

    test('debería rechazar correos electrónicos con formato inválido', async () => {
      const emailData = {
        empresa: 'empresa1',
        to: 'email-invalido',
        subject: 'Test Subject',
        text: 'Test message'
      };

      const response = await request(app)
        .post('/api/send-email')
        .send(emailData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.errors).toEqual(expect.arrayContaining([
        expect.stringContaining('formato de correo')
      ]));
    });
  });

  describe('Ruta no encontrada', () => {
    test('debería manejar rutas no encontradas', async () => {
      const response = await request(app).get('/ruta-que-no-existe');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Ruta no encontrada');
    });
  });

  // Cerrar el servidor después de las pruebas para evitar que el proceso quede colgado
  afterAll((done) => {
    done();
  });
}); 