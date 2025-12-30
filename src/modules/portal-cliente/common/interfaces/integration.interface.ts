/**
 * Interface para integração com o sistema principal
 * Permite desacoplamento total entre os backends
 */
export interface IPortalClienteIntegration {
  // Eventos que o Portal emite para o sistema principal
  onVisitanteRegistrado(data: VisitanteRegistradoEvent): Promise<void>;
  onAcessoRegistrado(data: AcessoRegistradoEvent): Promise<void>;
  onLinkConviteGerado(data: LinkConviteGeradoEvent): Promise<void>;
}

export interface VisitanteRegistradoEvent {
  visitanteId: string;
  moradorId: string;
  condominioId: string;
  nome: string;
  dataValidade: Date;
}

export interface AcessoRegistradoEvent {
  condominioId: string;
  tipoPessoa: 'morador' | 'visitante' | 'prestador';
  tipoAcesso: 'entrada' | 'saida';
  pontoAcesso: string;
  dataHora: Date;
  metodoAcesso?: string;
}

export interface LinkConviteGeradoEvent {
  linkId: string;
  moradorId: string;
  condominioId: string;
  token: string;
  expiraEm: Date;
}

export interface CondominoCreatedEvent {
  condominioId: string;
  nome: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  limites?: {
    moradores?: number;
    visitantes?: number;
    veiculos?: number;
  };
  configuracoes?: {
    aprovacaoVisitantes?: boolean;
    linkConviteHabilitado?: boolean;
    qrCodeHabilitado?: boolean;
  };
}

export interface AdminCreatedEvent {
  condominioId: string;
  nome: string;
  email: string;
  senhaTemporaria: string;
  precisaTrocarSenha: boolean;
}
