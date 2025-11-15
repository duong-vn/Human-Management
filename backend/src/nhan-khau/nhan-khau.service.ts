import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateNhanKhauDto } from './dto/create-nhan-khau.dto';
import { UpdateNhanKhauDto } from './dto/update-nhan-khau.dto';
import { NhanKhau, NhanKhauDocument } from './schemas/nhan-khau.schema';

@Injectable()
export class NhanKhauService {
  constructor(
    @InjectModel(NhanKhau.name) private nhanKhauModel: Model<NhanKhauDocument>,
  ) {}

  async create(createNhanKhauDto: CreateNhanKhauDto): Promise<NhanKhau> {
    const createdNhanKhau = new this.nhanKhauModel(createNhanKhauDto);
    return createdNhanKhau.save();
  }

  async findAll(): Promise<NhanKhau[]> {
    return this.nhanKhauModel.find().populate('hoKhauId').exec();
  }

  async findOne(id: string): Promise<NhanKhau | null> {
    return this.nhanKhauModel.findById(id).populate('hoKhauId').exec();
  }

  async findByCCCD(cccd: string): Promise<NhanKhau | null> {
    return this.nhanKhauModel.findOne({ cccd }).populate('hoKhauId').exec();
  }

  async findByHoKhau(hoKhauId: string): Promise<NhanKhau[]> {
    return this.nhanKhauModel.find({ hoKhauId }).populate('hoKhauId').exec();
  }

  async update(
    id: string,
    updateNhanKhauDto: UpdateNhanKhauDto,
  ): Promise<NhanKhau | null> {
    return this.nhanKhauModel
      .findByIdAndUpdate(id, updateNhanKhauDto, { new: true })
      .populate('hoKhauId')
      .exec();
  }

  async remove(id: string): Promise<NhanKhau | null> {
    return this.nhanKhauModel.findByIdAndDelete(id).exec();
  }
}
