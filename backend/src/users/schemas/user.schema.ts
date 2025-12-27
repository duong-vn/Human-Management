import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  TO_TRUONG = 'to_truong',
  TO_PHO = 'to_pho',
  KE_TOAN = 'ke_toan',
  CAN_BO = 'can_bo',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  hoTen: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.CAN_BO })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  soDienThoai: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
