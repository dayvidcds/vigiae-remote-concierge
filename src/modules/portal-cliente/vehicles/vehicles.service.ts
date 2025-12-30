import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle, VehicleDocument } from './schemas/vehicle.schema';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { ValidationUtil } from '../shared/utils/validation.util';

@Injectable()
export class VeiculosService {
  constructor(
    @InjectModel(Vehicle.name, 'portal-cliente')
    private vehicleModel: Model<VehicleDocument>,
  ) {}

  async create(
    moradorId: string,
    createDto: CreateVehicleDto,
  ): Promise<VehicleDocument> {
    const { placa, ano } = createDto;

    // Valida e formata placa
    if (!ValidationUtil.validarPlaca(placa)) {
      throw new BadRequestException(
        'Placa inválida. Use formato ABC-1234 ou ABC1D23',
      );
    }

    const placaFormatada = ValidationUtil.formatarPlaca(placa);

    // Verifica se placa já existe
    const veiculoExistente = await this.vehicleModel.findOne({
      licensePlate: placaFormatada,
    });

    if (veiculoExistente) {
      throw new ConflictException('Placa já cadastrada');
    }

    // Valida ano
    if (ano && !ValidationUtil.validarAnoVeiculo(ano)) {
      throw new BadRequestException('Ano inválido');
    }

    const vehicle = new this.vehicleModel({
      residentId: moradorId,
      type: createDto.tipo,
      licensePlate: placaFormatada,
      brand: createDto.marca,
      model: createDto.modelo,
      color: createDto.cor,
      year: createDto.ano,
      fuel: createDto.combustivel,
      notes: createDto.observacoes,
      active: true,
    });

    return vehicle.save();
  }

  async findAll(moradorId: string): Promise<VehicleDocument[]> {
    return this.vehicleModel
      .find({ residentId: moradorId, active: true })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, moradorId: string): Promise<VehicleDocument> {
    const vehicle = await this.vehicleModel.findById(id).exec();

    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }

    if (vehicle.residentId.toString() !== moradorId) {
      throw new ForbiddenException('Você não pode acessar este veículo');
    }

    return vehicle;
  }

  async update(
    id: string,
    moradorId: string,
    updateDto: UpdateVehicleDto,
  ): Promise<VehicleDocument> {
    const vehicle = await this.findOne(id, moradorId);

    if (updateDto.placa) {
      if (!ValidationUtil.validarPlaca(updateDto.placa)) {
        throw new BadRequestException(
          'Placa inválida. Use formato ABC-1234 ou ABC1D23',
        );
      }
      const placaFormatada = ValidationUtil.formatarPlaca(updateDto.placa);

      // Verifica se nova placa já existe (exceto para o veículo atual)
      const veiculoExistente = await this.vehicleModel.findOne({
        licensePlate: placaFormatada,
        _id: { $ne: id },
      });

      if (veiculoExistente) {
        throw new ConflictException('Placa já cadastrada');
      }
      
      vehicle.licensePlate = placaFormatada;
    }

    if (updateDto.ano && !ValidationUtil.validarAnoVeiculo(updateDto.ano)) {
      throw new BadRequestException('Ano inválido');
    }

    if (updateDto.tipo !== undefined) vehicle.type = updateDto.tipo;
    if (updateDto.marca !== undefined) vehicle.brand = updateDto.marca;
    if (updateDto.modelo !== undefined) (vehicle as any).model = updateDto.modelo;
    if (updateDto.cor !== undefined) vehicle.color = updateDto.cor;
    if (updateDto.ano !== undefined) vehicle.year = updateDto.ano;
    if (updateDto.combustivel !== undefined) vehicle.fuel = updateDto.combustivel;
    if (updateDto.observacoes !== undefined) vehicle.notes = updateDto.observacoes;

    return vehicle.save();
  }

  async remove(id: string, moradorId: string): Promise<{ mensagem: string }> {
    const vehicle = await this.findOne(id, moradorId);

    vehicle.active = false;
    await vehicle.save();

    return { mensagem: 'Veículo removido com sucesso' };
  }

  async count(moradorId: string): Promise<number> {
    return this.vehicleModel.countDocuments({ residentId: moradorId, active: true }).exec();
  }
}
