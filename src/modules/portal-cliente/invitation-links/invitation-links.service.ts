import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  InvitationLink,
  InvitationLinkDocument,
} from './schemas/invitation-link.schema';
import {
  Visitor,
  VisitorDocument,
} from '../visitors/schemas/visitor.schema';
import { CreateInvitationLinkDto } from './dto/create-invitation-link.dto';
import { RegisterVisitorViaLinkDto } from './dto/register-visitor-via-link.dto';
import { QRCodeUtil } from '../shared/utils/qrcode.util';
import { DateUtil } from '../shared/utils/date.util';
import { ValidationUtil } from '../shared/utils/validation.util';
import { PORTAL_CLIENTE_CONSTANTS } from '../shared/constants/portal-cliente.constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LinksConviteService {
  constructor(
    @InjectModel(InvitationLink.name, 'portal-cliente')
    private linkModel: Model<InvitationLinkDocument>,
    @InjectModel(Visitor.name, 'portal-cliente')
    private visitorModel: Model<VisitorDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {}

  async create(
    moradorId: string,
    createDto: CreateInvitationLinkDto,
  ): Promise<InvitationLinkDocument & { link: string }> {
    const { validadeVisitantes, horarioAcesso, maxVisitantes } = createDto;

    // Valida data de validade
    if (!ValidationUtil.validarDataFutura(validadeVisitantes)) {
      throw new BadRequestException(
        'Data de validade não pode ser no passado',
      );
    }

    // Gera token único
    const token = QRCodeUtil.gerarTokenLink();

    // Define expiração (1 hora a partir de agora)
    const expiracaoHoras = this.configService.get<number>(
      'portalCliente.links.expiracaoHoras',
      1,
    );
    const expiraEm = DateUtil.adicionarHoras(new Date(), expiracaoHoras);

    const link = new this.linkModel({
      residentId: moradorId,
      token,
      visitorsValidUntil: validadeVisitantes,
      accessSchedule: horarioAcesso || 'Qualquer horário',
      maxVisitors: maxVisitantes || 5,
      registeredVisitors: 0,
      expiresAt: expiraEm,
      revoked: false,
    });

    await link.save();

    // Salva no cache para acesso rápido
    await this.cacheManager.set(
      `${PORTAL_CLIENTE_CONSTANTS.CACHE_KEYS.LINK_PREFIX}${token}`,
      {
        moradorId: link.residentId.toString(),
        validadeVisitantes: link.visitorsValidUntil,
        horarioAcesso: link.accessSchedule,
        maxVisitantes: link.maxVisitors,
        visitantesCadastrados: link.registeredVisitors,
        expiraEm: link.expiresAt,
      },
      PORTAL_CLIENTE_CONSTANTS.CACHE_TTL.LINK,
    );

    const baseUrl = this.configService.get<string>(
      'portalCliente.links.baseUrl',
    );
    const linkCompleto = `${baseUrl}/convite/${token}`;

    return {
      ...link.toObject(),
      link: linkCompleto,
    } as any;
  }

  async findByToken(token: string) {
    // Busca no cache primeiro
    let linkData: any = await this.cacheManager.get(
      `${PORTAL_CLIENTE_CONSTANTS.CACHE_KEYS.LINK_PREFIX}${token}`,
    );

    if (!linkData) {
      // Busca no banco de dados
      const link = await this.linkModel
        .findOne({ token })
        .populate('residentId', 'name unit condominiumId')
        .exec();

      if (!link) {
        throw new NotFoundException('Link não encontrado');
      }

      linkData = {
        moradorId: link.residentId,
        validadeVisitantes: link.visitorsValidUntil,
        horarioAcesso: link.accessSchedule,
        maxVisitantes: link.maxVisitors,
        visitantesCadastrados: link.registeredVisitors,
        expiraEm: link.expiresAt,
        revogado: link.revoked,
      };
    }

    // Validações
    if (linkData.revogado) {
      throw new BadRequestException(
        PORTAL_CLIENTE_CONSTANTS.MESSAGES.LINK_REVOGADO,
      );
    }

    if (DateUtil.isExpirado(linkData.expiraEm)) {
      throw new BadRequestException(
        PORTAL_CLIENTE_CONSTANTS.MESSAGES.LINK_EXPIRADO,
      );
    }

    if (linkData.visitantesCadastrados >= linkData.maxVisitantes) {
      throw new BadRequestException(
        PORTAL_CLIENTE_CONSTANTS.MESSAGES.LINK_LIMITE_ATINGIDO,
      );
    }

    return linkData;
  }

  async cadastrarVisitante(token: string, dto: RegisterVisitorViaLinkDto) {
    const linkData = await this.findByToken(token);

    // Busca link completo do banco
    const link = await this.linkModel.findOne({ token }).exec();

    if (!link) {
      throw new NotFoundException('Link não encontrado');
    }

    // Valida documento
    if (!ValidationUtil.validarCPF(dto.documento)) {
      throw new BadRequestException('Documento/CPF inválido');
    }

    // Cria visitor
    const visitor = new this.visitorModel({
      residentId: link.residentId,
      name: dto.nome,
      document: ValidationUtil.limparDocumento(dto.documento),
      phone: dto.telefone,
      validUntil: link.visitorsValidUntil,
      accessSchedule: link.accessSchedule,
      registeredViaLink: true,
      invitationLinkId: link._id,
      active: true,
    });

    await visitor.save();

    // Incrementa contador
    link.registeredVisitors += 1;
    await link.save();

    // Atualiza cache
    await this.cacheManager.set(
      `${PORTAL_CLIENTE_CONSTANTS.CACHE_KEYS.LINK_PREFIX}${token}`,
      {
        moradorId: link.residentId.toString(),
        validadeVisitantes: link.visitorsValidUntil,
        horarioAcesso: link.accessSchedule,
        maxVisitantes: link.maxVisitors,
        visitantesCadastrados: link.registeredVisitors,
        expiraEm: link.expiresAt,
      },
      PORTAL_CLIENTE_CONSTANTS.CACHE_TTL.LINK,
    );

    return {
      mensagem: 'Cadastro realizado com sucesso!',
      visitor: {
        nome: visitor.name,
        validade: visitor.validUntil,
        horario: visitor.accessSchedule,
      },
    };
  }

  async revogar(id: string, moradorId: string) {
    const link = await this.linkModel.findOne({ _id: id, residentId: moradorId }).exec();

    if (!link) {
      throw new NotFoundException('Link não encontrado');
    }

    link.revoked = true;
    await link.save();

    // Remove do cache
    await this.cacheManager.del(
      `${PORTAL_CLIENTE_CONSTANTS.CACHE_KEYS.LINK_PREFIX}${link.token}`,
    );

    return { mensagem: 'Link revogado com sucesso' };
  }

  async findAllByMorador(moradorId: string) {
    return this.linkModel
      .find({ residentId: moradorId })
      .sort({ createdAt: -1 })
      .exec();
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async expirarLinksAntigos() {
    const agora = new Date();

    // Busca links expirados
    const linksExpirados = await this.linkModel
      .find({
        expiresAt: { $lt: agora },
        revoked: false,
      })
      .exec();

    // Marca como revogados
    for (const link of linksExpirados) {
      link.revoked = true;
      await link.save();

      // Remove do cache
      await this.cacheManager.del(
        `${PORTAL_CLIENTE_CONSTANTS.CACHE_KEYS.LINK_PREFIX}${link.token}`,
      );
    }

    // Limpa links antigos (> 7 dias)
    const diasLimpeza = PORTAL_CLIENTE_CONSTANTS.LIMITES.LINK_LIMPEZA_DIAS;
    const dataLimite = DateUtil.adicionarDias(new Date(), -diasLimpeza);

    await this.linkModel.deleteMany({
      createdAt: { $lt: dataLimite },
    });

    console.log(
      `Links expirados: ${linksExpirados.length} | Limpeza executada`,
    );
  }
}
