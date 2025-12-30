import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AccessHistory,
  AccessHistoryDocument,
  PersonType,
  AccessType,
  AccessMethod,
} from './schemas/access-history.schema';
import { PaginationDto } from '../common/dto/pagination.dto';
import { DateUtil } from '../shared/utils/date.util';

export interface CreateHistoricoDto {
  condominioId: string;
  moradorId?: string;
  visitanteId?: string;
  veiculoId?: string;
  tipoPessoa: PersonType;
  tipoAcesso: AccessType;
  pontoAcesso: string;
  metodoAcesso?: AccessMethod;
  cameraId?: string;
  fotoUrl?: string;
  observacoes?: string;
}

export interface HistoricoFilter {
  dataInicio?: Date;
  dataFim?: Date;
  tipo?: AccessType;
  tipoPessoa?: PersonType;
}

@Injectable()
export class HistoricoService {
  constructor(
    @InjectModel(AccessHistory.name, 'portal-cliente')
    private historyModel: Model<AccessHistoryDocument>,
  ) {}

  async registrarAcesso(
    createDto: CreateHistoricoDto,
  ): Promise<AccessHistoryDocument> {
    const history = new this.historyModel({
      condominiumId: createDto.condominioId,
      residentId: createDto.moradorId,
      visitorId: createDto.visitanteId,
      vehicleId: createDto.veiculoId,
      personType: createDto.tipoPessoa,
      accessType: createDto.tipoAcesso,
      accessPoint: createDto.pontoAcesso,
      accessMethod: createDto.metodoAcesso,
      cameraId: createDto.cameraId,
      photoUrl: createDto.fotoUrl,
      notes: createDto.observacoes,
      timestamp: new Date(),
    });

    return history.save();
  }

  async findByMorador(
    moradorId: string,
    paginationDto: PaginationDto,
    filter?: HistoricoFilter,
  ) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const query: any = {
      $or: [{ residentId: moradorId }, { 'visitor.residentId': moradorId }],
    };

    if (filter?.dataInicio) {
      query.timestamp = { $gte: DateUtil.inicioDoDia(filter.dataInicio) };
    }

    if (filter?.dataFim) {
      query.timestamp = {
        ...query.timestamp,
        $lte: DateUtil.fimDoDia(filter.dataFim),
      };
    }

    if (filter?.tipo) {
      query.accessType = filter.tipo;
    }

    if (filter?.tipoPessoa) {
      query.personType = filter.tipoPessoa;
    }

    const [data, total] = await Promise.all([
      this.historyModel
        .find(query)
        .populate('residentId', 'name unit')
        .populate('visitorId', 'name document')
        .populate('vehicleId', 'licensePlate brand model')
        .skip(skip)
        .limit(limit)
        .sort({ timestamp: -1 })
        .exec(),
      this.historyModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByCondominio(
    condominioId: string,
    paginationDto: PaginationDto,
    filter?: HistoricoFilter,
  ) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const query: any = { condominiumId: condominioId };

    if (filter?.dataInicio) {
      query.timestamp = { $gte: DateUtil.inicioDoDia(filter.dataInicio) };
    }

    if (filter?.dataFim) {
      query.timestamp = {
        ...query.timestamp,
        $lte: DateUtil.fimDoDia(filter.dataFim),
      };
    }

    if (filter?.tipo) {
      query.accessType = filter.tipo;
    }

    if (filter?.tipoPessoa) {
      query.personType = filter.tipoPessoa;
    }

    const [data, total] = await Promise.all([
      this.historyModel
        .find(query)
        .populate('residentId', 'name unit')
        .populate('visitorId', 'name document')
        .populate('vehicleId', 'licensePlate brand model')
        .skip(skip)
        .limit(limit)
        .sort({ timestamp: -1 })
        .exec(),
      this.historyModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async countAcessosMes(moradorId: string): Promise<number> {
    const inicioMes = DateUtil.inicioDoMes();
    const fimMes = DateUtil.fimDoMes();

    return this.historyModel
      .countDocuments({
        residentId: moradorId,
        timestamp: { $gte: inicioMes, $lte: fimMes },
      })
      .exec();
  }

  async getAcessosRecentes(
    condominioId: string,
    limit: number = 10,
  ): Promise<AccessHistoryDocument[]> {
    return this.historyModel
      .find({ condominiumId: condominioId })
      .populate('residentId', 'name unit')
      .populate('visitorId', 'name')
      .limit(limit)
      .sort({ timestamp: -1 })
      .exec();
  }

  async getEstatisticasCondominio(condominioId: string) {
    const hoje = DateUtil.inicioDoDia();
    const fimHoje = DateUtil.fimDoDia();

    const [acessosHoje, acessosMes] = await Promise.all([
      this.historyModel.countDocuments({
        condominiumId: condominioId,
        timestamp: { $gte: hoje, $lte: fimHoje },
      }),
      this.historyModel.countDocuments({
        condominiumId: condominioId,
        timestamp: {
          $gte: DateUtil.inicioDoMes(),
          $lte: DateUtil.fimDoMes(),
        },
      }),
    ]);

    return {
      acessosHoje,
      acessosMes,
    };
  }
}
