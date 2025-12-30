import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserPortal, UserPortalDocument, UserType } from './schemas/user-portal.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QRCodeUtil } from '../shared/utils/qrcode.util';
import { ValidationUtil } from '../shared/utils/validation.util';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(UserPortal.name, 'portal-cliente')
    private userModel: Model<UserPortalDocument>,
  ) {}

  async create(condominioId: string, createUserDto: CreateUserDto): Promise<UserPortalDocument> {
    const { email, senha, cpf, telefone } = createUserDto;

    // Verifica se email já existe
    const existingUser = await this.userModel.findOne({
      condominioId,
      email,
    });

    if (existingUser) {
      throw new ConflictException('Email already registered in this condominium');
    }

    // Valida CPF se fornecido
    if (cpf && !ValidationUtil.validarCPF(cpf)) {
      throw new BadRequestException('Invalid CPF');
    }

    // Valida telefone se fornecido
    if (telefone && !ValidationUtil.validarTelefone(telefone)) {
      throw new BadRequestException('Invalid phone. Use format: (11) 98765-4321');
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Gera código de acesso único
    const prefixo = createUserDto.tipoUsuario === UserType.ADMIN ? 'ADM' : 'MOR';
    const identificador = createUserDto.unidade || email.split('@')[0].substring(0, 5);
    const codigoAcesso = QRCodeUtil.gerarCodigoAcesso(prefixo, identificador);

    const user = new this.userModel({
      condominiumId: condominioId,
      name: createUserDto.nome,
      email: createUserDto.email,
      passwordHash: senhaHash,
      userType: createUserDto.tipoUsuario,
      unit: createUserDto.unidade,
      phone: createUserDto.telefone,
      document: cpf ? ValidationUtil.limparDocumento(cpf) : undefined,
      accessCode: codigoAcesso,
      active: true,
    });

    return user.save();
  }

  async findAll(
    condominioId: string,
    paginationDto: PaginationDto,
    search?: string,
    tipoUsuario?: UserType,
  ) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const filter: any = { condominiumId: condominioId, active: true };

    if (tipoUsuario) {
      filter.userType = tipoUsuario;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { unit: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-passwordHash')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.userModel.countDocuments(filter).exec(),
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

  async findOne(id: string): Promise<UserPortalDocument> {
    const user = await this.userModel
      .findById(id)
      .select('-passwordHash')
      .populate('condominiumId', 'name')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string, condominiumId: string): Promise<UserPortalDocument | null> {
    return this.userModel
      .findOne({ email, condominiumId, active: true })
      .exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserPortalDocument> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Valida CPF se fornecido
    if (updateUserDto.cpf && !ValidationUtil.validarCPF(updateUserDto.cpf)) {
      throw new BadRequestException('Invalid CPF');
    }

    // Valida telefone se fornecido
    if (updateUserDto.telefone && !ValidationUtil.validarTelefone(updateUserDto.telefone)) {
      throw new BadRequestException('Invalid phone. Use format: (11) 98765-4321');
    }

    // Atualiza senha se fornecida
    if (updateUserDto.senha) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(updateUserDto.senha, salt);
    }

    // Mapear DTO para schema
    if (updateUserDto.nome) user.name = updateUserDto.nome;
    if (updateUserDto.email) user.email = updateUserDto.email;
    if (updateUserDto.tipoUsuario) user.userType = updateUserDto.tipoUsuario;
    if (updateUserDto.unidade !== undefined) user.unit = updateUserDto.unidade;
    if (updateUserDto.telefone !== undefined) user.phone = updateUserDto.telefone;
    if (updateUserDto.cpf !== undefined) {
      user.document = updateUserDto.cpf
        ? ValidationUtil.limparDocumento(updateUserDto.cpf)
        : undefined;
    }
    if (updateUserDto.ativo !== undefined) user.active = updateUserDto.ativo;

    return user.save();
  }

  async remove(id: string): Promise<{ mensagem: string }> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.active = false;
    await user.save();

    return { mensagem: 'User deactivated successfully' };
  }

  async getQRCode(userId: string) {
    const user = await this.findOne(userId);

    const qrCodeData = QRCodeUtil.gerarDadosQRCodeAcesso({
      codigo: user.accessCode,
      tipo: (user.userType === 'admin'
        ? 'morador'
        : user.userType === 'resident'
          ? 'morador'
          : 'visitor') as 'morador' | 'visitante' | 'visitor',
      nome: user.name,
      condominioId: user.condominiumId.toString(),
      unidade: user.unit,
    });

    const qrcodeBase64 = await QRCodeUtil.gerarQRCodeBase64(qrCodeData);

    return {
      codigo: user.accessCode,
      qrcodeBase64,
      tipo: user.userType,
      nome: user.name,
      unidade: user.unit,
    };
  }
}
