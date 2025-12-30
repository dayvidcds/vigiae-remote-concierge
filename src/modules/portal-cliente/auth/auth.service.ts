import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserPortal, UserPortalDocument } from '../users/schemas/user-portal.schema';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserPortal.name, 'portal-cliente')
    private userModel: Model<UserPortalDocument>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, senha, tipoUsuario } = loginDto;

    // Busca usuário
    const user = await this.userModel
      .findOne({ email, userType: tipoUsuario, active: true })
      .populate('condominiumId', 'name')
      .exec();

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verifica senha
    const senhaValida = await bcrypt.compare(senha, user.passwordHash);

    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gera token
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      tipoUsuario: user.userType,
      condominioId: user.condominiumId._id.toString(),
      unidade: user.unit,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      user: {
        id: user._id,
        nome: user.name,
        email: user.email,
        tipoUsuario: user.userType,
        condominioId: user.condominiumId._id,
        condominioNome: (user.condominiumId as any).name,
        unidade: user.unit,
        codigoAcesso: user.accessCode,
        precisaTrocarSenha: user.needsPasswordChange,
      },
    };
  }

  async alterarSenha(userId: string, alterarSenhaDto: ChangePasswordDto) {
    const { senhaAtual, novaSenha } = alterarSenhaDto;

    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // Verifica senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, user.passwordHash);

    if (!senhaValida) {
      throw new BadRequestException('Senha atual incorreta');
    }

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(novaSenha, salt);
    user.needsPasswordChange = false;

    await user.save();

    return {
      mensagem: 'Senha alterada com sucesso',
    };
  }

  async validarUsuario(userId: string): Promise<UserPortalDocument> {
    const user = await this.userModel.findById(userId).populate('condominiumId').exec();

    if (!user || !user.active) {
      throw new UnauthorizedException('Usuário inválido ou inativo');
    }

    return user;
  }
}
