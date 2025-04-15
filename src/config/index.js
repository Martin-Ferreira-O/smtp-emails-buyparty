const serverConfig = require('./server.config');
const smtpConfig = require('./smtp.config');

module.exports = {
  server: serverConfig,
  smtp: smtpConfig
}; 