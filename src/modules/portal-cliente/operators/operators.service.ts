import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserPortal, UserType } from '../users/schemas/user-portal.schema';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OperatorsService {
  constructor(
    @InjectModel(UserPortal.name, 'portal-cliente')
    private userPortalModel: Model<UserPortal>,
  ) {}

  async findAll(filters: any = {}) {
    const query: any = {
      active: true,
      userType: { $in: [UserType.OPERATOR, UserType.TECHNICIAN] },
    };

    if (filters.condominiumId) {
      query.$or = [
        { condominiumId: filters.condominiumId },
        { assignedCondominiums: filters.condominiumId },
      ];
    }

    if (filters.userType) {
      query.userType = filters.userType;
    }

    return this.userPortalModel
      .find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, condominiumId: string) {
    const operator = await this.userPortalModel
      .findOne({
        _id: id,
        active: true,
        userType: { $in: [UserType.OPERATOR, UserType.TECHNICIAN] },
        $or: [
          { condominiumId: condominiumId },
          { assignedCondominiums: condominiumId },
        ],
      })
      .select('-passwordHash')
      .exec();

    if (!operator) {
      throw new NotFoundException('Operator not found');
    }

    return operator;
  }

  async create(condominiumId: string, createOperatorDto: CreateOperatorDto) {
    // Verificar se email já existe
    const existingUser = await this.userPortalModel
      .findOne({ email: createOperatorDto.email })
      .exec();

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(createOperatorDto.password, 10);

    const operator = new this.userPortalModel({
      condominiumId,
      name: createOperatorDto.name,
      email: createOperatorDto.email,
      passwordHash,
      userType: createOperatorDto.userType,
      phone: createOperatorDto.phone,
      document: createOperatorDto.document,
      permissions: createOperatorDto.permissions || {
        canViewAllCondominiums: false,
        canManageVisitors: true,
        canManageVehicles: true,
        canViewReports: false,
        canManageAccess: true,
      },
      assignedCondominiums: createOperatorDto.assignedCondominiums || [condominiumId],
      needsPasswordChange: true,
      active: true,
    });

    return operator.save();
  }

  async update(id: string, condominiumId: string, updateOperatorDto: UpdateOperatorDto) {
    const operator = await this.findOne(id, condominiumId);

    if (updateOperatorDto.email && updateOperatorDto.email !== operator.email) {
      const existingUser = await this.userPortalModel
        .findOne({ email: updateOperatorDto.email, _id: { $ne: id } })
        .exec();

      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }
    }

    const updateData: any = {};

    if (updateOperatorDto.name) updateData.name = updateOperatorDto.name;
    if (updateOperatorDto.email) updateData.email = updateOperatorDto.email;
    if (updateOperatorDto.phone) updateData.phone = updateOperatorDto.phone;
    if (updateOperatorDto.document) updateData.document = updateOperatorDto.document;
    if (updateOperatorDto.permissions) updateData.permissions = updateOperatorDto.permissions;
    if (updateOperatorDto.assignedCondominiums) {
      updateData.assignedCondominiums = updateOperatorDto.assignedCondominiums;
    }
    if (updateOperatorDto.password) {
      updateData.passwordHash = await bcrypt.hash(updateOperatorDto.password, 10);
    }

    return this.userPortalModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-passwordHash')
      .exec();
  }

  async remove(id: string, condominiumId: string) {
    const operator = await this.findOne(id, condominiumId);

    operator.active = false;
    await operator.save();

    return { message: 'Operator deactivated successfully' };
  }

  async getDashboard(userId: string) {
    const operator = await this.userPortalModel
      .findById(userId)
      .select('-passwordHash')
      .exec();

    if (!operator) {
      throw new NotFoundException('Operator not found');
    }

    return {
      name: operator.name,
      email: operator.email,
      userType: operator.userType,
      permissions: operator.permissions,
      assignedCondominiums: operator.assignedCondominiums,
      needsPasswordChange: operator.needsPasswordChange,
    };
  }

  async getAssignedCondominiums(userId: string) {
    const operator = await this.userPortalModel
      .findById(userId)
      .populate('assignedCondominiums')
      .exec();

    if (!operator) {
      throw new NotFoundException('Operator not found');
    }

    return operator.assignedCondominiums || [];
  }
}
