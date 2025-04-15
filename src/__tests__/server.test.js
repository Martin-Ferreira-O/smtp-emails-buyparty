const fs = require('fs');
const https = require('https');
const http = require('http');
const { startServer } = require('../index');

// Mock de las dependencias
jest.mock('fs');
jest.mock('https');
jest.mock('http');
jest.mock('../utils/logger');
jest.mock('../config', () => ({
  server: {
    isProduction: process.env.NODE_ENV === 'production',
    nodeEnv: process.env.NODE_ENV,
    port: 3000
  }
}));

describe('startServer', () => {
  let mockApp;
  let mockServer;
  let mockHttpsServer;
  let mockHttpServer;

  beforeEach(() => {
    // Reset de los mocks
    jest.clearAllMocks();
    
    // Configuración de mocks básicos
    mockApp = {};
    mockServer = {
      listen: jest.fn().mockImplementation((port, callback) => {
        if (callback) callback();
        return mockServer;
      }),
      close: jest.fn(),
      on: jest.fn()
    };
    mockHttpsServer = {
      listen: jest.fn().mockImplementation((port, callback) => {
        if (callback) callback();
        return mockHttpsServer;
      }),
      close: jest.fn(),
      on: jest.fn()
    };
    mockHttpServer = {
      listen: jest.fn().mockImplementation((port, callback) => {
        if (callback) callback();
        return mockHttpServer;
      }),
      close: jest.fn(),
      on: jest.fn()
    };

    // Mock de createServer
    https.createServer.mockReturnValue(mockHttpsServer);
    http.createServer.mockReturnValue(mockHttpServer);
  });

  describe('En entorno de desarrollo', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('debería iniciar un servidor HTTP', () => {
      const server = startServer(mockApp);
      expect(http.createServer).toHaveBeenCalledWith(mockApp);
      expect(mockHttpServer.listen).toHaveBeenCalled();
      expect(server).toBe(mockHttpServer);
    });
  });

  describe('En entorno de producción', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    describe('con certificados SSL válidos', () => {
      beforeEach(() => {
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockImplementation((path) => {
          if (path.includes('privkey.pem')) return 'private key content';
          if (path.includes('fullchain.pem')) return 'certificate content';
        });
      });

      it('debería iniciar un servidor HTTPS', () => {
        const server = startServer(mockApp);
        expect(https.createServer).toHaveBeenCalled();
        expect(mockHttpsServer.listen).toHaveBeenCalled();
        expect(server).toBe(mockHttpsServer);
      });
    });

    describe('sin certificados SSL', () => {
      beforeEach(() => {
        fs.existsSync.mockReturnValue(false);
      });

      it('debería iniciar un servidor HTTP como fallback', () => {
        const server = startServer(mockApp);
        expect(http.createServer).toHaveBeenCalledWith(mockApp);
        expect(mockHttpServer.listen).toHaveBeenCalled();
        expect(server).toBe(mockHttpServer);
      });
    });

    describe('con error al leer certificados', () => {
      beforeEach(() => {
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockImplementation(() => {
          throw new Error('Error al leer certificado');
        });
      });

      it('debería iniciar un servidor HTTP como fallback', () => {
        const server = startServer(mockApp);
        expect(http.createServer).toHaveBeenCalledWith(mockApp);
        expect(mockHttpServer.listen).toHaveBeenCalled();
        expect(server).toBe(mockHttpServer);
      });
    });
  });

  describe('Manejo de señales', () => {
    it('debería manejar señales SIGTERM y SIGINT', () => {
      const server = startServer(mockApp);
      expect(process.on).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
      expect(process.on).toHaveBeenCalledWith('SIGINT', expect.any(Function));
    });
  });
}); 