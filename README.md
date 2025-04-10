# API de Envío de Correos Electrónicos por SMTP

Este proyecto es un backend desarrollado en Node.js con Express que proporciona una API para enviar correos electrónicos a través de un servidor SMTP. Está diseñado para ser utilizado por múltiples empresas, cada una con sus propias credenciales SMTP.

## Características

- Envío de correos electrónicos a través de SMTP usando Nodemailer
- Soporte para múltiples empresas con diferentes credenciales SMTP
- Validación de datos de entrada
- Manejo de errores específicos para problemas comunes (autenticación SMTP, formato de email, etc.)
- Rate limiting para prevenir abusos
- Estructura modular y bien organizada

## Instalación

1. Clona este repositorio:
```bash
git clone <url-del-repositorio>
cd smtp-email
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` basado en `.env.example` y configura tus variables de entorno:
```bash
cp .env.example .env
# Edita el archivo .env con tus credenciales SMTP
```

## Configuración

Edita el archivo `.env` con las credenciales SMTP de tus empresas:

```
# Puerto del servidor
PORT=3000

# Configuración SMTP para empresa1
SMTP_EMPRESA1_HOST=smtp.tuempresa.com
SMTP_EMPRESA1_PORT=587
SMTP_EMPRESA1_USER=empresa1@tuempresa.com
SMTP_EMPRESA1_PASS=tucontraseña
SMTP_EMPRESA1_SECURE=false

# Configuración SMTP para empresa2
SMTP_EMPRESA2_HOST=smtp.tuempresa.com
SMTP_EMPRESA2_PORT=587
SMTP_EMPRESA2_USER=empresa2@tuempresa.com
SMTP_EMPRESA2_PASS=tucontraseña
SMTP_EMPRESA2_SECURE=false

# Para añadir más empresas, sigue el patrón SMTP_EMPRESAX_*
```

## Uso

### Iniciar el servidor

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

### Endpoint de envío de correos

```
POST /api/send-email
```

Cuerpo de la solicitud (JSON):

```json
{
  "empresa": "empresa1",
  "to": "destinatario@dominio.com",
  "subject": "Asunto del correo",
  "text": "Contenido en texto plano",
  "html": "<p>Contenido HTML</p>"
}
```

Todos los campos son obligatorios excepto `text` o `html`. Se debe proporcionar al menos uno de estos dos campos.

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Correo electrónico enviado con éxito",
  "data": {
    "success": true,
    "messageId": "mensaje-id-generado",
    "empresa": "empresa1",
    "to": "destinatario@dominio.com"
  }
}
```

### Ejemplos de respuestas de error

- Datos faltantes:

```json
{
  "success": false,
  "message": "Datos de correo electrónico inválidos",
  "errors": ["El campo 'empresa' es obligatorio"]
}
```

- Empresa no configurada:

```json
{
  "success": false,
  "message": "Error al enviar el correo electrónico",
  "error": "No se encontró configuración SMTP para la empresa: empresa_inexistente"
}
```

## Tests

Para ejecutar los tests:

```bash
npm test
```

## Licencia

[MIT](LICENSE) 