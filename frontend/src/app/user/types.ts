import { SoDinhDanh } from "../nhan-khau/types";

export enum UserRole {
  TO_TRUONG = 'to_truong',
  TO_PHO = 'to_pho',
  KE_TOAN = 'ke_toan',
  CAN_BO = 'can_bo',
}

export interface User {
  _id?: string;
  id?: string;
  hoTen: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  soDienThoai?: string;
  soDinhDanh?: SoDinhDanh;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  hoTen: string;
  username: string;
  email: string;
  password: string;
  role?: UserRole;
  soDienThoai?: string;
  soDinhDanh?: SoDinhDanh;
}

export interface UpdateUserDto {
  hoTen?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
  soDienThoai?: string;
  soDinhDanh?: SoDinhDanh;
}
