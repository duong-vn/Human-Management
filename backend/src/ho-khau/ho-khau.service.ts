import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateHoKhauDto } from './dto/create-ho-khau.dto';
import { UpdateHoKhauDto } from './dto/update-ho-khau.dto';
import { HoKhau, HoKhauDocument } from './schemas/ho-khau.schema';

@Injectable()
export class HoKhauService {
  constructor(
    @InjectModel(HoKhau.name) private hoKhauModel: Model<HoKhauDocument>,
  ) {}

  async create(createHoKhauDto: CreateHoKhauDto): Promise<HoKhau> {
    const createdHoKhau = new this.hoKhauModel(createHoKhauDto);
    return createdHoKhau.save();
  }

  async findAll(): Promise<HoKhau[]> {
    return this.hoKhauModel.find().exec();
  }

  async findOne(id: string): Promise<HoKhau | null> {
    return this.hoKhauModel.findById(id).exec();
  }

  async findByMaHoKhau(maHoKhau: string): Promise<HoKhau | null> {
    return this.hoKhauModel.findOne({ maHoKhau }).exec();
  }

  async update(
    id: string,
    updateHoKhauDto: UpdateHoKhauDto,
  ): Promise<HoKhau | null> {
    return this.hoKhauModel
      .findByIdAndUpdate(id, updateHoKhauDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<HoKhau | null> {
    return this.hoKhauModel.findByIdAndDelete(id).exec();
  }
}
