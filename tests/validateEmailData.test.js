const validateEmailData = require('../src/middlewares/validateEmailData');

describe('Validate Email Data Middleware Tests', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;

  beforeEach(() => {
    // Configurar mocks para cada prueba
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

    nextFunction = jest.fn();
  });

  test('debería pasar la validación con datos completos', () => {
    validateEmailData(mockRequest, mockResponse, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  test('debería validar cuando solo se proporciona text', () => {
    mockRequest.body.html = undefined;
    validateEmailData(mockRequest, mockResponse, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  test('debería validar cuando solo se proporciona html', () => {
    mockRequest.body.text = undefined;
    validateEmailData(mockRequest, mockResponse, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  test('debería rechazar cuando falta el campo empresa', () => {
    mockRequest.body.empresa = undefined;
    validateEmailData(mockRequest, mockResponse, nextFunction);
    
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.stringContaining('empresa')
        ])
      })
    );
  });

  test('debería rechazar cuando falta el campo to', () => {
    mockRequest.body.to = undefined;
    validateEmailData(mockRequest, mockResponse, nextFunction);
    
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.stringContaining('to')
        ])
      })
    );
  });

  test('debería rechazar cuando el email de destinatario es inválido', () => {
    mockRequest.body.to = 'email-invalido';
    validateEmailData(mockRequest, mockResponse, nextFunction);
    
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.stringContaining('formato de correo')
        ])
      })
    );
  });

  test('debería rechazar cuando falta el asunto', () => {
    mockRequest.body.subject = undefined;
    validateEmailData(mockRequest, mockResponse, nextFunction);
    
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.stringContaining('subject')
        ])
      })
    );
  });

  test('debería rechazar cuando faltan tanto text como html', () => {
    mockRequest.body.text = undefined;
    mockRequest.body.html = undefined;
    validateEmailData(mockRequest, mockResponse, nextFunction);
    
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.stringContaining('text')
        ])
      })
    );
  });
}); 