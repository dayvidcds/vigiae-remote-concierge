export const portalClienteConfig = () => ({
  portalCliente: {
    jwt: {
      secret: process.env.PORTAL_CLIENTE_JWT_SECRET || 'secret-key-portal-change-in-production',
      expiresIn: process.env.PORTAL_CLIENTE_JWT_EXPIRES || '24h',
    },
    database: {
      uri: process.env.PORTAL_CLIENTE_MONGO_URI || 'mongodb://localhost:27017/portal-cliente',
    },
    cache: {
      ttl: parseInt(process.env.PORTAL_CLIENTE_CACHE_TTL || '3600', 10),
      max: parseInt(process.env.PORTAL_CLIENTE_CACHE_MAX || '100', 10),
    },
    links: {
      expiracaoHoras: parseInt(process.env.PORTAL_CLIENTE_LINK_EXPIRACAO || '1', 10),
      baseUrl: process.env.PORTAL_CLIENTE_BASE_URL || 'http://localhost:3000',
    },
    notificacoes: {
      firebaseKey: process.env.PORTAL_CLIENTE_FIREBASE_KEY,
      emailService: process.env.PORTAL_CLIENTE_EMAIL_SERVICE || 'sendgrid',
      emailApiKey: process.env.PORTAL_CLIENTE_EMAIL_API_KEY,
    },
    webhook: {
      secret: process.env.PORTAL_CLIENTE_WEBHOOK_SECRET || 'webhook-secret-change-in-production',
    },
  },
});
