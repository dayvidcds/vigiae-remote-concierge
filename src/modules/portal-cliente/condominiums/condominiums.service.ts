import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Condominium, CondominiumDocument } from './schemas/condominium.schema';

@Injectable()
export class CondominiosService {
  constructor(
    @InjectModel(Condominium.name, 'portal-cliente')
    private condominiumModel: Model<CondominiumDocument>,
  ) {}

  async findOne(id: string): Promise<CondominiumDocument> {
    const condominium = await this.condominiumModel.findById(id).exec();

    if (!condominium) {
      throw new NotFoundException('Condominium not found');
    }

    return condominium;
  }

  async createOrUpdate(data: any): Promise<CondominiumDocument> {
    const { condominiumId, ...condominiumData } = data;

    const condominium = await this.condominiumModel.findByIdAndUpdate(
      condominiumId,
      condominiumData,
      {
        upsert: true,
        new: true,
      },
    );

    return condominium;
  }

  async deactivate(id: string): Promise<void> {
    const condominium = await this.findOne(id);
    condominium.active = false;
    await condominium.save();
  }
}
