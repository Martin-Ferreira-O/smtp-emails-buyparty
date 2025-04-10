jest.mock('nodemailer');
jest.mock('../src/config/smtp');

const nodemailer = require('nodemailer');
const { getSmtpConfig, getSenderEmail } = require('../src/config/smtp');
const emailService = require('../src/services/emailService');

describe('Email Service Tests', () => {
  const mockTransporter = {
    sendMail: jest.fn()
  };

  const mockEmailData = {
    empresa: 'empresa1',
    to: 'test@example.com',
    subject: 'Test Subject',
    text: 'Test message',
    html: '<p>Test message</p>'
  };

  const mockSmtpConfig = {
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: {
      user: 'empresa1@miempresa.com',
      pass: 'password123'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar mocks para cada prueba
    nodemailer.createTransport.mockReturnValue(mockTransporter);
    getSmtpConfig.mockReturnValue(mockSmtpConfig);
    getSenderEmail.mockReturnValue('empresa1@miempresa.com');
    
    mockTransporter.sendMail.mockImplementation((mailOptions) => {
      return Promise.resolve({
        messageId: 'test-message-id'
      });
    });
  });

  test('sendEmail debería enviar un correo correctamente', async () => {
    const result = await emailService.sendEmail(mockEmailData);

    // Verificar que se obtuvo la configuración SMTP correcta
    expect(getSmtpConfig).toHaveBeenCalledWith('empresa1');
    
    // Verificar que se obtuvo el correo del remitente
    expect(getSenderEmail).toHaveBeenCalledWith('empresa1');
    
    // Verificar que se creó el transportador con la configuración correcta
    expect(nodemailer.createTransport).toHaveBeenCalledWith(mockSmtpConfig);
    
    // Verificar que se envió el correo con los datos correctos
    expect(mockTransporter.sendMail).toHaveBeenCalledWith({
      from: 'empresa1@miempresa.com',
      to: 'test@example.com',
      subject: 'Test Subject',
      text: 'Test message',
      html: '<p>Test message</p>'
    });
    
    // Verificar el resultado
    expect(result).toEqual({
      success: true,
      messageId: 'test-message-id',
      empresa: 'empresa1',
      to: 'test@example.com'
    });
  });

  test('sendEmail debería funcionar con solo texto y sin HTML', async () => {
    const emailDataSinHtml = {
      ...mockEmailData,
      html: undefined
    };

    await emailService.sendEmail(emailDataSinHtml);

    expect(mockTransporter.sendMail).toHaveBeenCalledWith({
      from: 'empresa1@miempresa.com',
      to: 'test@example.com',
      subject: 'Test Subject',
      text: 'Test message',
      html: ''
    });
  });

  test('sendEmail debería funcionar con solo HTML y sin texto', async () => {
    const emailDataSinTexto = {
      ...mockEmailData,
      text: undefined
    };

    await emailService.sendEmail(emailDataSinTexto);

    expect(mockTransporter.sendMail).toHaveBeenCalledWith({
      from: 'empresa1@miempresa.com',
      to: 'test@example.com',
      subject: 'Test Subject',
      text: '',
      html: '<p>Test message</p>'
    });
  });

  test('sendEmail debería lanzar un error si no se encuentra la configuración SMTP', async () => {
    // Simular que no se encuentra la configuración SMTP
    getSmtpConfig.mockReturnValue(null);

    await expect(emailService.sendEmail(mockEmailData))
      .rejects
      .toThrow('No se encontró configuración SMTP para la empresa: empresa1');
  });

  test('sendEmail debería lanzar un error si no se encuentra el correo del remitente', async () => {
    // Simular que se encuentra la configuración SMTP pero no el correo del remitente
    getSenderEmail.mockReturnValue(null);

    await expect(emailService.sendEmail(mockEmailData))
      .rejects
      .toThrow('No se encontró el correo remitente para la empresa: empresa1');
  });

  test('sendEmail debería manejar errores de autenticación SMTP', async () => {
    // Simular un error de autenticación
    mockTransporter.sendMail.mockRejectedValue({
      code: 'EAUTH',
      message: 'Invalid credentials'
    });

    await expect(emailService.sendEmail(mockEmailData))
      .rejects
      .toThrow('Error de autenticación SMTP');
  });

  test('sendEmail debería manejar errores de conexión', async () => {
    // Simular un error de conexión
    mockTransporter.sendMail.mockRejectedValue({
      code: 'ESOCKET',
      message: 'Connection timeout'
    });

    await expect(emailService.sendEmail(mockEmailData))
      .rejects
      .toThrow('Error de conexión con el servidor SMTP');
  });

  test('sendEmail debería manejar errores de formato de correo', async () => {
    // Simular un error de formato de correo
    mockTransporter.sendMail.mockRejectedValue({
      code: 'EENVELOPE',
      message: 'Invalid envelope'
    });

    await expect(emailService.sendEmail(mockEmailData))
      .rejects
      .toThrow('Error en el formato del correo electrónico');
  });
}); 