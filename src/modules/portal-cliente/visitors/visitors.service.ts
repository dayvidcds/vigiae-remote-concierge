import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Visitor, VisitorDocument } from './schemas/visitor.schema';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { ValidationUtil } from '../shared/utils/validation.util';
import { DateUtil } from '../shared/utils/date.util';

@Injectable()
export class VisitantesService {
  constructor(
    @InjectModel(Visitor.name, 'portal-cliente')
    private visitorModel: Model<VisitorDocument>,
  ) {}

  async create(moradorId: string, createVisitanteDto: CreateVisitorDto): Promise<VisitorDocument> {
    const { documento, dataValidade } = createVisitanteDto;

    // Valida documento
    if (!ValidationUtil.validarCPF(documento)) {
      throw new BadRequestException('Documento/CPF inválido');
    }

    // Valida data de validade
    if (!ValidationUtil.validarDataFutura(dataValidade)) {
      throw new BadRequestException('Data de validade não pode ser no passado');
    }

    const visitor = new this.visitorModel({
      residentId: moradorId,
      name: createVisitanteDto.nome,
      document: ValidationUtil.limparDocumento(documento),
      phone: createVisitanteDto.telefone,
      validUntil: createVisitanteDto.dataValidade,
      accessSchedule: createVisitanteDto.horarioAcesso || 'Qualquer horário',
      notes: createVisitanteDto.observacoes,
      active: true,
      registeredViaLink: false,
    });

    return visitor.save();
  }

  async findAll(moradorId: string): Promise<VisitorDocument[]> {
    return this.visitorModel
      .find({ residentId: moradorId, active: true })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, moradorId: string): Promise<VisitorDocument> {
    const visitor = await this.visitorModel.findById(id).exec();

    if (!visitor) {
      throw new NotFoundException('Visitante não encontrado');
    }

    if (visitor.residentId.toString() !== moradorId) {
      throw new ForbiddenException('Você não pode acessar este visitor');
    }

    return visitor;
  }

  async update(
    id: string,
    moradorId: string,
    updateVisitanteDto: UpdateVisitorDto,
  ): Promise<VisitorDocument> {
    const visitor = await this.findOne(id, moradorId);

    if (updateVisitanteDto.documento) {
      if (!ValidationUtil.validarCPF(updateVisitanteDto.documento)) {
        throw new BadRequestException('Documento/CPF inválido');
      }
      visitor.document = ValidationUtil.limparDocumento(updateVisitanteDto.documento);
    }

    if (updateVisitanteDto.dataValidade) {
      if (!ValidationUtil.validarDataFutura(updateVisitanteDto.dataValidade)) {
        throw new BadRequestException('Data de validade não pode ser no passado');
      }
      visitor.validUntil = updateVisitanteDto.dataValidade;
    }

    if (updateVisitanteDto.nome !== undefined) {
      visitor.name = updateVisitanteDto.nome;
    }
    if (updateVisitanteDto.telefone !== undefined) {
      visitor.phone = updateVisitanteDto.telefone;
    }
    if (updateVisitanteDto.horarioAcesso !== undefined) {
      visitor.accessSchedule = updateVisitanteDto.horarioAcesso;
    }
    if (updateVisitanteDto.observacoes !== undefined) {
      visitor.notes = updateVisitanteDto.observacoes;
    }

    return visitor.save();
  }

  async remove(id: string, moradorId: string): Promise<{ mensagem: string }> {
    const visitor = await this.findOne(id, moradorId);

    visitor.active = false;
    await visitor.save();

    return { mensagem: 'Visitante removido com sucesso' };
  }

  async findAtivos(moradorId: string): Promise<VisitorDocument[]> {
    const hoje = new Date();

    return this.visitorModel
      .find({
        residentId: moradorId,
        active: true,
        validUntil: { $gte: hoje },
      })
      .sort({ validUntil: 1 })
      .exec();
  }

  async countAtivos(moradorId: string): Promise<number> {
    const hoje = new Date();

    return this.visitorModel
      .countDocuments({
        residentId: moradorId,
        active: true,
        validUntil: { $gte: hoje },
      })
      .exec();
  }
}
