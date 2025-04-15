# API de Envío de Correos Electrónicos

API RESTful segura para enviar correos electrónicos a través de servidores SMTP desde múltiples dominios.

## Características

- Envío de correos electrónicos desde diferentes dominios (Heaven, Kameo)
- Autenticación mediante API Keys
- Conexión segura con HTTPS
- Registro detallado de actividades para auditoría
- Validación robusta de entradas
- Medidas de seguridad contra ataques comunes

## Requisitos

- Node.js v14 o superior
- Cuenta SMTP para cada dominio de correo

## Instalación

1. Clonar el repositorio:
   ```
   git clone https://github.com/tu-usuario/smtp-backend.git
   cd smtp-backend
   ```

2. Instalar dependencias:
   ```
   npm install
   ```

3. Configurar variables de entorno:
   ```
   cp .env.example .env
   ```
   Edita el archivo `.env` con tus configuraciones.

## Uso

### Iniciar en modo desarrollo
```
npm run dev
```

### Iniciar en modo producción
```
npm start
```

### Ejecutar pruebas
```
npm test
```

## Endpoints

### POST /api/send-email

Envía un correo electrónico utilizando la configuración SMTP del dominio especificado.

#### Parámetros de solicitud

```json
{
  "to": "destinatario@ejemplo.com",
  "from": "no-reply@heaven.ticketfacil.live",
  "subject": "Asunto del correo",
  "message": "Contenido del correo electrónico",
  "service": "heaven"  // "heaven" o "kameo"
}
```

#### Encabezados requeridos

```
x-api-key: TU_API_KEY
```

#### Respuesta exitosa

```json
{
  "success": true,
  "messageId": "1234567890@example.com"
}
```

#### Respuesta de error

```json
{
  "success": false,
  "error": "Descripción del error"
}
```

## Seguridad

- La autenticación se realiza mediante API Keys
- Todas las credenciales SMTP están cifradas en el archivo .env
- La comunicación con el servidor SMTP utiliza TLS/SSL
- Implementación de medidas contra inyección de correo y otros ataques

## Licencia

MIT 