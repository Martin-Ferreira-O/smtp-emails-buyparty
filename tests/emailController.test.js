const emailController = require('../src/controllers/emailController');
const emailService = require('../src/services/emailService');

// Mock del servicio de correo electrónico
jest.mock('../src/services/emailService');

describe('Email Controller Tests', () => {
  let mockRequest;
  let mockResponse;
  
  beforeEach(() => {
    // Reiniciar los mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Configurar los mocks para request y response
    mockRequest = {
      body: {
        empresa: 'empresa1',
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test message',
        html: '<p>Test message</p>'
      }
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  test('sendEmail debería enviar un correo exitosamente', async () => {
    // Configurar el mock para que devuelva un resultado exitoso
    emailService.sendEmail.mockResolvedValue({
      success: true,
      messageId: 'test-message-id',
      empresa: 'empresa1',
      to: 'test@example.com'
    });

    // Llamar al controlador
    await emailController.sendEmail(mockRequest, mockResponse);

    // Verificar que se llamó al servicio con los parámetros correctos
    expect(emailService.sendEmail).toHaveBeenCalledWith({
      empresa: 'empresa1',
      to: 'test@example.com',
      subject: 'Test Subject',
      text: 'Test message',
      html: '<p>Test message</p>'
    });

    // Verificar la respuesta
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      message: 'Correo electrónico enviado con éxito',
      data: expect.objectContaining({
        success: true,
        messageId: 'test-message-id'
      })
    });
  });

  test('sendEmail debería manejar errores de configuración SMTP no encontrada', async () => {
    // Configurar el mock para simular un error de configuración no encontrada
    const errorMessage = 'No se encontró configuración SMTP para la empresa: empresa_inexistente';
    emailService.sendEmail.mockRejectedValue(new Error(errorMessage));

    // Modificar la solicitud para usar una empresa inexistente
    mockRequest.body.empresa = 'empresa_inexistente';

    // Llamar al controlador
    await emailController.sendEmail(mockRequest, mockResponse);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Error al enviar el correo electrónico',
      error: errorMessage
    });
  });

  test('sendEmail debería manejar errores de autenticación SMTP', async () => {
    // Configurar el mock para simular un error de autenticación
    const errorMessage = 'Error de autenticación SMTP. Credenciales incorrectas.';
    emailService.sendEmail.mockRejectedValue(new Error(errorMessage));

    // Llamar al controlador
    await emailController.sendEmail(mockRequest, mockResponse);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Error al enviar el correo electrónico',
      error: errorMessage
    });
  });

  test('sendEmail debería manejar errores generales', async () => {
    // Configurar el mock para simular un error general
    const errorMessage = 'Error interno al enviar el correo';
    emailService.sendEmail.mockRejectedValue(new Error(errorMessage));

    // Llamar al controlador
    await emailController.sendEmail(mockRequest, mockResponse);

    // Verificar la respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Error al enviar el correo electrónico',
      error: errorMessage
    });
  });
}); 