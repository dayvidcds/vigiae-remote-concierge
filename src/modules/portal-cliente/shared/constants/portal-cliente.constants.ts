export const PORTAL_CLIENTE_CONSTANTS = {
  // Roles
  ROLES: {
    ADMIN: 'admin',
    MORADOR: 'morador',
  },

  // Tipos de pessoa
  TIPO_PESSOA: {
    MORADOR: 'morador',
    VISITANTE: 'visitante',
    PRESTADOR: 'prestador',
  },

  // Tipos de acesso
  TIPO_ACESSO: {
    ENTRADA: 'entrada',
    SAIDA: 'saida',
  },

  // Métodos de acesso
  METODO_ACESSO: {
    QRCODE: 'qrcode',
    BIOMETRIA: 'biometria',
    MANUAL: 'manual',
    TAG: 'tag',
  },

  // Tipos de veículo
  TIPO_VEICULO: {
    CARRO: 'carro',
    MOTO: 'moto',
    CAMINHONETE: 'caminhonete',
    SUV: 'suv',
    VAN: 'van',
  },

  // Limites
  LIMITES: {
    MAX_VISITANTES_POR_LINK: 50,
    MIN_VISITANTES_POR_LINK: 1,
    LINK_EXPIRACAO_HORAS: 1,
    LINK_LIMPEZA_DIAS: 7,
    MAX_ITENS_POR_PAGINA: 100,
    DEFAULT_ITENS_POR_PAGINA: 20,
  },

  // Cache keys
  CACHE_KEYS: {
    LINK_PREFIX: 'link:',
    QRCODE_PREFIX: 'qrcode:',
    USER_PREFIX: 'user:',
    CONDOMINIO_PREFIX: 'condominio:',
  },

  // Cache TTL (em milissegundos)
  CACHE_TTL: {
    LINK: 3600000, // 1 hora
    QRCODE: 86400000, // 24 horas
    USER: 1800000, // 30 minutos
    CONDOMINIO: 3600000, // 1 hora
  },

  // Regex patterns
  PATTERNS: {
    CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    TELEFONE: /^\(\d{2}\)\s?\d{4,5}-\d{4}$/,
    PLACA_ANTIGA: /^[A-Z]{3}-\d{4}$/,
    PLACA_MERCOSUL: /^[A-Z]{3}\d[A-Z]\d{2}$/,
    CNPJ: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  },

  // Mensagens
  MESSAGES: {
    LINK_EXPIRADO: 'Link de convite expirado',
    LINK_REVOGADO: 'Link de convite revogado',
    LINK_LIMITE_ATINGIDO: 'Limite de visitantes atingido para este link',
    TOKEN_INVALIDO: 'Token inválido',
    ACESSO_NEGADO: 'Acesso negado',
    NAO_ENCONTRADO: 'Recurso não encontrado',
    NAO_AUTORIZADO: 'Não autorizado',
  },
};
